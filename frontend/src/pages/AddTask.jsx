import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../services/api';
import { PlusCircle, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

const AddTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validations
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
      await createTask({
        title: title.trim(),
        description: description.trim(),
        status,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card-container">
      <div className="glass-card task-form-card">
        <div className="form-header">
          <button onClick={() => navigate('/')} className="btn btn-text" style={{ paddingLeft: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h2>Create New Task</h2>
          <p>Define details for your project task</p>
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
              placeholder="Provide a detailed description of what needs to be accomplished in this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <span style={{ fontSize: '0.8rem', color: description.trim().length >= 20 ? 'var(--status-completed)' : 'var(--text-secondary)', textAlign: 'right' }}>
              {description.trim().length} / 20 characters
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Initial Status</label>
            <select
              id="status"
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
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
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
