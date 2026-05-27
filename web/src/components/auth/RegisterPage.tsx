import { useState, type FormEvent } from 'react';
import BrandMark from '../shared/BrandMark';

interface Props {
  onLogin: (token: string, user: { id: number; username: string; displayName: string; city: string | null }) => void;
  onGoLogin: () => void;
}

export default function RegisterPage({ onLogin, onGoLogin }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, displayName: displayName || undefined, city: city || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('herein-token', data.token);
      localStorage.setItem('herein-user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <p className="text-xs text-zinc-500">注册你的数字资产档案</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-xs text-zinc-400">用户名 *</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="选择一个用户名"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs text-zinc-400">邮箱 *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs text-zinc-400">密码 *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors"
              placeholder="至少6个字符"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="text-xs text-zinc-400">显示名称</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors"
                placeholder="可选"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="city" className="text-xs text-zinc-400">城市</label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-600 transition-colors"
                placeholder="可选"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-sm font-medium text-zinc-950 transition-colors"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          已有账号？{' '}
          <button onClick={onGoLogin} className="text-amber-400 hover:text-amber-300 transition-colors">
            去登录
          </button>
        </p>
      </div>
    </div>
  );
}
