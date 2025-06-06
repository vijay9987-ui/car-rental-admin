import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaCarSide,
  FaClipboardList,
  FaImages,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars
} from 'react-icons/fa';
import '../assets/sidebar.css';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobile }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/staff', icon: <FaUserTie />, label: 'Staff' },
    { path: '/admin/vehicles', icon: <FaCarSide />, label: 'Vehicles' },
    { path: '/admin/bookings', icon: <FaClipboardList />, label: 'Bookings' },
    { path: '/admin/banners', icon: <FaImages />, label: 'Banners' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
    { 
      path: '/logout', // fake path, not used for navigation
      icon: <FaSignOutAlt />, 
      label: 'Logout',
      onClick: () => {
        sessionStorage.removeItem('adminUser');
        window.location.href = '/';
      }
    }
  ];

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}
      style={{
        transform: isMobile ? (isCollapsed ? 'translateX(-100%)' : 'translateX(0)') : 'none'
      }}
    >
      <div className="sidebar-header">
        {!isCollapsed && <h3 className="logo">CarRental</h3>}
        <button 
          className="toggle-btn"
          onClick={() => onToggleCollapse(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {isMobile && (
        <button 
          className="mobile-toggle-btn"
          onClick={() => onToggleCollapse(!isCollapsed)}
        >
          <FaBars />
        </button>
      )}

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.label}>
            {item.onClick ? (
              <div
                role="button"
                tabIndex={0}
                onClick={item.onClick}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') item.onClick(); }}
                className={`menu-item logout-item ${location.pathname === item.path ? 'active' : ''}`}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <span className="menu-icon">{item.icon}</span>
                {!isCollapsed && <span className="menu-text">{item.label}</span>}
                {isCollapsed && <span className="tooltip">{item.label}</span>}
              </div>
            ) : (
              <Link
                to={item.path}
                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                {!isCollapsed && <span className="menu-text">{item.label}</span>}
                {isCollapsed && <span className="tooltip">{item.label}</span>}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default Sidebar;
