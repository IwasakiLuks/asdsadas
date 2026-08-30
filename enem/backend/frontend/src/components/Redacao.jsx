import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Redacao({ token }) {
  const [theme, setTheme] = useState('');
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitEssay = async () => {
    if (!theme || !text) {
      toast.error('Preencha tema e redação.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/essays', { theme, text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedback(res.data);
      toast.success('Redação enviada e corrigida!');
    } catch (err) {
      toast.error('Erro ao enviar redação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Redação</h2>
      <div className="redacao-container">
        <input
          type="text"
          placeholder="Tema da redação"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        />
        <textarea
          placeholder="Escreva sua redação aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows="20"
        />
        <button onClick={submitEssay} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar redação'}
        </button>
        {feedback && (
          <div className="feedback">
            <h3>Feedback da correção</h3>
            <p><strong>Nota:</strong> {feedback.score}</p>
            <div dangerouslySetInnerHTML={{ __html: feedback.feedback }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Redacao;