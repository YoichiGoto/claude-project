class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadTasks();
        this.renderTasks();
        this.updateStats();
    }

    bindEvents() {
        const addForm = document.getElementById('add-task-form');
        const taskInput = document.getElementById('task-input');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const clearCompletedBtn = document.getElementById('clear-completed');

        addForm.addEventListener('submit', (e) => this.handleAddTask(e));
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());

        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                taskInput.value = '';
                taskInput.blur();
            }
        });
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                this.tasks = await response.json();
            }
        } catch (error) {
            console.error('タスクの読み込みに失敗しました:', error);
            this.showMessage('タスクの読み込みに失敗しました', 'error');
        }
    }

    async handleAddTask(e) {
        e.preventDefault();
        const taskInput = document.getElementById('task-input');
        const text = taskInput.value.trim();
        
        if (!text) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const newTask = await response.json();
                this.tasks.push(newTask);
                taskInput.value = '';
                this.renderTasks();
                this.updateStats();
                this.showMessage('タスクを追加しました', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error || 'タスクの追加に失敗しました', 'error');
            }
        } catch (error) {
            console.error('タスクの追加に失敗しました:', error);
            this.showMessage('タスクの追加に失敗しました', 'error');
        }
    }

    async toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ completed: !task.completed })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const index = this.tasks.findIndex(t => t.id === taskId);
                this.tasks[index] = updatedTask;
                this.renderTasks();
                this.updateStats();
            }
        } catch (error) {
            console.error('タスクの更新に失敗しました:', error);
            this.showMessage('タスクの更新に失敗しました', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('このタスクを削除しますか？')) return;

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.renderTasks();
                this.updateStats();
                this.showMessage('タスクを削除しました', 'success');
            }
        } catch (error) {
            console.error('タスクの削除に失敗しました:', error);
            this.showMessage('タスクの削除に失敗しました', 'error');
        }
    }

    editTask(taskId) {
        this.editingTaskId = taskId;
        this.renderTasks();
    }

    async saveTaskEdit(taskId, newText) {
        if (!newText.trim()) {
            this.cancelEdit();
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: newText.trim() })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                const index = this.tasks.findIndex(t => t.id === taskId);
                this.tasks[index] = updatedTask;
                this.editingTaskId = null;
                this.renderTasks();
                this.showMessage('タスクを更新しました', 'success');
            }
        } catch (error) {
            console.error('タスクの更新に失敗しました:', error);
            this.showMessage('タスクの更新に失敗しました', 'error');
        }
    }

    cancelEdit() {
        this.editingTaskId = null;
        this.renderTasks();
    }

    async clearCompletedTasks() {
        const completedTasks = this.tasks.filter(t => t.completed);
        if (completedTasks.length === 0) {
            this.showMessage('完了済みのタスクがありません', 'info');
            return;
        }

        if (!confirm(`${completedTasks.length}個の完了済みタスクを削除しますか？`)) return;

        try {
            const response = await fetch('/api/tasks/completed', {
                method: 'DELETE'
            });

            if (response.ok) {
                this.tasks = this.tasks.filter(t => !t.completed);
                this.renderTasks();
                this.updateStats();
                this.showMessage('完了済みタスクを削除しました', 'success');
            }
        } catch (error) {
            console.error('タスクの削除に失敗しました:', error);
            this.showMessage('タスクの削除に失敗しました', 'error');
        }
    }

    handleFilterChange(e) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasks-list');
        const emptyState = document.getElementById('empty-state');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        tasksList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        const isEditing = this.editingTaskId === task.id;
        
        if (isEditing) {
            return `
                <li class="task-item ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" 
                           class="task-checkbox" 
                           ${task.completed ? 'checked' : ''} 
                           onchange="taskManager.toggleTaskCompletion(${task.id})">
                    <input type="text" 
                           class="edit-input" 
                           value="${task.text}" 
                           id="edit-input-${task.id}"
                           onkeydown="taskManager.handleEditKeydown(event, ${task.id})">
                    <div class="edit-actions">
                        <button class="save-btn" onclick="taskManager.saveEdit(${task.id})">💾 保存</button>
                        <button class="cancel-btn" onclick="taskManager.cancelEdit()">❌ キャンセル</button>
                    </div>
                </li>
            `;
        }

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" 
                       class="task-checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onchange="taskManager.toggleTaskCompletion(${task.id})">
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn" onclick="taskManager.editTask(${task.id})">✏️ 編集</button>
                    <button class="delete-btn" onclick="taskManager.deleteTask(${task.id})">🗑️ 削除</button>
                </div>
            </li>
        `;
    }

    bindTaskEvents() {
        if (this.editingTaskId) {
            const editInput = document.getElementById(`edit-input-${this.editingTaskId}`);
            if (editInput) {
                editInput.focus();
                editInput.select();
            }
        }
    }

    handleEditKeydown(event, taskId) {
        if (event.key === 'Enter') {
            this.saveEdit(taskId);
        } else if (event.key === 'Escape') {
            this.cancelEdit();
        }
    }

    saveEdit(taskId) {
        const editInput = document.getElementById(`edit-input-${taskId}`);
        if (editInput) {
            this.saveTaskEdit(taskId, editInput.value);
        }
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
    }

    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
}

const taskManager = new TaskManager();

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);