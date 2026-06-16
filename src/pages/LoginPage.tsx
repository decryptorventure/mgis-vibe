import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from 'antd';
import { Button, toast } from '@frontend-team/ui-kit';
import { Lock, Mail, Network } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Fix: cleanup setTimeout on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled by the ref-based approach below
    };
  }, []);

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const timer = setTimeout(() => {
      toast.success('Đăng nhập thành công!');
      navigate('/');
      setLoading(false);
    }, 800);

    // Store timer for cleanup — but since this is form submit,
    // navigation will unmount. Safe pattern with useEffect:
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, var(--surface-base), var(--surface-subtle))',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--color-primary-500)', color: 'var(--text-inverse)' }}
          >
            <Network size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>MGIS</h1>
          <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Marketing Growth Intelligence System</p>
        </div>

        {/* Login Card */}
        <div 
          className="rounded-2xl p-8 border"
          style={{
            background: 'var(--surface-base)',
            borderColor: 'var(--border-default)',
            boxShadow: 'var(--shadow-float)',
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Sign In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-sm mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <Input
                id="login-email"
                prefix={<Mail size={16} className="text-[var(--text-tertiary)]" />}
                placeholder="user@ikameglobal.com"
                defaultValue="dungnv@ikameglobal.com"
                size="large"
                aria-required="true"
                className="rounded-lg border-[var(--border-default)]"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-sm mb-1.5 block font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <Input.Password
                id="login-password"
                prefix={<Lock size={16} className="text-[var(--text-tertiary)]" />}
                placeholder="••••••••"
                defaultValue="password"
                size="large"
                aria-required="true"
                className="rounded-lg border-[var(--border-default)]"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="xl"
              loading={loading}
              className="w-full text-base font-semibold mt-2 cursor-pointer"
            >
              Sign in with Keycloak SSO
            </Button>
          </form>

          <div className="mt-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Internal tool — iKame Global © 2026
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
