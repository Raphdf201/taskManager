import {getValue, resetForm, setValue} from "./lib";

const header = document.querySelector('.header');
const API_URL = 'https://commtasks.raphdf201.net';
let lastScroll = 0;
let currentFilter = 'all';
let allTasks = [];
let isEditMode = false;
let editingTaskId = null;
let statsVisible = true;

function toggleStats() {
    const statsGrid = document.querySelector('.stats-grid');
    const headerLogo = document.querySelector('.header-logo');
    const tasksList = document.querySelector('.tasks-list');

    statsVisible = !statsVisible;

    if (statsVisible) {
        statsGrid.classList.remove('hidden');
        headerLogo.classList.remove('stats-hidden');
        tasksList.classList.remove('stats-hidden');
    } else {
        statsGrid.classList.add('hidden');
        headerLogo.classList.add('stats-hidden');
        tasksList.classList.add('stats-hidden');
    }

    // Trigger the logo animation
    setTimeout(() => {
        headerLogo.classList.remove('stats-hidden');
    }, 500);
}

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
    const currentScroll = window.scrollY;

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
    resetForm(document.getElementById('task-form'));
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    isEditMode = false;
    editingTaskId = null;
    resetForm(document.getElementById('task-form'));
}

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
        const response = await fetch(API_URL + "/users");

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
        const response = await fetch(API_URL + "/tasks");

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
    document.getElementById('stat-todo').textContent = String(stats.todo);
    document.getElementById('stat-progress').textContent = String(stats.in_progress);
    document.getElementById('stat-done').textContent = String(stats.done);
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

    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = isEditMode ? 'Mise à jour...' : 'Envoi en cours...';

    try {
        const taskData = {
            title: getValue(document.getElementById('task-title')),
            description: getValue(document.getElementById('task-description')),
            dueDate: getValue(document.getElementById('task-date')),
            status: getValue(document.getElementById('task-status')) || 'todo',
            priority: getValue(document.getElementById('task-priority')) || 'medium',
            creatorId: parseInt(getValue(document.getElementById('task-assignee'))) || 1
        };

        console.log('Sending task data:', taskData);

        const url = isEditMode ? API_URL + "/tasks/" + editingTaskId : API_URL + "/tasks";
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
        resetForm(document.getElementById('task-form'))

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

        const response = await fetch(API_URL + "/tasks/" + taskId, {
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
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
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
    setValue(document.getElementById('task-title'), task.title);
    setValue(document.getElementById('task-description'), task.description);
    setValue(document.getElementById('task-date'), task.dueDate);
    setValue(document.getElementById('task-status'), task.status);
    setValue(document.getElementById('task-priority'), task.priority);
    setValue(document.getElementById('task-assignee'), task.creatorId);

    // Open modal
    document.getElementById('modal').classList.add('active');
}

// Load users and tasks when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await fetchUsers(); // Load users first
    await fetchTasks(); // Then load tasks
    lucide.createIcons();
});

lucide.createIcons();
