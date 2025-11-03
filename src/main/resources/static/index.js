var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var lastScroll = 0;
var header = document.querySelector('.header');
var API_URL = 'https://commtasks.raphdf201.net';
var currentFilter = 'all';
var allTasks = [];
var isEditMode = false;
var editingTaskId = null;
var statsVisible = true;
function toggleStats() {
    var statsGrid = document.querySelector('.stats-grid');
    var headerLogo = document.querySelector('.header-logo');
    var tasksList = document.querySelector('.tasks-list');
    statsVisible = !statsVisible;
    if (statsVisible) {
        statsGrid.classList.remove('hidden');
        headerLogo.classList.remove('stats-hidden');
        tasksList.classList.remove('stats-hidden');
    }
    else {
        statsGrid.classList.add('hidden');
        headerLogo.classList.add('stats-hidden');
        tasksList.classList.add('stats-hidden');
    }
    // Trigger the logo animation
    setTimeout(function () {
        headerLogo.classList.remove('stats-hidden');
    }, 500);
}
function checkVisibility() {
    var tasks = document.querySelectorAll('.task-card');
    tasks.forEach(function (task, index) {
        var taskTop = task.getBoundingClientRect().top;
        var taskBottom = task.getBoundingClientRect().bottom;
        var windowHeight = window.innerHeight;
        if (taskTop < windowHeight - 1 && taskBottom > 0) {
            setTimeout(function () {
                task.classList.add('visible');
            }, index * 75);
        }
        else if (taskBottom < 0 || taskTop > windowHeight) {
            task.classList.remove('visible');
        }
    });
}
window.addEventListener('scroll', function () {
    var currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('hidden');
    }
    else {
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
var creatorData = {};
function isOverdue(dueDate) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
}
function getTaskStatus(task) {
    if (task.status === 'done')
        return 'done';
    if (task.status === 'in_progress')
        return 'in_progress';
    if (isOverdue(task.dueDate) && task.status !== 'done')
        return 'in_progress';
    return 'todo';
}
function getInitials(name) {
    return name
        .split(' ')
        .map(function (word) { return word[0]; })
        .join('')
        .toUpperCase()
        .substring(0, 2);
}
function getRandomColor(index) {
    var colors = ['#ec4899', '#6366f1', '#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#f97316'];
    return colors[index % colors.length];
}
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var response, users, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(API_URL + "/users")];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    users = _a.sent();
                    // Transform users array into creatorData object
                    users.forEach(function (user, index) {
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
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error fetching users:', error_1);
                    // Fallback to default users if API fails
                    creatorData = {
                        1: { name: 'User 1', color: '#ec4899', initials: 'U1' }
                    };
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function populateAssigneeDropdown(users) {
    var dropdown = document.getElementById('task-assignee');
    // Clear existing options except the first one
    dropdown.innerHTML = '<option value="">Sélectionner un membre</option>';
    // Add users to dropdown
    users.forEach(function (user, index) {
        var option = document.createElement('option');
        option.value = index + 1;
        option.textContent = user.name;
        dropdown.appendChild(option);
    });
}
function formatDate(dateString) {
    var date = new Date(dateString);
    var formatted = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    if (isOverdue(dateString)) {
        return "<span style=\"color: #ef4444; font-weight: 500;\">".concat(formatted, " (En retard)</span>");
    }
    return formatted;
}
function getStatusIcon(task) {
    var status = getTaskStatus(task);
    if (status === 'done')
        return 'check-circle-2';
    if (status === 'in_progress')
        return 'clock';
    return 'circle';
}
function getStatusColor(task) {
    var status = getTaskStatus(task);
    if (status === 'done')
        return '#10b981';
    if (status === 'in_progress')
        return '#3b82f6';
    return '#ff999c';
}
function createTaskCard(task) {
    var statusIcon = getStatusIcon(task);
    var statusColor = getStatusColor(task);
    var creator = creatorData[task.creatorId] || {
        name: "User ".concat(task.creatorId),
        color: '#64748b',
        initials: 'U' + task.creatorId,
        profileIcon: null
    };
    // Use profile icon if available, otherwise use avatar with initials
    var avatarHTML = creator.profileIcon
        ? "<img src=\"".concat(creator.profileIcon, "\" alt=\"").concat(creator.name, "\" class=\"avatar\" style=\"width: 32px; height: 32px; border-radius: 50%; object-fit: cover;\">")
        : "<div class=\"avatar\" style=\"background: ".concat(creator.color, ";\">").concat(creator.initials, "</div>");
    return "\n        <div class=\"task-card\" data-task-id=\"".concat(task.id, "\">\n            <div class=\"task-content\">\n                <div class=\"task-main\">\n                    <div class=\"task-header\">\n                        <i data-lucide=\"").concat(statusIcon, "\"\n                           style=\"width: 20px; height: 20px; color: ").concat(statusColor, "; flex-shrink: 0; margin-top: 2px;\"></i>\n                        <div style=\"flex: 1;\">\n                            <div class=\"task-title\">").concat(task.title, "</div>\n                            <div class=\"task-description\">").concat(task.description, "</div>\n                            <div class=\"task-meta\">\n                                <div class=\"member-info\">\n                                    <i data-lucide=\"calendar\" style=\"width: 16px; height: 16px; color: #64748b;\"></i>\n                                    <span>").concat(formatDate(task.dueDate), "</span>\n                                </div>\n                                <div class=\"member-info\">\n                                    ").concat(avatarHTML, "\n                                    <span>").concat(creator.name, "</span>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"task-actions\">\n                    <button class=\"btn-icon btn-edit\" onclick=\"editTask(").concat(task.id, ")\">\n                        <i data-lucide=\"edit-2\" style=\"width: 16px; height: 16px;\"></i>\n                    </button>\n                    <button class=\"btn-icon btn-delete\" onclick=\"deleteTask(").concat(task.id, ")\">\n                        <i data-lucide=\"trash-2\" style=\"width: 16px; height: 16px;\"></i>\n                    </button>\n                </div>\n            </div>\n        </div>\n    ");
}
function fetchTasks() {
    return __awaiter(this, void 0, void 0, function () {
        var container, response, tasks, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    container = document.getElementById('tasks-container');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(API_URL + "/tasks")];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    tasks = _a.sent();
                    allTasks = tasks; // Store all tasks globally
                    // Update stats
                    updateStats(tasks);
                    // Filter and display tasks
                    displayFilteredTasks();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error fetching tasks:', error_2);
                    container.innerHTML = "\n            <div style=\"text-align: center; padding: 2rem; color: #ef4444;\">\n                Erreur lors du chargement des t\u00E2ches: ".concat(error_2.message, "\n            </div>\n        ");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function updateStats(tasks) {
    var stats = {
        total: tasks.length,
        todo: 0,
        in_progress: 0,
        done: 0
    };
    tasks.forEach(function (task) {
        var status = getTaskStatus(task);
        if (status === 'done')
            stats.done++;
        else if (status === 'in_progress')
            stats.in_progress++;
        else
            stats.todo++;
    });
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-todo').textContent = String(stats.todo);
    document.getElementById('stat-progress').textContent = String(stats.in_progress);
    document.getElementById('stat-done').textContent = String(stats.done);
}
function displayFilteredTasks() {
    var container = document.getElementById('tasks-container');
    var filteredTasks = allTasks;
    if (currentFilter !== 'all') {
        filteredTasks = allTasks.filter(function (task) { return getTaskStatus(task) === currentFilter; });
    }
    if (filteredTasks.length === 0) {
        var filterLabel = {
            'all': 'Aucune tâche trouvée',
            'todo': 'Aucune tâche à faire',
            'in_progress': 'Aucune tâche en cours',
            'done': 'Aucune tâche terminée'
        };
        container.innerHTML = "<div style=\"text-align: center; padding: 2rem;\">".concat(filterLabel[currentFilter], "</div>");
        return;
    }
    container.innerHTML = filteredTasks.map(function (task) { return createTaskCard(task); }).join('');
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
    // Trigger visibility check after rendering
    setTimeout(function () { return checkVisibility(); }, 100);
}
function filterTasks(filter) {
    currentFilter = filter;
    // Update active state on stat cards
    document.querySelectorAll('.stat-card').forEach(function (card) {
        card.classList.remove('active-filter');
    });
    var filterMap = {
        'all': 0,
        'todo': 1,
        'in_progress': 2,
        'done': 3
    };
    var activeCard = document.querySelectorAll('.stat-card')[filterMap[filter]];
    if (activeCard) {
        activeCard.classList.add('active-filter');
    }
    displayFilteredTasks();
}
function submitTask(event) {
    return __awaiter(this, void 0, void 0, function () {
        var submitBtn, originalText, taskData, url, method, response, errorData, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (event) {
                        event.preventDefault();
                    }
                    submitBtn = document.getElementById('submit-btn');
                    originalText = submitBtn.textContent;
                    submitBtn.disabled = true;
                    submitBtn.textContent = isEditMode ? 'Mise à jour...' : 'Envoi en cours...';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    taskData = {
                        title: document.getElementById('task-title').value,
                        description: document.getElementById('task-description').value,
                        dueDate: document.getElementById('task-date').value,
                        status: document.getElementById('task-status').value || 'todo',
                        priority: document.getElementById('task-priority').value || 'medium',
                        creatorId: parseInt(document.getElementById('task-assignee').value) || 1
                    };
                    console.log('Sending task data:', taskData);
                    url = isEditMode ? API_URL + "/tasks/" + editingTaskId : API_URL + "/tasks";
                    method = isEditMode ? 'PUT' : 'POST';
                    return [4 /*yield*/, fetch(url, {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify(taskData)
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.text()];
                case 3:
                    errorData = _a.sent();
                    throw new Error("HTTP error! status: ".concat(response.status, " - ").concat(errorData));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _a.sent();
                    console.log(isEditMode ? 'Task updated successfully:' : 'Task created successfully:', result);
                    closeModal();
                    document.getElementById('task-form').reset();
                    // Refresh the task list
                    return [4 /*yield*/, fetchTasks()];
                case 6:
                    // Refresh the task list
                    _a.sent();
                    return [3 /*break*/, 9];
                case 7:
                    error_3 = _a.sent();
                    console.error('Error saving task:', error_3);
                    if (error_3.message.includes('Failed to fetch') || error_3.name === 'TypeError') {
                        alert('Erreur CORS: Le serveur doit autoriser les requêtes depuis votre domaine.\n\nVérifiez que votre API autorise les CORS headers.');
                    }
                    else {
                        alert('Erreur lors de la sauvegarde de la tâche: ' + error_3.message);
                    }
                    return [3 /*break*/, 9];
                case 8:
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function deleteTask(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var response, taskCard, error_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    console.log('Deleting task:', taskId);
                    return [4 /*yield*/, fetch(API_URL + "/tasks/" + taskId, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    console.log('Task deleted successfully:', taskId);
                    taskCard = document.querySelector("[data-task-id=\"".concat(taskId, "\"]"));
                    if (!taskCard) return [3 /*break*/, 3];
                    taskCard.style.transition = 'all 0.3s ease';
                    taskCard.style.opacity = '0';
                    taskCard.style.transform = 'translateX(-100px)';
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, fetchTasks()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 300);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, fetchTasks()];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_4 = _a.sent();
                    console.error('Error deleting task:', error_4);
                    if (error_4.message.includes('Failed to fetch') || error_4.name === 'TypeError') {
                        alert('Erreur CORS: Le serveur doit autoriser les requêtes depuis votre domaine.');
                    }
                    else {
                        alert('Erreur lors de la suppression de la tâche: ' + error_4.message);
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function editTask(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var task;
        return __generator(this, function (_a) {
            console.log('Edit task:', taskId);
            task = allTasks.find(function (t) { return t.id === taskId; });
            if (!task) {
                alert('Tâche non trouvée');
                return [2 /*return*/];
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
            return [2 /*return*/];
        });
    });
}
// Load users and tasks when page loads
document.addEventListener('DOMContentLoaded', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetchUsers()];
            case 1:
                _a.sent(); // Load users first
                return [4 /*yield*/, fetchTasks()];
            case 2:
                _a.sent(); // Then load tasks
                lucide.createIcons();
                return [2 /*return*/];
        }
    });
}); });
// Initialize Lucide icons
if (window.lucide) {
    lucide.createIcons();
}
