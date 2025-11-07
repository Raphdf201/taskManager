let lastScroll = 0;
const header = document.querySelector('.header');
let currentFilter = 'all';
let allTasks = [];
let isEditMode = false;
let editingTaskId = null;
let statsVisible = true;
let hasAnimated = false;

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

    setTimeout(() => {
        headerLogo.classList.remove('stats-hidden');
    }, 500);
}

function animateStats() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
    });
}

function animateTasksOnLoad() {
    if (hasAnimated) return;

    const tasks = document.querySelectorAll('.task-card');
    tasks.forEach((task, index) => {
        setTimeout(() => {
            task.classList.add('visible');
        }, 300 + (index * 75));
    });

    hasAnimated = true;
}

let scrollTimeout;

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Debounce the active button update
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const sections = document.querySelectorAll('section');
        const navButtons = document.querySelectorAll('.header-nav-btn');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (currentScroll >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-section') === current) {
                btn.classList.add('active');
            }
        });
    }, 100); // Wait 100ms after scrolling stops

    lastScroll = currentScroll;
});

function setActiveButton(button) {
    document.querySelectorAll('.header-nav-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// Add click event listeners to navigation buttons
document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.header-nav-btn');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            setActiveButton(button);
        });
    });
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
    if (isOverdue(task.dueDate) && task.status !== 'done') return 'overdue';
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

        users.forEach((user, index) => {
            creatorData[index + 1] = {
                name: user.name,
                profileIcon: user.profileIcon,
                color: getRandomColor(index),
                initials: getInitials(user.name)
            };
        });

        populateAssigneeDropdown(users);

        console.log('Users loaded:', creatorData);

    } catch (error) {
        console.error('Error fetching users:', error);
        creatorData = {
            1: {name: 'User 1', color: '#ec4899', initials: 'U1'}
        };
    }
}

function populateAssigneeDropdown(users) {
    const dropdown = document.getElementById('task-assignee');

    dropdown.innerHTML = '<option value="">Sélectionner un membre</option>';

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
    if (status === 'in_progress' || status === 'overdue') return 'clock';
    return 'circle';
}

function getStatusColor(task) {
    const status = getTaskStatus(task);
    if (status === 'done') return '#10b981';
    if (status === 'overdue') return '#ef4444';
    if (status === 'in_progress') return '#3b82f6';
    return '#6b7280';
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
        allTasks = tasks;

        updateStats(tasks);
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
        done: 0,
        overdue: 0
    };

    tasks.forEach(task => {
        const status = getTaskStatus(task);
        if (status === 'done') stats.done++;
        else if (status === 'overdue') stats.overdue++;
        else if (status === 'in_progress') stats.in_progress++;
        else stats.todo++;
    });

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-todo').textContent = stats.todo;
    document.getElementById('stat-progress').textContent = stats.in_progress;
    document.getElementById('stat-done').textContent = stats.done;

    const overdueEl = document.getElementById('stat-overdue');
    if (overdueEl) {
        overdueEl.textContent = stats.overdue;
    }
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
            'done': 'Aucune tâche terminée',
            'overdue': 'Aucune tâche en retard'
        };
        container.innerHTML = `<div style="text-align: center; padding: 2rem;">${filterLabel[currentFilter]}</div>`;
        return;
    }

    container.innerHTML = filteredTasks.map(task => createTaskCard(task)).join('');

    if (!hasAnimated) {
        setTimeout(() => animateTasksOnLoad(), 100);
    } else {
        const tasks = document.querySelectorAll('.task-card');
        tasks.forEach(task => task.classList.add('visible'));
    }

    lucide.createIcons();
}

function filterTasks(filter) {
    currentFilter = filter;

    document.querySelectorAll('.stat-card').forEach(card => {
        card.classList.remove('active-filter');
    });

    const filterMap = {
        'all': 0,
        'todo': 1,
        'in_progress': 2,
        'done': 3,
        'overdue': 4
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

    const task = allTasks.find(t => t.id === taskId);

    if (!task) {
        alert('Tâche non trouvée');
        return;
    }

    isEditMode = true;
    editingTaskId = taskId;

    document.getElementById('modal-title').textContent = 'Modifier la tâche';
    document.getElementById('submit-btn').textContent = 'Mettre à jour';

    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description;
    document.getElementById('task-date').value = task.dueDate;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-assignee').value = task.creatorId;

    document.getElementById('modal').classList.add('active');
}

async function checkAuthentication() {
    try {
        const response = await fetch('/isLoggedIn', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return true;
        }

        if (response.status === 401) {
            window.location.href = '/loginPage/loginPage.html';
            return false;
        }

        if (!response.ok) {
            console.error('Authentication check failed:', response.status);
            return false;
        }

        return false;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
        console.log('User not authenticated');
    } else {
        console.log('User authenticated');
    }

    await fetchUsers();
    await fetchTasks();

    setTimeout(() => animateStats(), 200);

    // Add click event listeners to navigation buttons
    const navButtons = document.querySelectorAll('.header-nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            setActiveButton(button);
        });
    });
});

lucide.createIcons();