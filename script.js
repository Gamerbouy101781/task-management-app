import Sortable from 'sortablejs';

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const taskList = document.getElementById('task-list');
    const filterSelect = document.getElementById('filter-select');
    const emptyState = document.getElementById('empty-state');
    const taskCounter = document.getElementById('task-counter');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };
    
    const updateTaskOrder = () => {
        const taskElements = taskList.querySelectorAll('.task-item');
        const newTasksOrder = [];
        taskElements.forEach(el => {
            const task = tasks.find(t => t.id == el.dataset.id);
            if(task) newTasksOrder.push(task);
        });
        tasks = newTasksOrder;
        saveTasks();
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter.startsWith('priority-')) {
                const priority = currentFilter.split('-')[1];
                return task.priority === priority;
            }
            return true;
        });

        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            taskCounter.textContent = 'No tasks';
        } else {
            emptyState.classList.add('hidden');
            taskCounter.textContent = `${filteredTasks.length} task${filteredTasks.length > 1 ? 's' : ''}`;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            
            li.innerHTML = `
                <div class="priority-indicator ${task.priority}"></div>
                <div class="task-item-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-title" contenteditable="false">${task.title}</span>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" aria-label="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            
            if (document.activeElement?.closest('.task-item')?.dataset.id !== task.id) {
                taskList.appendChild(li);
            } else {
                const oldLi = document.querySelector(`.task-item[data-id="${task.id}"]`);
                if (oldLi) {
                    taskList.replaceChild(li, oldLi);
                } else {
                     taskList.appendChild(li);
                }
            }
        });
    };
    
    const addTask = (title, priority) => {
        const newTask = {
            id: Date.now(),
            title,
            priority,
            completed: false,
        };
        tasks.unshift(newTask);

        saveTasks();
        renderTasks();

        const newItem = taskList.querySelector(`[data-id="${newTask.id}"]`);
        if (newItem) {
            newItem.classList.add('adding');
            newItem.addEventListener('animationend', () => {
                newItem.classList.remove('adding');
            }, { once: true });
        }
    };

    const toggleComplete = (id) => {
        tasks = tasks.map(task => 
            task.id == id ? { ...task, completed: !task.completed } : task
        );
        saveTasks();
        renderTasks();
    };
    
    const deleteTask = (id) => {
        const itemToDelete = taskList.querySelector(`[data-id="${id}"]`);
        if (itemToDelete) {
            itemToDelete.classList.add('deleting');
            itemToDelete.addEventListener('animationend', () => {
                tasks = tasks.filter(task => task.id != id);
                saveTasks();
                renderTasks();
            }, { once: true });
        } else {
             tasks = tasks.filter(task => task.id != id);
             saveTasks();
             renderTasks();
        }
    };
    
    const updateTaskTitle = (id, newTitle) => {
        tasks = tasks.map(task =>
            task.id == id ? { ...task, title: newTitle } : task
        );
        saveTasks();
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        const priority = prioritySelect.value;
        if (title) {
            addTask(title, priority);
            taskInput.value = '';
            taskInput.focus();
        }
    });

    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const parentLi = target.closest('.task-item');
        if (!parentLi) return;

        const taskId = parentLi.dataset.id;
        
        if (target.classList.contains('task-checkbox')) {
            toggleComplete(taskId);
        }
        
        if (target.classList.contains('delete-btn')) {
            deleteTask(taskId);
        }

        if (target.classList.contains('task-title')) {
             if (target.isContentEditable) return;
             target.contentEditable = true;
             target.focus();
             
             const range = document.createRange();
             const sel = window.getSelection();
             range.selectNodeContents(target);
             sel.removeAllRanges();
             sel.addRange(range);
        }
    });

    taskList.addEventListener('focusout', (e) => {
        const target = e.target;
        if (target.classList.contains('task-title') && target.isContentEditable) {
            target.contentEditable = false;
            const taskId = target.closest('.task-item').dataset.id;
            updateTaskTitle(taskId, target.textContent.trim());
        }
    });

    taskList.addEventListener('keydown', (e) => {
        const target = e.target;
        if (target.classList.contains('task-title') && target.isContentEditable) {
            if (e.key === 'Enter') {
                e.preventDefault();
                target.blur();
            } else if (e.key === 'Escape') {
                 const taskId = target.closest('.task-item').dataset.id;
                 const originalTitle = tasks.find(t => t.id == taskId).title;
                 target.textContent = originalTitle;
                 target.blur();
            }
        }
    });

    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTasks();
    });
    
    new Sortable(taskList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            updateTaskOrder();
        }
    });

    renderTasks();
});

