let lastScroll = 0;
const header = document.querySelector('.header');
let currentFilter = 'all'; // Track current filter
let allTasks = []; // Store all tasks
let isEditMode = false;
let editingTaskId = null;

function checkVisibility() {
    const tasks = document.querySelectorAll('.task-card');
    tasks.forEach((task, index) => {
        const taskTop = task.getBoundingClientRect().top;
        const taskBottom = task.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;

        if (taskTop < windowHeight - 1 && taskBottom > 0) {
            setTimeout(() => {
                task.classList.add('visible');
            }, index * 75);
        } else if (taskBottom < 0 || taskTop > windowHeight) {
            task.classList.remove('visible');
        }
    });
}

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }

    lastScroll = currentScroll;
    checkVisibility();
});

function openModal() {
    isEditMode = false;
    editingTaskId = null;
    document.getElementById('modal-title').textContent = 'Nouvelle tâche';
    document.getElementById('submit-btn').textContent = 'Créer la tâche';
    document.getElementById('task-form').reset();
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    isEditMode = false;
    editingTaskId = null;
    document.getElementById('task-form').reset();
}

const API_URL = 'https://commtasks.raphdf201.net/tasks';
const USERS_API_URL = 'https://commtasks.raphdf201.net/users';

let creatorData = {};

function isOverdue(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
}

