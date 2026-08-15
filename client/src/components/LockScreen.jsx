import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { setAuthToken } from '../api';

export default function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleUnlock = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Incorrect password.');
        setPassword('');
        inputRef.current?.focus();
      } else {
        setAuthToken(data.token, rememberMe);
        onUnlock(data.token);
      }
    } catch (err) {
      setError('Server unreachable. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gruvbox-bgHard flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-sm glass-panel-elevated rounded-2xl p-7 border border-gruvbox-bg1 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gruvbox-bg1 border border-gruvbox-bg2 flex items-center justify-center text-gruvbox-yellow">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gruvbox-fgLight tracking-wide">SynapseVault</h1>
            <p className="text-[11px] text-gruvbox-gray">Personal Knowledge Base</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-gruvbox-red/10 border border-gruvbox-red/30 text-xs text-gruvbox-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-gruvbox-gray uppercase tracking-wider block mb-1.5">
              Vault Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gruvbox-gray absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-gruvbox-bg text-gruvbox-fg placeholder-gruvbox-gray/50 text-xs pl-9 pr-9 py-2.5 rounded-lg border border-gruvbox-bg1 focus:border-gruvbox-yellow/60 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gruvbox-gray hover:text-gruvbox-fg p-0.5"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gruvbox-gray">
            <label className="flex items-center gap-2 cursor-pointer hover:text-gruvbox-fg">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-gruvbox-yellow rounded"
              />
              <span>Remember session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!password.trim() || loading}
            className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
              password.trim() && !loading
                ? 'bg-gruvbox-yellow hover:bg-gruvbox-yellowDim text-gruvbox-bgHard cursor-pointer'
                : 'bg-gruvbox-bg1 text-gruvbox-gray cursor-not-allowed opacity-50'
            }`}
          >
            {loading ? (
              <span>Unlocking...</span>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock Vault</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
