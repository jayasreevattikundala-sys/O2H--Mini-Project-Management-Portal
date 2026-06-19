import React from 'react';
import { ClipboardList, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

const TaskStats = ({ stats }) => {
  const { total = 0, pending = 0, inProgress = 0, completed = 0 } = stats || {};

  return (
    <div className="stats-grid">
      <div className="glass-card stat-card total">
        <div className="stat-info">
          <h3>Total Tasks</h3>
          <p>{total}</p>
        </div>
        <div className="stat-icon">
          <ClipboardList size={22} />
        </div>
      </div>

      <div className="glass-card stat-card pending">
        <div className="stat-info">
          <h3>Pending</h3>
          <p>{pending}</p>
        </div>
        <div className="stat-icon">
          <Clock size={22} />
        </div>
      </div>

      <div className="glass-card stat-card progress">
        <div className="stat-info">
          <h3>In Progress</h3>
          <p>{inProgress}</p>
        </div>
        <div className="stat-icon">
          <RefreshCw size={22} />
        </div>
      </div>

      <div className="glass-card stat-card completed">
        <div className="stat-info">
          <h3>Completed</h3>
          <p>{completed}</p>
        </div>
        <div className="stat-icon">
          <CheckCircle2 size={22} />
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
