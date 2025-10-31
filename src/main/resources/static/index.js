let lastScroll = 0;
const header = document.querySelector('.header');

function checkVisibility() {
    const tasks = document.querySelectorAll('.task-card');
    tasks.forEach((task, index) => {
        const taskTop = task.getBoundingClientRect().top;
        const taskBottom = task.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;

        // Show when scrolling into view
        if (taskTop < windowHeight - 1 && taskBottom > 0) {
            setTimeout(() => {
                task.classList.add('visible');
            }, index * 75);
        }
        // Hide when scrolling out of view
        else if (taskBottom < 0 || taskTop > windowHeight) {
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
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

const API_URL = 'https://commtasks.raphdf201.net/tasks';

const creatorData = {
    1: { name: 'Sophie Martin', color: '#ec4899', initials: 'SM' },
    2: { name: 'Lucas Dubois', color: '#6366f1', initials: 'LD' },
    3: { name: 'Marie Lefebvre', color: '#06b6d4', initials: 'ML' },
    4: { name: 'Thomas Bernard', color: '#f59e0b', initials: 'TB' }
};

function isOverdue(dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
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
    if (isOverdue(task.dueDate)) {
        return 'clock';
    }
    return 'circle';
}

function getStatusColor(task) {
    if (isOverdue(task.dueDate)) {
        return '#3b82f6';
    }
    return '#64748b';
}

function createTaskCard(task) {
    const statusIcon = getStatusIcon(task);
    const statusColor = getStatusColor(task);
    const creator = creatorData[task.creatorId] || {
        name: `User ${task.creatorId}`,
        color: '#64748b',
        initials: 'U' + task.creatorId
    };

    return `
            <div class="task-card">
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
                                        <div class="avatar" style="background: ${creator.color};">${creator.initials}</div>
                                        <span>${creator.name}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon btn-edit">
                            <i data-lucide="edit-2" style="width: 16px; height: 16px;"></i>
                        </button>
                        <button class="btn-icon btn-delete">
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

        if (tasks.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem;">No tasks found</div>';
            return;
        }

        container.innerHTML = tasks.map(task => createTaskCard(task)).join('');

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

    } catch (error) {
        console.error('Error fetching tasks:', error);
        container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #ef4444;">
                    Error loading tasks: ${error.message}
                </div>
            `;
    }
}

async function submitTask(event) {
    if (event) {
        event.preventDefault();
    }

    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';

    try {
        // Send OPTIONS request first to check CORS
        const optionsResponse = await fetch(API_URL, {
            method: 'OPTIONS',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('OPTIONS response:', {
            status: optionsResponse.status,
            allowedMethods: optionsResponse.headers.get('Access-Control-Allow-Methods'),
            allowedHeaders: optionsResponse.headers.get('Access-Control-Allow-Headers'),
            allowOrigin: optionsResponse.headers.get('Access-Control-Allow-Origin')
        });

        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-date').value,
            creatorId: parseInt(document.getElementById('task-assignee').value) || 1
        };

        console.log('Sending task data:', taskData);

        const response = await fetch(API_URL, {
            method: 'POST',
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
        console.log('Task created successfully:', result);

        closeModal();
        document.getElementById('task-form').reset();

        // Refresh the task list
        await fetchTasks();

    } catch (error) {
        console.error('Error creating task:', error);

        // Check if it's a CORS error
        if (error.message.includes('Failed to fetch')) {
            alert('Erreur CORS: Le serveur doit autoriser les requêtes depuis votre domaine.\n\nVérifiez que votre API autorise les CORS headers.');
        } else {
            alert('Erreur lors de la création de la tâche: ' + error.message);
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Load tasks when page loads
fetchTasks();

lucide.createIcons();