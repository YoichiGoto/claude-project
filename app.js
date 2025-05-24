const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

let tasks = [
  { id: 1, text: 'サンプルタスク1', completed: false, createdAt: new Date() },
  { id: 2, text: 'サンプルタスク2', completed: true, createdAt: new Date() },
  { id: 3, text: 'サンプルタスク3', completed: false, createdAt: new Date() }
];

let nextId = 4;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'タスクテキストが必要です' });
  }
  
  const newTask = {
    id: nextId++,
    text: text.trim(),
    completed: false,
    createdAt: new Date()
  };
  
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { text, completed } = req.body;
  
  const task = tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'タスクが見つかりません' });
  }
  
  if (text !== undefined) task.text = text.trim();
  if (completed !== undefined) task.completed = completed;
  
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

app.delete('/api/tasks/completed', (req, res) => {
  tasks = tasks.filter(task => !task.completed);
  res.json({ message: '完了済みタスクを削除しました' });
});

app.listen(PORT, () => {
  console.log(`タスク管理アプリがポート ${PORT} で起動しました`);
  console.log(`http://localhost:${PORT} でアクセスできます`);
});
