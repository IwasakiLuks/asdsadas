const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../database');

router.post('/diagnostic', auth, (req, res) => {
  const { answers } = req.body;
  const userId = req.userId;

  try {
    const stmt = db.prepare('INSERT INTO diagnostics (user_id, question_key, answer) VALUES (?, ?, ?)');
    for (const [key, value] of Object.entries(answers)) {
      stmt.run(userId, key, value);
    }

    const dificuldade = Object.values(answers).filter(v => v === 'dificil').length;
    let level = 'iniciante';
    if (dificuldade <= 2) level = 'intermediario';
    if (dificuldade === 0) level = 'avancado';

    db.prepare('UPDATE users SET level = ? WHERE id = ?').run(level, userId);
    res.json({ level, message: 'Diagnóstico concluído.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar diagnóstico.' });
  }
});

router.get('/progress', auth, (req, res) => {
  const userId = req.userId;
  try {
    const stmt = db.prepare('SELECT subject, topic, completed FROM progress WHERE user_id = ?');
    const rows = stmt.all(userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar progresso.' });
  }
});

router.post('/progress', auth, (req, res) => {
  const { subject, topic } = req.body;
  const userId = req.userId;
  try {
    db.prepare(`
      INSERT OR REPLACE INTO progress (user_id, subject, topic, completed, last_review, next_review)
      VALUES (?, ?, ?, 1, datetime("now"), datetime("now", "+7 days"))
    `).run(userId, subject, topic);
    res.json({ message: 'Progresso atualizado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar progresso.' });
  }
});

router.get('/me', auth, (req, res) => {
  const userId = req.userId;
  try {
    const stmt = db.prepare('SELECT id, name, email, level, meta_score FROM users WHERE id = ?');
    const user = stmt.get(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});

module.exports = router;