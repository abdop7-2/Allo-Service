import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Landing point of the Google OAuth flow: the backend redirects here
// with ?token=...&user=... — store them and go to the dashboard.
export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    const user = params.get('user');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=google_failed', { replace: true });
    }
  }, [params, navigate]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#64748b', fontSize: 15,
    }}>
      Connexion en cours...
    </div>
  );
}
