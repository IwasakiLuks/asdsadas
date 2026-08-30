import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Desempenho({ token }) {
  const [progress, setProgress] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const progressRes = await axios.get('/api/user/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProgress(progressRes.data);
        const examsRes = await axios.get('/api/user/exams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExams(examsRes.data || []);
      } catch (err) {
        toast.error('Erro ao carregar desempenho.');
      }
    };
    fetchData();
  }, [token]);

  const total = progress.length;
  const done = progress.filter(p => p.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const avgScore = exams.length > 0 ? Math.round(exams.reduce((a, b) => a + b.score, 0) / exams.length) : 0;

  return (
    <div>
      <h2>Desempenho</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Conteúdos concluídos</div>
          <div className="value blue">{done}/{total}</div>
          <div className="sub">{pct}%</div>
        </div>
        <div className="stat-card">
          <div className="label">Média em simulados</div>
          <div className="value green">{avgScore}</div>
          <div className="sub">{exams.length} simulados realizados</div>
        </div>
      </div>
      {exams.length > 0 && (
        <div className="exam-history">
          <h3>Histórico de simulados</h3>
          <table>
            <thead>
              <tr><th>Data</th><th>Área</th><th>Nota</th></tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id}>
                  <td>{exam.date}</td>
                  <td>{exam.area}</td>
                  <td>{exam.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Desempenho;