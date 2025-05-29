import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 992) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={setIsSidebarCollapsed}
        isMobile={isMobile}
        jsx="true"
      />
      
      <div 
        className="main-content"
        style={{
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '250px'),
          transition: 'margin-left 0.3s ease'
        }}
      >
        <TopNavbar 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          position: relative;
        }
        
        .main-content {
          flex: 1;
          transition: margin-left 0.3s ease;
          width: ${isMobile ? '100%' : `calc(100% - ${isSidebarCollapsed ? '80px' : '250px'})`};
        }
        
        .content-wrapper {
          padding: 20px;
          min-height: calc(100vh - 60px);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;