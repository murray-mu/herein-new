import { useState, type FormEvent } from 'react';
import BrandMark from '../shared/BrandMark';

interface Props {
  onLogin: (token: string, user: { id: number; username: string; displayName: string; city: string | null }) => void;
  onGoRegister: () => void;
}

export default function LoginPage({ onLogin, onGoRegister }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('herein-token', data.token);
      localStorage.setItem('herein-user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 font-sans antialiased flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <BrandMark className="w-12 mx-auto" />
          <h1 className="text-2xl font-serif font-extralight tracking-tight text-white">此间 HEREIN</h1>
          <p className="text-xs text-zinc-500">登录你的数字资产档案</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs text-zinc-400">用户名或邮箱</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="输入用户名或邮箱"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs text-zinc-400">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="输入密码"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm font-medium text-zinc-950 transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          还没有账号？{' '}
          <button onClick={onGoRegister} className="text-amber-400 hover:text-amber-300 transition-colors">
            注册新账号
          </button>
        </p>
      </div>
    </div>
  );
}
