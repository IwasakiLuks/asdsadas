require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const questionRoutes = require('./routes/questions');
const essayRoutes = require('./routes/essays');
const scheduleRoutes = require('./routes/schedule');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/essays', essayRoutes);
app.use('/api/schedule', scheduleRoutes);


app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});