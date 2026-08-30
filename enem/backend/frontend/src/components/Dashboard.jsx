import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Dashboard({ token }) {
  const [stats, setStats] = useState({ daysLeft: 0, progress: 0, level: '' });
  const [todayTask, setTodayTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const progressRes = await axios.get('/api/user/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const progressData = progressRes.data;
        const total = progressData.length;
        const done = progressData.filter(p => p.completed).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const enem = new Date(2026, 10, 8);
        const now = new Date();
        const diff = Math.ceil((enem - now) / (1000 * 60 * 60 * 24));

        const userRes = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats({
          daysLeft: diff > 0 ? diff : 0,
          progress: pct,
          level: userRes.data.level || 'intermediario'
        });

        const scheduleRes = await axios.get('/api/schedule', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const today = new Date().toISOString().split('T')[0];
        const task = scheduleRes.data.find(item => item.day === today && item.status === 'pendente');
        if (task) setTodayTask(task);

      } catch (err) {
        toast.error('Erro ao carregar dados.');
      }
    };
    fetchData();
  }, [token]);

  return (
    <div>
      <h2>Bem-vindo de volta!</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Dias para o ENEM</div>
          <div className="value blue">{stats.daysLeft}</div>
          <div className="sub">08/11/2026</div>
        </div>
        <div className="stat-card">
          <div className="label">Progresso</div>
          <div className="value green">{stats.progress}%</div>
          <div className="sub">Nível: {stats.level}</div>
        </div>
        <div className="stat-card">
          <div className="label">Meta</div>
          <div className="value yellow">630+</div>
          <div className="sub">Média atual: 534</div>
        </div>
        <div className="stat-card">
          <div className="label">Tarefa de hoje</div>
          <div className="value pink">{todayTask ? todayTask.subject : 'Descanso'}</div>
          <div className="sub">{todayTask ? todayTask.topic : 'Aproveite!'}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;