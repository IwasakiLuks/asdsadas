import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import Simulados from './components/Simulados';
import Redacao from './components/Redacao';
import Desempenho from './components/Desempenho';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  if (!token) {
    return (
      <>
        <Login setToken={setToken} />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/cronograma" element={<Schedule token={token} />} />
          <Route path="/simulados" element={<Simulados token={token} />} />
          <Route path="/redacao" element={<Redacao token={token} />} />
          <Route path="/desempenho" element={<Desempenho token={token} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <ToastContainer />
    </div>
  );
}

function Sidebar() {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <nav className="sidebar">
      <div className="logo"><i className="fas fa-brain"></i></div>
      <NavItem to="/" icon="fa-home" label="Início" active={location.pathname === '/'} />
      <NavItem to="/cronograma" icon="fa-calendar-week" label="Cronograma" active={location.pathname === '/cronograma'} />
      <NavItem to="/simulados" icon="fa-tasks" label="Simulados" active={location.pathname === '/simulados'} />
      <NavItem to="/redacao" icon="fa-pen-fancy" label="Redação" active={location.pathname === '/redacao'} />
      <NavItem to="/desempenho" icon="fa-chart-line" label="Desempenho" active={location.pathname === '/desempenho'} />
      <button className="nav-item" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Sair</span>
      </button>
    </nav>
  );
}

function NavItem({ to, icon, label, active }) {
  return (
    <Link to={to} className={`nav-item ${active ? 'active' : ''}`}>
      <i className={`fas ${icon}`}></i>
      <span>{label}</span>
    </Link>
  );
}

export default App;