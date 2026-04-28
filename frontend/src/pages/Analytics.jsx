import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart3, TrendingUp, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [progress, setProgress] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, progressRes, weeklyRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getProgress(),
        analyticsAPI.getWeekly(8),
      ]);
      setOverview(overviewRes.data);
      setProgress(progressRes.data);
      setWeekly(weeklyRes.data.reverse());
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500">Track your learning progress and statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {overview?.total_tasks > 0 
                  ? Math.round((overview?.completed_tasks / overview?.total_tasks) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.completed_tasks || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Study Hours</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.total_study_hours || 0}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Deadlines</p>
              <p className="text-2xl font-bold text-gray-800">{overview?.upcoming_deadlines || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Weekly Study Hours
          </h2>
          {weekly.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <Line 
                  type="monotone" 
                  dataKey="study_hours" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  name="Study Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No study data yet
            </div>
          )}
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Course Progress
          </h2>
          {progress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course_title" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="completion_percentage" fill="#10B981" radius={[4, 4, 0, 0]} name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No courses yet
            </div>
          )}
        </div>
      </div>

      {/* Task Distribution */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Task Distribution by Status
        </h2>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {overview?.total_tasks > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: overview?.completed_tasks },
                    { name: 'Pending', value: overview?.pending_tasks },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No tasks yet
            </div>
          )}

          {/* Task Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{overview?.completed_tasks || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{overview?.pending_tasks || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                <span className="text-gray-700">Total</span>
              </div>
              <span className="text-xl font-bold text-gray-800">{overview?.total_tasks || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Table */}
      {progress.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Course</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Total Tasks</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Completed</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Progress</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((item, index) => (
                  <tr key={item.course_id} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-800">{item.course_title}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.tasks_total}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{item.tasks_completed}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.completion_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.completion_percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;