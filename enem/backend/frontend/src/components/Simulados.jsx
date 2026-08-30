import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Simulados({ token }) {
  const [area, setArea] = useState('Matemática');
  const [numQuestions, setNumQuestions] = useState(10);
  const [examId, setExamId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const generateSimulado = async () => {
    try {
      const res = await axios.post('/api/questions/simulado', { area, numQuestions }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExamId(res.data.examId);
      fetchQuestions(res.data.examId);
      toast.success('Simulado gerado!');
    } catch (err) {
      toast.error('Erro ao gerar simulado.');
    }
  };

  const fetchQuestions = async (id) => {
    try {
      const res = await axios.get(`/api/questions/simulado/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(res.data.questions);
      setAnswers({});
      setSubmitted(false);
      setScore(null);
    } catch (err) {
      toast.error('Erro ao carregar questões.');
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const submitSimulado = async () => {
    try {
      const res = await axios.post(`/api/questions/simulado/${examId}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScore(res.data.score);
      setSubmitted(true);
      toast.success(`Nota: ${res.data.score} (${res.data.correct}/${res.data.total})`);
    } catch (err) {
      toast.error('Erro ao submeter simulado.');
    }
  };

  return (
    <div>
      <h2>Simulados</h2>
      <div className="simulado-controls">
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option value="Matemática">Matemática</option>
          <option value="Ciências da Natureza">Ciências da Natureza</option>
          <option value="Ciências Humanas">Ciências Humanas</option>
          <option value="Linguagens">Linguagens</option>
        </select>
        <input type="number" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} min="5" max="45" />
        <button onClick={generateSimulado}>Gerar Simulado</button>
      </div>

      {questions.length > 0 && !submitted && (
        <div className="questions-container">
          {questions.map((q, idx) => (
            <div key={q.id} className="question-card">
              <h4>Questão {idx + 1}</h4>
              <p>{q.text}</p>
              {q.image_url && <img src={q.image_url} alt="Questão" style={{ maxWidth: '100%' }} />}
              <div className="options">
                {JSON.parse(q.options).map((opt, i) => (
                  <label key={i}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button onClick={submitSimulado}>Enviar respostas</button>
        </div>
      )}

      {submitted && (
        <div className="result">
          <h3>Resultado</h3>
          <p>Nota: {score}/1000</p>
        </div>
      )}
    </div>
  );
}

export default Simulados;