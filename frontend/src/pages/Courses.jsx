import React, { useState, useEffect } from 'react';
import { coursesAPI, tasksAPI } from '../services/api';
import { Plus, BookOpen, Edit, Trash2, X, FolderOpen } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesAPI.getAll();
      setCourses(res.data);
      // Fetch tasks for each course
      const tasksData = {};
      for (const course of res.data) {
        const tasksRes = await tasksAPI.getAll({ course_id: course.id });
        tasksData[course.id] = tasksRes.data;
      }
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to fetch courses', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await coursesAPI.update(editingCourse.id, formData);
      } else {
        await coursesAPI.create(formData);
      }
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ title: '', description: '', category: '' });
      fetchCourses();
    } catch (err) {
      console.error('Failed to save course', err);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({ title: course.title, description: course.description || '', category: course.category || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await coursesAPI.delete(id);
        fetchCourses();
      } catch (err) {
        console.error('Failed to delete course', err);
      }
    }
  };

  const getCourseProgress = (courseId) => {
    const courseTasks = tasks[courseId] || [];
    if (courseTasks.length === 0) return 0;
    const completed = courseTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / courseTasks.length) * 100);
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
          <p className="text-gray-500">Manage your learning courses</p>
        </div>
        <button
          onClick={() => { setEditingCourse(null); setFormData({ title: '', description: '', category: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(course)} className="p-2 text-gray-400 hover:text-blue-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description || 'No description'}</p>
                {course.category && (
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {course.category}
                  </span>
                )}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-800">{getCourseProgress(course.id)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${getCourseProgress(course.id)}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-3">
                  {(tasks[course.id] || []).length} tasks
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingCourse ? 'Edit Course' : 'Add Course'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Programming, Design"
                />
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
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;