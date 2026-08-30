const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db } = require('../database');

router.get('/generate', auth, (req, res) => {
  const userId = req.userId;

  try {
    const userStmt = db.prepare('SELECT level FROM users WHERE id = ?');
    const user = userStmt.get(userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    const level = user.level || 'intermediario';
    let dailyHours = 6;
    let prioritySubjects = ['Matemática', 'Redação'];
    if (level === 'iniciante') {
      dailyHours = 4;
      prioritySubjects = ['Matemática', 'Linguagens', 'Redação'];
    } else if (level === 'avancado') {
      dailyHours = 8;
      prioritySubjects = ['Física', 'Química', 'Biologia'];
    }

    const pendingStmt = db.prepare('SELECT subject, topic FROM progress WHERE user_id = ? AND completed = 0');
    let pending = pendingStmt.all(userId);

    const schedule = [];
    const startDate = new Date();
    const subjects = ['Matemática', 'Linguagens', 'Humanas', 'Física', 'Química', 'Biologia'];
    const slots = ['08:00-08:45', '09:00-09:45', '10:00-10:45', '11:00-11:45', '13:30-14:15', '14:30-15:15'];

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0) continue;

      const dayStr = currentDate.toISOString().split('T')[0];
      let numSlots = Math.min(dailyHours, slots.length);
      if (dayOfWeek === 6) numSlots = Math.min(4, dailyHours);

      for (let i = 0; i < numSlots; i++) {
        const subjectIndex = (day + i) % subjects.length;
        let subject = subjects[subjectIndex];
        let topic = 'Revisão geral';

        const idx = pending.findIndex(p => p.subject === subject);
        if (idx !== -1) {
          topic = pending[idx].topic;
          pending.splice(idx, 1);
        } else {
          topic = prioritySubjects.includes(subject) ? 'Aprofundamento' : 'Revisão';
        }

        schedule.push({ day: dayStr, slot: slots[i], subject, topic, status: 'pendente' });
      }
    }

    db.prepare('DELETE FROM schedules WHERE user_id = ?').run(userId);
    const insertStmt = db.prepare('INSERT INTO schedules (user_id, day, slot, subject, topic, status) VALUES (?, ?, ?, ?, ?, ?)');
    for (const s of schedule) {
      insertStmt.run(userId, s.day, s.slot, s.subject, s.topic, s.status);
    }

    res.json({ message: 'Cronograma gerado com sucesso.', schedule });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar cronograma.' });
  }
});

router.get('/', auth, (req, res) => {
  const userId = req.userId;
  try {
    const stmt = db.prepare('SELECT * FROM schedules WHERE user_id = ? ORDER BY day, slot');
    const rows = stmt.all(userId);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cronograma.' });
  }
});

router.put('/:id/complete', auth, (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  try {
    const stmt = db.prepare('UPDATE schedules SET status = "concluído" WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
    res.json({ message: 'Tarefa concluída com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao concluir tarefa.' });
  }
});

module.exports = router;