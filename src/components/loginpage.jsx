import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import api from '../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState('client');

  const [loginData, setLoginData]     = useState({ email: '', password: '' });
  const [loginError, setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regData, setRegData]       = useState({ name: '', email: '', phone: '', password: '' });
  const [regError, setRegError]     = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleRegisterClick = () => setIsActive(true);
  const handleLoginClick    = () => setIsActive(false);

  useEffect(() => {
    if (searchParams.get('error') === 'google_failed') {
      setLoginError('La connexion avec Google a échoué. Veuillez réessayer.');
    }
  }, [searchParams]);

  // full-page navigation: the OAuth dance is handled by the backend
  const googleLogin = (selectedRole) => {
    const base = api.defaults.baseURL.replace(/\/$/, '');
    window.location.href = `${base}/api/auth/google${selectedRole ? `?role=${selectedRole}` : ''}`;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoginLoading(true);
    try {
      const res = await api.post('/api/login', loginData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally { setLoginLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError(''); setRegLoading(true);
    try {
      const res = await api.post('/api/register', { ...regData, role });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setRegError(errors ? Object.values(errors).flat().join(' ') : "Erreur lors de l'inscription.");
    } finally { setRegLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

        .auth-page {
          background: linear-gradient(to right, #e2e2e2, #c9d6ff);
          display: flex;
          min-height: 100vh;
          padding: 40px 16px;
          box-sizing: border-box;
          font-family: 'Montserrat', sans-serif;
        }

        .auth-page *, .auth-page *::before, .auth-page *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Montserrat', sans-serif;
        }

        .auth-container {
          background-color: #fff;
          border-radius: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
          position: relative;
          overflow: hidden;
          width: 768px;
          max-width: 100%;
          min-height: 560px;
          margin: auto; /* centers when there's room, stays scrollable when there isn't */
        }

        .auth-container p {
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.3px;
          margin: 20px 0;
        }

        .auth-container span {
          font-size: 12px;
        }

        .auth-container a {
          color: #333;
          font-size: 13px;
          text-decoration: none;
          margin: 15px 0 10px;
        }

        .auth-container button {
          background-color: #2da0a8;
          color: #fff;
          font-size: 12px;
          padding: 10px 45px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-top: 10px;
          cursor: pointer;
        }

        .auth-container button.hidden {
          background-color: transparent;
          border-color: #fff;
        }

        .auth-container form {
          background-color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          height: 100%;
        }

        .auth-container input {
          background-color: #eee;
          border: none;
          margin: 8px 0;
          padding: 10px 15px;
          font-size: 13px;
          border-radius: 8px;
          width: 100%;
          outline: none;
        }

        .auth-form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }

        .auth-sign-in {
          left: 0;
          width: 50%;
          z-index: 2;
        }

        .auth-container.active .auth-sign-in {
          transform: translateX(100%);
        }

        .auth-sign-up {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        .auth-container.active .auth-sign-up {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: auth-move 0.6s;
        }

        @keyframes auth-move {
          0%, 49.99% { opacity: 0; z-index: 1; }
          50%, 100%  { opacity: 1; z-index: 5; }
        }

        .auth-toggle-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: all 0.6s ease-in-out;
          border-radius: 150px 0 0 100px;
          z-index: 1000;
        }

        .auth-container.active .auth-toggle-container {
          transform: translateX(-100%);
          border-radius: 0 150px 100px 0;
        }

        .auth-toggle {
          background: linear-gradient(to right, #5c6bc0, #2da0a8);
          color: #fff;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: all 0.6s ease-in-out;
        }

        .auth-container.active .auth-toggle {
          transform: translateX(50%);
        }

        .auth-toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 30px;
          text-align: center;
          top: 0;
          transition: all 0.6s ease-in-out;
        }

        .auth-toggle-left  { transform: translateX(-200%); }
        .auth-container.active .auth-toggle-left  { transform: translateX(0); }
        .auth-toggle-right { right: 0; transform: translateX(0); }
        .auth-container.active .auth-toggle-right { transform: translateX(200%); }

        .auth-role-selector {
          display: flex;
          gap: 10px;
          margin: 12px 0;
          width: 100%;
        }

        .auth-role-selector label {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: border-color 0.2s, background 0.2s;
        }

        .auth-role-selector input[type="radio"] { display: none; }

        .auth-role-selector label.selected {
          border-color: #2da0a8;
          background-color: #e8f7f8;
          color: #2da0a8;
        }

        .auth-divider {
          display: flex;
          align-items: center;
          width: 100%;
          margin: 12px 0 2px;
          color: #aaa;
          font-size: 12px;
        }

        .auth-divider::before,
        .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e2e2;
        }

        .auth-divider span { padding: 0 10px; }

        .auth-container button.auth-google-btn {
          background-color: #fff;
          color: #333;
          border: 1.5px solid #ddd;
          text-transform: none;
          font-size: 13px;
          padding: 10px 24px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .auth-container button.auth-google-btn:hover {
          background-color: #f7f7f7;
          border-color: #ccc;
        }

        .auth-container button.auth-google-btn i {
          color: #ea4335;
          font-size: 15px;
        }

        .auth-signin-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          margin-top: 10px;
          white-space: nowrap;
        }

        .auth-signin-footer a {
          margin: 0;
          color: #2da0a8;
          font-weight: 600;
        }
      `}</style>

      <div className="auth-page">
        <div className={`auth-container ${isActive ? 'active' : ''}`}>

          {/* Formulaire Inscription */}
          <div className="auth-form-container auth-sign-up">
            <form onSubmit={handleRegister}>
              <h1>Créer un compte</h1>
              <span>Vous êtes :</span>
              <div className="auth-role-selector">
                <label className={role === 'client' ? 'selected' : ''}>
                  <input type="radio" name="role" value="client" checked={role === 'client'} onChange={() => setRole('client')} />
                  <i className="fa-solid fa-user"></i> Client
                </label>
                <label className={role === 'prestataire' ? 'selected' : ''}>
                  <input type="radio" name="role" value="prestataire" checked={role === 'prestataire'} onChange={() => setRole('prestataire')} />
                  <i className="fa-solid fa-briefcase"></i> Prestataire
                </label>
              </div>
              {regError && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0', textAlign: 'center' }}>{regError}</p>}
              <input type="text"     placeholder="Nom complet"           value={regData.name}     onChange={e => setRegData(d => ({ ...d, name: e.target.value }))}     required />
              <input type="email"    placeholder="Adresse e-mail"        value={regData.email}    onChange={e => setRegData(d => ({ ...d, email: e.target.value }))}    required />
              <input type="tel"      placeholder="Téléphone (optionnel)" value={regData.phone}    onChange={e => setRegData(d => ({ ...d, phone: e.target.value }))} />
              <input type="password" placeholder="Mot de passe"          value={regData.password} onChange={e => setRegData(d => ({ ...d, password: e.target.value }))} required />
              <button type="submit" disabled={regLoading}>{regLoading ? 'Inscription...' : "S'inscrire"}</button>
              <div className="auth-divider"><span>ou</span></div>
              <button type="button" className="auth-google-btn" onClick={() => googleLogin(role)}>
                <i className="fa-brands fa-google"></i> S'inscrire avec Google
              </button>
            </form>
          </div>

          {/* Formulaire Connexion */}
          <div className="auth-form-container auth-sign-in">
            <form onSubmit={handleLogin}>
              <h1>Connexion</h1>
              <span>Connectez-vous avec votre e-mail</span>
              {loginError && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0', textAlign: 'center' }}>{loginError}</p>}
              <input type="email"    placeholder="Adresse e-mail" value={loginData.email}    onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}    required />
              <input type="password" placeholder="Mot de passe"   value={loginData.password} onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))} required />
              <a href="#">Mot de passe oublié ?</a>
              <button type="submit" disabled={loginLoading}>{loginLoading ? 'Connexion...' : 'Se connecter'}</button>
              <div className="auth-divider"><span>ou</span></div>
              <button type="button" className="auth-google-btn" onClick={() => googleLogin()}>
                <i className="fa-brands fa-google"></i> Continuer avec Google
              </button>
              <div className="auth-signin-footer">
                <span>Pas encore de compte ?</span>
                <a href="#" onClick={e => { e.preventDefault(); handleRegisterClick(); }}>Créer un compte</a>
              </div>
            </form>
          </div>

          {/* Panneau de bascule */}
          <div className="auth-toggle-container">
            <div className="auth-toggle">
              <div className="auth-toggle-panel auth-toggle-left">
                <h1>Bon retour !</h1>
                <p>Connectez-vous pour accéder à toutes les fonctionnalités</p>
                <button type="button" className="hidden" onClick={handleLoginClick}>Se connecter</button>
              </div>
              <div className="auth-toggle-panel auth-toggle-right">
                <h1>Bienvenue !</h1>
                <p>Inscrivez-vous et trouvez les meilleurs prestataires près de chez vous</p>
                <button type="button" className="hidden" onClick={handleRegisterClick}>S'inscrire</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginPage;
