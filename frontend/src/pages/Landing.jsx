import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="text-2xl font-bold text-white">
          <span className="text-purple-400">Smart</span> LMS
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link 
            to="/signup" 
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Master Your Learning
            <span className="block text-purple-400">Achieve Your Goals</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            A comprehensive learning management system that helps you track courses, 
            manage tasks, plan your studies, and analyze your progress—all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-semibold text-lg shadow-lg shadow-purple-500/30"
            >
              Start Free
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-transparent border-2 border-gray-600 hover:border-gray-400 text-white rounded-xl transition-all font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <div className="w-14 h-14 bg-purple-600/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Course Management</h3>
            <p className="text-gray-400">
              Organize and track your courses in one place. Access materials, 
              monitor progress, and stay on top of your learning journey.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Task Tracking</h3>
            <p className="text-gray-400">
              Keep track of assignments, deadlines, and to-dos. Never miss 
              an important deadline again with smart task management.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <div className="w-14 h-14 bg-green-600/20 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Analytics & Insights</h3>
            <p className="text-gray-400">
              Gain valuable insights into your learning patterns. Track progress, 
              identify trends, and optimize your study strategies.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-gray-400 mb-8">Join thousands of students already using Smart LMS</p>
          <Link 
            to="/signup" 
            className="inline-block px-10 py-4 bg-white text-purple-900 hover:bg-gray-100 rounded-xl transition-colors font-semibold text-lg"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-8 text-center text-gray-500">
          <p>© 2026 Smart LMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;