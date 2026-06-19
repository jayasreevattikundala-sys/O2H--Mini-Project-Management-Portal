import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, updateTask, deleteTask } from '../services/api';
import TaskStats from '../components/TaskStats';
import TaskCard from '../components/TaskCard';
import { Plus, Search, ClipboardList, Loader2, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 6, totalPages: 1, totalTasks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering / Sorting State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Authenticate user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch Tasks with all query parameters
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoading(true);
      setError('');
      const data = await getTasks({
        search,
        status,
        sort,
        page,
        limit: 6,
      });

      setTasks(data.tasks);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tasks. Please reload.');
    } finally {
      setLoading(false);
    }
  }, [search, status, sort, page]);

  // Trigger search / filter fetch
  useEffect(() => {
    // Reset page to 1 on filters change to prevent out-of-bound errors
    setPage(1);
  }, [search, status, sort]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, page]);

  // Handle status update
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTask(id, { status: newStatus });
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to update task status.');
    }
  };

  // Handle deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchTasks(); // Refresh list
      } catch (err) {
        console.error(err);
        alert('Failed to delete task.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Statistics section */}
      <TaskStats stats={stats} />

      {/* Filter and Search controls */}
      <div className="glass-card controls-panel">
        <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
          <div className="search-box">
            <input
              type="text"
              className="form-control search-input"
              placeholder="Search tasks by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="search-icon" size={18} />
          </div>

          <div className="filters-wrapper">
            <select
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              title="Filter by status"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <select
              className="sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              title="Sort by date"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>Project Tasks</h2>
          <p>
            {pagination.totalTasks} task{pagination.totalTasks !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add-task')}>
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Errors display */}
      {error && (
        <div className="form-error" style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--status-danger-bg)', borderRadius: '12px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Task Listing states */}
      {loading ? (
        <div className="loading-container">
          <Loader2 className="spinner" size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Fetching tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card empty-state">
          <div className="empty-state-icon">
            <ClipboardList size={32} />
          </div>
          <h3>No tasks found</h3>
          <p>
            {status !== 'All' || search
              ? "We couldn't find any tasks matching your filters. Try clearing some filters or searching something else!"
              : 'You have not added any tasks yet. Press the button below to get started!'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/add-task')}>
            <Plus size={16} />
            <span>Create First Task</span>
          </button>
        </div>
      ) : (
        <>
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {pagination.totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
