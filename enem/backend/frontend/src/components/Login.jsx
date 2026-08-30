import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Login({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnostic, setDiagnostic] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await axios.post(endpoint, payload);
      setToken(res.data.token);
      if (!isLogin) {
        setDiagnostic(true);
        toast.success('Conta criada! Responda o questionário.');
      } else {
        toast.success('Login realizado!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro.');
    } finally {
      setLoading(false);
    }
  };

  if (diagnostic) {
    return <Diagnostic setToken={setToken} />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Entrar' : 'Criar conta'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
        </p>
      </div>
    </div>
  );
}

function Diagnostic({ setToken }) {
  const [answers, setAnswers] = useState({
    matematica: 'medio',
    portugues: 'medio',
    redacao: 'medio',
    biologia: 'medio',
    fisica: 'medio',
    quimica: 'medio',
    humanas: 'medio'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (subject, value) => {
    setAnswers({ ...answers, [subject]: value });
  };

  const submitDiagnostic = async () => {
    setLoading(true);
    try {
      await axios.post('/api/user/diagnostic', { answers }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Diagnóstico concluído! Plano personalizado gerado.');
      window.location.reload();
    } catch (err) {
      toast.error('Erro ao salvar diagnóstico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diagnostic-container">
      <div className="diagnostic-card">
        <h2>Questionário de Diagnóstico</h2>
        <p>Como você avalia seu conhecimento em cada área?</p>
        {Object.keys(answers).map((subject) => (
          <div key={subject} className="diagnostic-row">
            <label>{subject.charAt(0).toUpperCase() + subject.slice(1)}</label>
            <select value={answers[subject]} onChange={(e) => handleChange(subject, e.target.value)}>
              <option value="facil">Fácil</option>
              <option value="medio">Médio</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
        ))}
        <button onClick={submitDiagnostic} disabled={loading}>
          {loading ? 'Salvando...' : 'Concluir diagnóstico'}
        </button>
      </div>
    </div>
  );
}

export default Login;