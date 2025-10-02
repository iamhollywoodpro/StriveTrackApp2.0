import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';

function LoginPage() {
  const { login, register, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        showMessage('Welcome back! Redirecting...', 'success');
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('Login failed. Please try again.', 'error');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { email, password, fullName } = registerForm;
    
    if (!email || !password || !fullName) {
      showMessage('Please fill all fields', 'error');
      return;
    }

    if (password.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await register(email, password, fullName);
      if (result.success) {
        showMessage('Account created! Welcome! 🎉', 'success');
      } else {
        showMessage(result.error, 'error');
      }
    } catch (error) {
      showMessage('Registration failed. Please try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-elevation-3 p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl mb-4">
              <span className="text-2xl font-bold text-white">ST</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">StriveTrack</h1>
            <p className="text-slate-600 italic">
              "The only bad workout is the one that didn't happen."
            </p>
            <p className="text-sm text-slate-500 mt-1">- Fitness Wisdom</p>
          </div>

          {/* Forms */}
          <div className="space-y-6">
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    placeholder="Enter your email"
                    className="input w-full"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    placeholder="Enter your password"
                    className="input w-full"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </span>
                  ) : (
                    <>🚀 Sign In</>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    placeholder="Enter your email"
                    className="input w-full"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                    placeholder="Create password (8+ chars)"
                    className="input w-full"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                    placeholder="Enter your name"
                    className="input w-full"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </span>
                  ) : (
                    <>💪 Create Account</>
                  )}
                </button>
              </form>
            )}

            {/* Quick Access */}
            <div className="text-center">
              <div className="text-sm text-slate-500 mb-3">QUICK ACCESS</div>
              <button className="w-full btn btn-secondary py-3 mb-3">
                📱 Install App
              </button>
              <p className="text-xs text-slate-500">Get native app experience with offline access</p>
            </div>

            {/* Switch Forms */}
            <div className="text-center pt-4 border-t border-slate-200">
              <p className="text-slate-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary-500 font-semibold hover:text-primary-600 transition-colors"
                  disabled={loading}
                >
                  {isLogin ? 'Create one here' : 'Sign in here'}
                </button>
              </p>
            </div>

            {/* Social Login Options */}
            <div className="space-y-3">
              <div className="text-center text-sm text-slate-500">Or continue with</div>
              <div className="space-y-2">
                <button className="w-full btn btn-secondary py-3 flex items-center justify-center">
                  <span className="mr-3">🌐</span>
                  Continue with Google
                </button>
                <button className="w-full btn btn-secondary py-3 flex items-center justify-center">
                  <span className="mr-3">📘</span>
                  Continue with Facebook
                </button>
                <button className="w-full btn btn-secondary py-3 flex items-center justify-center">
                  <span className="mr-3">🍎</span>
                  Continue with Apple
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-4 rounded-xl text-center animate-fade-in ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;