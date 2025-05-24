class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.initElements();
        this.bindEvents();
        this.loadTasks();
    }

    initElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            this.tasks = await response.json();
            this.renderTasks();
            this.updateStats();
        } catch (error) {
            console.error('タスクの読み込みに失敗しました:', error);
        }
    }

    async addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (response.ok) {
                const newTask = await response.json();
                this.tasks.push(newTask);
                this.taskInput.value = '';
                this.renderTasks();
                this.updateStats();
            }
        } catch (error) {
            console.error('タスクの追加に失敗しました:', error);
        }
    }

    async toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !task.completed }),
            });

            if (response.ok) {
                task.completed = !task.completed;
                this.renderTasks();
                this.updateStats();
            }
        } catch (error) {
            console.error('タスクの更新に失敗しました:', error);
        }
    }

    async deleteTask(id) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.renderTasks();
                this.updateStats();
            }
        } catch (error) {
            console.error('タスクの削除に失敗しました:', error);
        }
    }

    async clearCompleted() {
        const completedTasks = this.tasks.filter(t => t.completed);
        
        try {
            const deletePromises = completedTasks.map(task => 
                fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
            );
            
            await Promise.all(deletePromises);
            this.tasks = this.tasks.filter(t => !t.completed);
            this.renderTasks();
            this.updateStats();
        } catch (error) {
            console.error('完了済みタスクの削除に失敗しました:', error);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <h3>📭 タスクがありません</h3>
                    <p>新しいタスクを追加してみましょう！</p>
                </div>
            `;
            return;
        }

        this.taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="taskManager.toggleTask(${task.id})"
                >
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button 
                    class="task-delete" 
                    onclick="taskManager.deleteTask(${task.id})"
                    title="削除"
                >
                    削除
                </button>
            </li>
        `).join('');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
        
        this.clearCompletedBtn.style.display = completed > 0 ? 'inline-block' : 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const taskManager = new TaskManager();