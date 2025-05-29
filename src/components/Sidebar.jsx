import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaCarSide,
  FaClipboardList,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars
} from 'react-icons/fa';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobile }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/staff', icon: <FaUserTie />, label: 'Staff' },
    { path: '/admin/vehicles', icon: <FaCarSide />, label: 'Vehicles' },
    { path: '/admin/bookings', icon: <FaClipboardList />, label: 'Bookings' },
    { path: '/logout', icon: <FaSignOutAlt />, label: 'Logout' }
];
  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''}`}
      style={{
        transform: isMobile ? (isCollapsed ? 'translateX(-100%)' : 'translateX(0)') : 'none'
      }}
    >
      {/* Sidebar Header with Toggle Button */}
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

      {/* Mobile Toggle Button (only visible on small screens) */}
      {isMobile && (
        <button 
          className="mobile-toggle-btn"
          onClick={() => onToggleCollapse(!isCollapsed)}
        >
          <FaBars />
        </button>
      )}

      {/* Menu Items */}
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              {!isCollapsed && <span className="menu-text">{item.label}</span>}
              {isCollapsed && (
                <span className="tooltip">{item.label}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: fixed;
          top: 0;
          left: 0;
          transition: all 0.3s ease;
          z-index: 1000;
          overflow-x: hidden;
        }
        
        .sidebar.collapsed {
          width: 80px;
        }
        
        .sidebar.mobile {
          transform: translateX(-100%);
        }
        
        .sidebar.mobile:not(.collapsed) {
          transform: translateX(0);
          width: 250px;
        }
        
        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .logo {
          margin: 0;
          font-size: 1.2rem;
          white-space: nowrap;
        }
        
        .toggle-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .mobile-toggle-btn {
          display: none;
          position: fixed;
          bottom: 20px;
          left: 20px;
          background: #667eea;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 992px) {
          .mobile-toggle-btn {
            display: flex;
          }
        }
        
        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          margin: 5px 10px;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          transition: all 0.2s;
          position: relative;
        }
        
        .menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .menu-item.active {
          background: white;
          color: #764ba2;
          font-weight: 500;
        }
        
        .menu-icon {
          font-size: 1.2rem;
          min-width: 30px;
          display: flex;
          justify-content: center;
        }
        
        .menu-text {
          margin-left: 10px;
          white-space: nowrap;
        }
        
        .tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: #333;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 0.8rem;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s;
          pointer-events: none;
          margin-left: 15px;
        }
        
        .menu-item:hover .tooltip {
          opacity: 1;
          visibility: visible;
        }
      `}</style>
    </div>
  );
};

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default Sidebar;