const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../database');
const fs = require('fs');
const path = require('path');

const questionsSeed = JSON.parse(fs.readFileSync(path.join(__dirname, '../seed/questions.json'), 'utf8'));

function seedQuestions() {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO questions (year, subject, area, text, image_url, options, correct_answer, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const q of questionsSeed) {
    stmt.run(q.year, q.subject, q.area, q.text, q.image_url, JSON.stringify(q.options), q.correct_answer, q.difficulty);
  }
}
seedQuestions();

router.get('/', auth, (req, res) => {
  const { subject, area, difficulty, limit = 20 } = req.query;
  let sql = 'SELECT * FROM questions WHERE 1=1';
  const params = [];
  if (subject) { sql += ' AND subject = ?'; params.push(subject); }
  if (area) { sql += ' AND area = ?'; params.push(area); }
  if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
  sql += ' ORDER BY RANDOM() LIMIT ?';
  params.push(parseInt(limit));

  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar questões.' });
  }
});

router.post('/simulado', auth, (req, res) => {
  const { area, numQuestions = 10 } = req.body;
  const userId = req.userId;

  try {
    const stmt = db.prepare('SELECT id FROM questions WHERE area = ? ORDER BY RANDOM() LIMIT ?');
    const rows = stmt.all(area, numQuestions);
    const questionIds = rows.map(r => r.id);
    const insertStmt = db.prepare('INSERT INTO exams (user_id, questions) VALUES (?, ?)');
    const info = insertStmt.run(userId, JSON.stringify(questionIds));
    res.json({ examId: info.lastInsertRowid, questionIds });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar simulado.' });
  }
});

router.get('/simulado/:id', auth, (req, res) => {
  const examId = req.params.id;
  const userId = req.userId;

  try {
    const examStmt = db.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?');
    const exam = examStmt.get(examId, userId);
    if (!exam) return res.status(404).json({ error: 'Simulado não encontrado.' });

    const ids = JSON.parse(exam.questions);
    const placeholders = ids.map(() => '?').join(',');
    const qStmt = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`);
    const questions = qStmt.all(...ids);
    res.json({ exam, questions });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar questões.' });
  }
});

router.post('/simulado/:id/submit', auth, (req, res) => {
  const { answers } = req.body;
  const examId = req.params.id;
  const userId = req.userId;

  try {
    const examStmt = db.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?');
    const exam = examStmt.get(examId, userId);
    if (!exam) return res.status(404).json({ error: 'Simulado não encontrado.' });

    const ids = JSON.parse(exam.questions);
    const placeholders = ids.map(() => '?').join(',');
    const qStmt = db.prepare(`SELECT id, correct_answer FROM questions WHERE id IN (${placeholders})`);
    const questions = qStmt.all(...ids);

    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] && answers[q.id] === q.correct_answer) correct++;
    }
    const score = Math.round((correct / questions.length) * 1000);
    db.prepare('UPDATE exams SET score = ? WHERE id = ?').run(score, examId);
    res.json({ score, correct, total: questions.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao submeter respostas.' });
  }
});

module.exports = router;