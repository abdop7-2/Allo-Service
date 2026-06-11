import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import api from './api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [role, setRole] = useState('client');

  // Login state
  const [loginData, setLoginData]   = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regData, setRegData]     = useState({ name: '', email: '', phone: '', password: '' });
  const [regError, setRegError]   = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleRegisterClick = () => setIsActive(true);
  const handleLoginClick    = () => setIsActive(false);

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
      setRegError(errors ? Object.values(errors).flat().join(' ') : 'Erreur lors de l\'inscription.');
    } finally { setRegLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

        *{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Montserrat', sans-serif;
        }

        body{
            background-color: #c9d6ff;
            background: linear-gradient(to right, #e2e2e2, #c9d6ff);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            height: 100vh;
        }

        .container{
            background-color: #fff;
            border-radius: 30px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
            position: relative;
            overflow: hidden;
            width: 768px;
            max-width: 100%;
            min-height: 480px;
        }

        .container p{
            font-size: 14px;
            line-height: 20px;
            letter-spacing: 0.3px;
            margin: 20px 0;
        }

        .container span{
            font-size: 12px;
        }

        .container a{
            color: #333;
            font-size: 13px;
            text-decoration: none;
            margin: 15px 0 10px;
        }

        .container button{
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

        .container button.hidden{
            background-color: transparent;
            border-color: #fff;
        }

        .container form{
            background-color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            padding: 0 40px;
            height: 100%;
        }

        .container input{
            background-color: #eee;
            border: none;
            margin: 8px 0;
            padding: 10px 15px;
            font-size: 13px;
            border-radius: 8px;
            width: 100%;
            outline: none;
        }

        .form-container{
            position: absolute;
            top: 0;
            height: 100%;
            transition: all 0.6s ease-in-out;
        }

        .sign-in{
            left: 0;
            width: 50%;
            z-index: 2;
        }

        .container.active .sign-in{
            transform: translateX(100%);
        }

        .sign-up{
            left: 0;
            width: 50%;
            opacity: 0;
            z-index: 1;
        }

        .container.active .sign-up{
            transform: translateX(100%);
            opacity: 1;
            z-index: 5;
            animation: move 0.6s;
        }

        @keyframes move{
            0%, 49.99%{
                opacity: 0;
                z-index: 1;
            }
            50%, 100%{
                opacity: 1;
                z-index: 5;
            }
        }

        .toggle-container{
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

        .container.active .toggle-container{
            transform: translateX(-100%);
            border-radius: 0 150px 100px 0;
        }

        .toggle{
            background-color: #2da0a8;
            height: 100%;
            background: linear-gradient(to right, #5c6bc0, #2da0a8);
            color: #fff;
            position: relative;
            left: -100%;
            height: 100%;
            width: 200%;
            transform: translateX(0);
            transition: all 0.6s ease-in-out;
        }

        .container.active .toggle{
            transform: translateX(50%);
        }

        .toggle-panel{
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
            transform: translateX(0);
            transition: all 0.6s ease-in-out;
        }

        .toggle-left{
            transform: translateX(-200%);
        }

        .container.active .toggle-left{
            transform: translateX(0);
        }

        .toggle-right{
            right: 0;
            transform: translateX(0);
        }

        .container.active .toggle-right{
            transform: translateX(200%);
        }

        .role-selector{
            display: flex;
            gap: 10px;
            margin: 12px 0;
            width: 100%;
        }

        .role-selector label{
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

        .role-selector input[type="radio"]{
            display: none;
        }

        .role-selector label.selected{
            border-color: #2da0a8;
            background-color: #e8f7f8;
            color: #2da0a8;
        }

        .signin-footer{
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-size: 13px;
            margin-top: 10px;
            white-space: nowrap;
        }

        .signin-footer a{
            margin: 0;
            color: #2da0a8;
            font-weight: 600;
        }
      `}</style>

      <div className={`container ${isActive ? 'active' : ''}`}>
        {/* Formulaire Inscription */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1>Créer un compte</h1>
            <span>Vous êtes :</span>
            <div className="role-selector">
              <label className={role === 'client' ? 'selected' : ''}>
                <input type="radio" name="role" value="client" checked={role === 'client'} onChange={() => setRole('client')} />
                <i className="fa-solid fa-user"></i> Client
              </label>
              <label className={role === 'prestataire' ? 'selected' : ''}>
                <input type="radio" name="role" value="prestataire" checked={role === 'prestataire'} onChange={() => setRole('prestataire')} />
                <i className="fa-solid fa-briefcase"></i> Prestataire
              </label>
            </div>
            {regError && <p style={{ color:'#ef4444', fontSize:12, margin:'4px 0', textAlign:'center' }}>{regError}</p>}
            <input type="text"     placeholder="Nom complet"           value={regData.name}     onChange={e => setRegData(d => ({...d, name:e.target.value}))}     required />
            <input type="email"    placeholder="Adresse e-mail"        value={regData.email}    onChange={e => setRegData(d => ({...d, email:e.target.value}))}    required />
            <input type="tel"      placeholder="Téléphone (optionnel)" value={regData.phone}    onChange={e => setRegData(d => ({...d, phone:e.target.value}))}    />
            <input type="password" placeholder="Mot de passe"          value={regData.password} onChange={e => setRegData(d => ({...d, password:e.target.value}))} required />
            <button type="submit" disabled={regLoading}>{regLoading ? 'Inscription...' : "S'inscrire"}</button>
          </form>
        </div>

        {/* Formulaire Connexion */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Connexion</h1>
            <span>Connectez-vous avec votre e-mail</span>
            {loginError && <p style={{ color:'#ef4444', fontSize:12, margin:'4px 0', textAlign:'center' }}>{loginError}</p>}
            <input type="email"    placeholder="Adresse e-mail" value={loginData.email}    onChange={e => setLoginData(d => ({...d, email:e.target.value}))}    required />
            <input type="password" placeholder="Mot de passe"   value={loginData.password} onChange={e => setLoginData(d => ({...d, password:e.target.value}))} required />
            <a href="#">Mot de passe oublié ?</a>
            <button type="submit" disabled={loginLoading}>{loginLoading ? 'Connexion...' : 'Se connecter'}</button>
            <div className="signin-footer">
              <span>Pas encore de compte ?</span>
              <a href="#" onClick={(e) => { e.preventDefault(); handleRegisterClick(); }}>Créer un compte</a>
            </div>
          </form>
        </div>

        {/* Panneau de bascule */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Bon retour !</h1>
              <p>Connectez-vous pour accéder à toutes les fonctionnalités</p>
              <button
                type="button"
                className="hidden"
                onClick={handleLoginClick}
              >
                Se connecter
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Bienvenue !</h1>
              <p>
                Inscrivez-vous et trouvez les meilleurs prestataires près de chez vous
              </p>
              <button
                type="button"
                className="hidden"
                onClick={handleRegisterClick}
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
