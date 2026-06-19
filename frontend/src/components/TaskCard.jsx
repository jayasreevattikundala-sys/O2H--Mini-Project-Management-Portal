import React from 'react';
import { Trash2, Edit, Play, CheckCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TaskCard = ({ task, onStatusChange, onDelete }) => {
  const navigate = useNavigate();
  const { id, title, description, status, created_at } = task;

  // Format date nicely
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'completed';
      case 'In Progress':
        return 'progress';
      case 'Pending':
      default:
        return 'pending';
    }
  };

  return (
    <div className="glass-card task-card">
      <div>
        <div className="task-card-header">
          <span className={`badge ${getStatusClass(status)}`}>{status}</span>
        </div>
        <h3 className="task-title" title={title}>{title}</h3>
        <p className="task-desc" title={description}>{description}</p>
      </div>

      <div className="task-card-footer">
        <span className="task-date">{formatDate(created_at)}</span>
        
        <div className="task-actions">
          {status === 'Pending' && (
            <>
              <button
                onClick={() => onStatusChange(id, 'In Progress')}
                className="btn-icon-only"
                title="Start Task"
                style={{ color: 'var(--status-progress)' }}
              >
                <Play size={15} />
              </button>
              <button
                onClick={() => onStatusChange(id, 'Completed')}
                className="btn-icon-only"
                title="Complete Task"
                style={{ color: 'var(--status-completed)' }}
              >
                <CheckCircle size={15} />
              </button>
            </>
          )}

          {status === 'In Progress' && (
            <button
              onClick={() => onStatusChange(id, 'Completed')}
              className="btn-icon-only"
              title="Complete Task"
              style={{ color: 'var(--status-completed)' }}
            >
              <CheckCircle size={15} />
            </button>
          )}

          {status === 'Completed' && (
            <button
              onClick={() => onStatusChange(id, 'Pending')}
              className="btn-icon-only"
              title="Reopen Task"
              style={{ color: 'var(--status-pending)' }}
            >
              <RotateCcw size={15} />
            </button>
          )}

          <button
            onClick={() => navigate(`/edit-task/${id}`)}
            className="btn-icon-only"
            title="Edit Task"
            style={{ color: 'var(--primary)' }}
          >
            <Edit size={15} />
          </button>

          <button
            onClick={() => onDelete(id)}
            className="btn-icon-only"
            title="Delete Task"
            style={{ color: 'var(--status-danger)' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