function getTaskStatus(task) {
    if (task.status === 'done') return 'done';
    if (task.status === 'in_progress') return 'in_progress';
    if (isOverdue(task.dueDate) && task.status !== 'done') return 'in_progress';
    return 'todo';
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function getRandomColor(index) {
    const colors = ['#ec4899', '#6366f1', '#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#f97316'];
    return colors[index % colors.length];
}

async function fetchUsers() {
    try {
        const response = await fetch(USERS_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();

        // Transform users array into creatorData object
        users.forEach((user, index) => {
            creatorData[index + 1] = {
                name: user.name,
                profileIcon: user.profileIcon,
                color: getRandomColor(index),
                initials: getInitials(user.name)
            };
        });

        // Populate the assignee dropdown
        populateAssigneeDropdown(users);

        console.log('Users loaded:', creatorData);

    } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to default users if API fails
        creatorData = {
            1: { name: 'User 1', color: '#ec4899', initials: 'U1' }
        };
    }
}

function populateAssigneeDropdown(users) {
    const dropdown = document.getElementById('task-assignee');

    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Sélectionner un membre</option>';

    // Add users to dropdown
    users.forEach((user, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = user.name;
        dropdown.appendChild(option);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    if (isOverdue(dateString)) {
        return `<span style="color: #ef4444; font-weight: 500;">${formatted} (En retard)</span>`;
    }

    return formatted;
}

function getStatusIcon(task) {
    const status = getTaskStatus(task);
    if (status === 'done') return 'check-circle-2';
    if (status === 'in_progress') return 'clock';
    return 'circle';
}

function getStatusColor(task) {
    const status = getTaskStatus(task);
    if (status === 'done') return '#10b981';
    if (status === 'in_progress') return '#3b82f6';
    return '#ff999c';
}

function createTaskCard(task) {
    const statusIcon = getStatusIcon(task);
    const statusColor = getStatusColor(task);
    const creator = creatorData[task.creatorId] || {
        name: `User ${task.creatorId}`,
        color: '#64748b',
        initials: 'U' + task.creatorId,
        profileIcon: null
    };

    // Use profile icon if available, otherwise use avatar with initials
    const avatarHTML = creator.profileIcon
        ? `<img src="${creator.profileIcon}" alt="${creator.name}" class="avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`
        : `<div class="avatar" style="background: ${creator.color};">${creator.initials}</div>`;

    return `
        <div class="task-card" data-task-id="${task.id}">
            <div class="task-content">
                <div class="task-main">
                    <div class="task-header">
                        <i data-lucide="${statusIcon}"
                           style="width: 20px; height: 20px; color: ${statusColor}; flex-shrink: 0; margin-top: 2px;"></i>
                        <div style="flex: 1;">
                            <div class="task-title">${task.title}</div>
                            <div class="task-description">${task.description}</div>
                            <div class="task-meta">
                                <div class="member-info">
                                    <i data-lucide="calendar" style="width: 16px; height: 16px; color: #64748b;"></i>
                                    <span>${formatDate(task.dueDate)}</span>
                                </div>
                                <div class="member-info">
                                    ${avatarHTML}
                                    <span>${creator.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-edit" onclick="editTask(${task.id})">
                        <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

async function fetchTasks() {
    const container = document.getElementById('tasks-container');

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tasks = await response.json();
        allTasks = tasks; // Store all tasks globally

        // Update stats
        updateStats(tasks);

        // Filter and display tasks
        displayFilteredTasks();

    } catch (error) {
        console.error('Error fetching tasks:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                Erreur lors du chargement des tâches: ${error.message}
            </div>
        `;
    }
}

function updateStats(tasks) {
    const stats = {
        total: tasks.length,
        todo: 0,
        in_progress: 0,
        done: 0
    };

    tasks.forEach(task => {
        const status = getTaskStatus(task);
        if (status === 'done') stats.done++;
        else if (status === 'in_progress') stats.in_progress++;
        else stats.todo++;
    });

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-todo').textContent = stats.todo;
    document.getElementById('stat-progress').textContent = stats.in_progress;
    document.getElementById('stat-done').textContent = stats.done;
}

function displayFilteredTasks() {
    const container = document.getElementById('tasks-container');

    let filteredTasks = allTasks;

    if (currentFilter !== 'all') {
        filteredTasks = allTasks.filter(task => getTaskStatus(task) === currentFilter);
    }

    if (filteredTasks.length === 0) {
        const filterLabel = {
            'all': 'Aucune tâche trouvée',
            'todo': 'Aucune tâche à faire',
            'in_progress': 'Aucune tâche en cours',
            'done': 'Aucune tâche terminée'
        };
        container.innerHTML = `<div style="text-align: center; padding: 2rem;">${filterLabel[currentFilter]}</div>`;
        return;
    }

    container.innerHTML = filteredTasks.map(task => createTaskCard(task)).join('');

    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Trigger visibility check after rendering
    setTimeout(() => checkVisibility(), 100);
}

function filterTasks(filter) {
    currentFilter = filter;

    // Update active state on stat cards
    document.querySelectorAll('.stat-card').forEach(card => {
        card.classList.remove('active-filter');
    });

    const filterMap = {
        'all': 0,
        'todo': 1,
        'in_progress': 2,
        'done': 3
    };

    const activeCard = document.querySelectorAll('.stat-card')[filterMap[filter]];
    if (activeCard) {
        activeCard.classList.add('active-filter');
    }

    displayFilteredTasks();
}

async function submitTask(event) {
    if (event) {
        event.preventDefault();
    }

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = isEditMode ? 'Mise à jour...' : 'Envoi en cours...';

    try {
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-date').value,
            status: document.getElementById('task-status').value || 'todo',
            priority: document.getElementById('task-priority').value || 'medium',
            creatorId: parseInt(document.getElementById('task-assignee').value) || 1
        };

        console.log('Sending task data:', taskData);

        const url = isEditMode ? `${API_URL}/${editingTaskId}` : API_URL;
        const method = isEditMode ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorData}`);
        }

        const result = await response.json();
        console.log(isEditMode ? 'Task updated successfully:' : 'Task created successfully:', result);

        closeModal();
        document.getElementById('task-form').reset();

        // Refresh the task list
        await fetchTasks();

    } catch (error) {
        console.error('Error saving task:', error);

        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            alert('Erreur CORS: Le serveur doit autoriser les requêtes depuis votre domaine.\n\nVérifiez que votre API autorise les CORS headers.');
        } else {
            alert('Erreur lors de la sauvegarde de la tâche: ' + error.message);
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function deleteTask(taskId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        return;
    }

    try {
        console.log('Deleting task:', taskId);

        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Task deleted successfully:', taskId);

        // Add fade out animation before removing
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskCard) {
            taskCard.style.transition = 'all 0.3s ease';
            taskCard.style.opacity = '0';
            taskCard.style.transform = 'translateX(-100px)';

            setTimeout(async () => {
                await fetchTasks();
            }, 300);
        } else {
            await fetchTasks();
        }

    } catch (error) {
        console.error('Error deleting task:', error);

        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            alert('Erreur CORS: Le serveur doit autoriser les requêtes depuis votre domaine.');
        } else {
            alert('Erreur lors de la suppression de la tâche: ' + error.message);
        }
    }
}

async function editTask(taskId) {
    console.log('Edit task:', taskId);

    // Find the task in allTasks
    const task = allTasks.find(t => t.id === taskId);

    if (!task) {
        alert('Tâche non trouvée');
        return;
    }

    // Set edit mode
    isEditMode = true;
    editingTaskId = taskId;

    // Update modal title and button text
    document.getElementById('modal-title').textContent = 'Modifier la tâche';
    document.getElementById('submit-btn').textContent = 'Mettre à jour';

    // Populate form with task data
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    document.getElementById('task-date').value = task.dueDate;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-assignee').value = task.creatorId;

    // Open modal
    document.getElementById('modal').classList.add('active');
}

// Load users and tasks when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await fetchUsers(); // Load users first
    await fetchTasks(); // Then load tasks
    lucide.createIcons();
});

// Initialize Lucide icons
if (window.lucide) {
    lucide.createIcons();
}