import React, { useState, useEffect } from 'react';
import { plannerAPI, tasksAPI } from '../services/api';
import { Plus, Calendar, Edit, Trash2, X, CheckCircle, Clock, Sparkles } from 'lucide-react';

const Planner = () => {
  const [plans, setPlans] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    task_id: '',
    scheduled_date: '',
    start_time: '09:00',
    end_time: '10:00',
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      const startDate = selectedDate;
      const endDate = selectedDate;
      const [plansRes, tasksRes] = await Promise.all([
        plannerAPI.getPlans({ start_date: startDate, end_date: endDate }),
        tasksAPI.getAll({ status: 'pending' }),
      ]);
      setPlans(plansRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await plannerAPI.generate(7);
      fetchData();
    } catch (err) {
      console.error('Failed to generate plan', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        start_time: formData.start_time ? formData.start_time + ':00' : null,
        end_time: formData.end_time ? formData.end_time + ':00' : null,
      };
      await plannerAPI.createPlan(data);
      setShowModal(false);
      setFormData({ task_id: '', scheduled_date: '', start_time: '09:00', end_time: '10:00' });
      fetchData();
    } catch (err) {
      console.error('Failed to create plan', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this study plan?')) {
      try {
        await plannerAPI.deletePlan(id);
        fetchData();
      } catch (err) {
        console.error('Failed to delete plan', err);
      }
    }
  };

  const handleToggleComplete = async (plan) => {
    try {
      await plannerAPI.updatePlan(plan.id, { completed: !plan.completed });
      fetchData();
    } catch (err) {
      console.error('Failed to update plan', err);
    }
  };

  const getTaskTitle = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task?.title || 'Unknown Task';
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Planner</h1>
          <p className="text-gray-500">Plan and schedule your study sessions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating...' : 'Auto Schedule'}
          </button>
          <button
            onClick={() => { setFormData({ ...formData, scheduled_date: selectedDate }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Session
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`p-3 rounded-lg text-center transition-colors ${
                date === selectedDate
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="text-xs font-medium">{dayNames[index]}</div>
              <div className="text-lg font-bold">{new Date(date).getDate()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Study Sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Study Sessions for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No study sessions scheduled for this day</p>
            <p className="text-gray-400 text-sm mt-1">Click "Auto Schedule" to generate a smart study plan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div key={plan.id} className={`flex items-center justify-between p-4 rounded-lg ${plan.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleComplete(plan)}
                    className={`p-2 rounded-full ${plan.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400 hover:bg-green-500 hover:text-white'} transition-colors`}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className={`font-medium ${plan.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                      {getTaskTitle(plan.task_id)}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(plan.start_time)} - {formatTime(plan.end_time)}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add Study Session</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                <select
                  value={formData.task_id}
                  onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>{task.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;