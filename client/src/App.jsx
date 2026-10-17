import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ChatLayout from './components/chat/ChatLayout';
import { Loader2, ShieldCheck, Zap, Lock } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 text-blue-600">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <p className="text-sm font-semibold text-gray-500">Initializing secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="mb-6 text-center text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-200 mb-3 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Automatic Phone & Email Masking Engine
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Real-Time Private Chat</h1>
          <p className="text-xs text-slate-400 mt-1">Zero polling • Instant WebSockets • MySQL 8 Engine</p>
        </div>

        {authView === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthView('login')} />
        )}

        <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-400" /> End-to-end PII Sanitized
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Socket.IO Event Engine
          </span>
        </div>
      </div>
    );
  }

  return (
    <SocketProvider>
      <ChatLayout />
    </SocketProvider>
  );
}
