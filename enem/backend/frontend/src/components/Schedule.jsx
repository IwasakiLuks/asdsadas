import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Schedule({ token }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSchedule(res.data);
    } catch (err) {
      toast.error('Erro ao carregar cronograma.');
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    try {
      await axios.get('/api/schedule/generate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cronograma gerado!');
      fetchSchedule();
    } catch (err) {
      toast.error('Erro ao gerar cronograma.');
    }
  };

  const completeTask = async (id) => {
    try {
      await axios.put(`/api/schedule/${id}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tarefa concluída!');
      fetchSchedule();
    } catch (err) {
      toast.error('Erro ao concluir tarefa.');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Cronograma de Estudos</h2>
      <button onClick={generateSchedule} className="btn-primary" style={{ marginBottom: '20px' }}>
        Gerar novo cronograma
      </button>
      <div className="schedule-table">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Horário</th>
              <th>Matéria</th>
              <th>Tópico</th>
              <th>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((item) => (
              <tr key={item.id}>
                <td>{item.day}</td>
                <td>{item.slot}</td>
                <td>{item.subject}</td>
                <td>{item.topic}</td>
                <td>{item.status}</td>
                <td>
                  {item.status === 'pendente' && (
                    <button onClick={() => completeTask(item.id)}>Concluir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Schedule;