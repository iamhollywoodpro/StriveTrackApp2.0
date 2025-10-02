import React from 'react';
import { useAuth } from '../../lib/auth-context';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg mr-3">
                <span className="text-lg font-bold text-white">ST</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">StriveTrack 2.1</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {user?.full_name || user?.email}! 👋</span>
              <button 
                onClick={logout}
                className="btn btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h2>
          <p className="text-slate-600">Your fitness journey at a glance</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Today's Workouts</h3>
              <span className="text-2xl">💪</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">2</p>
            <p className="text-sm text-green-600">+1 from yesterday</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Calories Burned</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">485</p>
            <p className="text-sm text-green-600">Goal: 500</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Streak</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">7</p>
            <p className="text-sm text-green-600">days</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600">Progress Photos</h3>
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">12</p>
            <p className="text-sm text-slate-600">this month</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Completed morning workout</p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📊</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Logged nutrition data</p>
                  <p className="text-xs text-slate-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🎯</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Updated fitness goals</p>
                  <p className="text-xs text-slate-500">Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn btn-primary p-4 flex flex-col items-center space-y-2">
                <span className="text-xl">💪</span>
                <span className="text-sm">Log Workout</span>
              </button>
              <button className="btn btn-secondary p-4 flex flex-col items-center space-y-2">
                <span className="text-xl">🍎</span>
                <span className="text-sm">Add Meal</span>
              </button>
              <button className="btn btn-secondary p-4 flex flex-col items-center space-y-2">
                <span className="text-xl">📸</span>
                <span className="text-sm">Progress Photo</span>
              </button>
              <button className="btn btn-secondary p-4 flex flex-col items-center space-y-2">
                <span className="text-xl">🎯</span>
                <span className="text-sm">Set Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Navigate</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <a href="/habits" className="btn btn-secondary p-4 flex flex-col items-center space-y-2 hover:bg-primary-50">
                <span className="text-xl">🎯</span>
                <span className="text-sm">Habits & Goals</span>
              </a>
              <a href="/nutrition" className="btn btn-secondary p-4 flex flex-col items-center space-y-2 hover:bg-primary-50">
                <span className="text-xl">🥗</span>
                <span className="text-sm">Nutrition</span>
              </a>
              <a href="/progress" className="btn btn-secondary p-4 flex flex-col items-center space-y-2 hover:bg-primary-50">
                <span className="text-xl">📈</span>
                <span className="text-sm">Progress & Media</span>
              </a>
              <a href="/community" className="btn btn-secondary p-4 flex flex-col items-center space-y-2 hover:bg-primary-50">
                <span className="text-xl">👥</span>
                <span className="text-sm">Community</span>
              </a>
              {user?.is_admin && (
                <a href="/admin" className="btn btn-primary p-4 flex flex-col items-center space-y-2">
                  <span className="text-xl">⚙️</span>
                  <span className="text-sm">Admin</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;