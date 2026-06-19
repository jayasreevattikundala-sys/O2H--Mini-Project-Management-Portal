import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { LogOut, CheckSquare, User } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Retrieve user info safely
  let user = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error('Failed to parse user details:', error);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <CheckSquare size={24} />
          <span>TaskPulse</span>
        </Link>

        <div className="header-actions">
          {token && user ? (
            <>
              <div className="user-info">
                <User size={16} />
                <span>{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem' }}
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              {window.location.pathname !== '/login' && (
                <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Login
                </Link>
              )}
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
