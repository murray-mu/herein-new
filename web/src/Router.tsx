import { useState } from 'react';
import App from './App';
import PublicHomepage from './components/asset/PublicHomepage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import AdminPage from './components/admin/AdminPage';

interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  city: string | null;
  isAdmin?: boolean;
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
    if (newUser.isAdmin) {
      window.history.replaceState(null, '', '/admin');
    } else {
      window.history.replaceState(null, '', '/');
    }
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

  // Auth pages — if already authed, admin goes to admin, others to app
  if (path === '/login') {
    if (isAuth) {
      return user!.isAdmin
        ? <AdminPage token={token!} onLogout={handleLogout} />
        : <App token={token!} user={user!} onLogout={handleLogout} />;
    }
    return <LoginPage onLogin={handleLogin} onGoRegister={() => window.location.replace('/register')} />;
  }

  if (path === '/register') {
    if (isAuth) {
      return user!.isAdmin
        ? <AdminPage token={token!} onLogout={handleLogout} />
        : <App token={token!} user={user!} onLogout={handleLogout} />;
    }
    return <RegisterPage onLogin={handleLogin} onGoLogin={() => window.location.replace('/login')} />;
  }

  // Admin panel
  if (path === '/admin') {
    if (!isAuth) { window.location.replace('/login'); return null; }
    return <AdminPage token={token!} onLogout={handleLogout} />;
  }

  // App — require auth. Admin users go to /admin
  if (!isAuth) {
    window.location.replace('/login');
    return null;
  }

  if (user!.isAdmin) {
    window.location.replace('/admin');
    return null;
  }

  return <App token={token!} user={user!} onLogout={handleLogout} />;
}
