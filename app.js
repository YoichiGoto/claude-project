const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

let tasks = [
  { id: 1, text: 'サンプルタスク', completed: false },
  { id: 2, text: 'タスク管理アプリの作成', completed: true }
];
let nextId = 3;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'タスクテキストが必要です' });
  }
  
  const newTask = {
    id: nextId++,
    text: text,
    completed: false
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { completed } = req.body;
  
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }
  
  task.completed = completed;
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }
  
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`タスク管理アプリが http://localhost:${PORT} で起動しました`);
});
