import { useState } from 'react';
import App from './App';
import PublicHomepage from './components/asset/PublicHomepage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  city: string | null;
}

export default function Router() {
  const path = window.location.pathname;
  const match = path.match(/^\/@(.+)$/);

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('herein-token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('herein-user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  function handleLogin(newToken: string, newUser: AuthUser) {
    setToken(newToken);
    setUser(newUser);
    window.history.replaceState(null, '', '/');
  }

  function handleLogout() {
    localStorage.removeItem('herein-token');
    localStorage.removeItem('herein-user');
    setToken(null);
    setUser(null);
    window.location.replace('/login');
  }

  // Public profile — no auth required
  if (match) {
    return <PublicHomepage username={match[1]} />;
  }

  const isAuth = !!(token && user);

  // Auth pages — if already authed, show app
  if (path === '/login') {
    return isAuth
      ? <App token={token!} user={user!} onLogout={handleLogout} />
      : <LoginPage onLogin={handleLogin} onGoRegister={() => window.location.replace('/register')} />;
  }

  if (path === '/register') {
    return isAuth
      ? <App token={token!} user={user!} onLogout={handleLogout} />
      : <RegisterPage onLogin={handleLogin} onGoLogin={() => window.location.replace('/login')} />;
  }

  // App — require auth
  if (!isAuth) {
    window.location.replace('/login');
    return null;
  }

  return <App token={token!} user={user!} onLogout={handleLogout} />;
}
