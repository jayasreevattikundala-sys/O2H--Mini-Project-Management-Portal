import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateTask, getTasks } from '../services/api';
import { Save, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        setFetching(true);
        setError('');
        // Fetch tasks and find the matching ID (or fetch by single ID)
        // Since we retrieve stats + tasks, we can query tasks list directly
        const data = await getTasks();
        const foundTask = data.tasks.find((t) => t.id === id);
        
        if (foundTask) {
          setTitle(foundTask.title);
          setDescription(foundTask.description);
          setStatus(foundTask.status);
        } else {
          setError('Task not found or not authorized to access.');
        }
      } catch (err) {
        setError('Failed to fetch task details.');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!description.trim()) {
      setError('Task description is required');
      return;
    }

    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    try {
      setLoading(true);
      await updateTask(id, {
        title: title.trim(),
        description: description.trim(),
        status,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <Loader2 className="spinner" size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading task details...</p>
      </div>
    );
  }

  return (
    <div className="form-card-container">
      <div className="glass-card task-form-card">
        <div className="form-header">
          <button onClick={() => navigate('/')} className="btn btn-text" style={{ paddingLeft: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h2>Edit Task</h2>
          <p>Modify task title, description, or execution status</p>
        </div>

        {error && (
          <div className="form-error" style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--status-danger-bg)', borderRadius: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Task Title</label>
            <input
              id="title"
              type="text"
              className="form-control"
              placeholder="e.g. Build Login Screen UI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description (Minimum 20 characters)</label>
            <textarea
              id="description"
              className="form-control"
              rows="4"
              placeholder="Provide a detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <span style={{ fontSize: '0.8rem', color: description.trim().length >= 20 ? 'var(--status-completed)' : 'var(--text-secondary)', textAlign: 'right' }}>
              {description.trim().length} / 20 characters
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Status</label>
            <select
              id="status"
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
