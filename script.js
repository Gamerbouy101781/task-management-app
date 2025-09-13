
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filters button');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Auto dark/light mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = 'all') {
  taskList.innerHTML = '';
  let filteredTasks = tasks;

  if (filter === 'completed') filteredTasks = tasks.filter(t => t.completed);
  else if (['low','medium','high'].includes(filter)) filteredTasks = tasks.filter(t => t.priority === filter);

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task';
    if (task.completed) li.classList.add('completed');
    li.innerHTML = `
      <span>${task.text}</span>
      <span class="priority ${task.priority}">${task.priority}</span>
      <div class="actions">
    <button onclick="toggleComplete(${task.id})"><i class="fa-solid fa-check"></i></button>
    <button onclick="editTask(${task.id})"><i class="fa-solid fa-pen"></i></button>
    <button onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>

      </div>
    `;
    taskList.appendChild(li);
    // Animate
    setTimeout(() => li.classList.add('show'), 50);
  });
}

function addTask(text, priority) {
  const id = Date.now();
  tasks.push({ id, text, priority, completed: false });
  saveTasks();
  renderTasks(getActiveFilter());
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks(getActiveFilter());
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt('Edit task:', task.text);
  if (newText !== null && newText.trim() !== '') {
    task.text = newText.trim();
    saveTasks();
    renderTasks(getActiveFilter());
  }
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  saveTasks();
  renderTasks(getActiveFilter());
}

function getActiveFilter() {
  return document.querySelector('.filters button.active').dataset.filter;
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks(btn.dataset.filter);
  });
});

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  if (text !== '') addTask(text, priority);
  taskInput.value = '';
});

renderTasks();
