import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

const TopNavbar = ({ onToggleSidebar }) => {
  return (
    <Navbar
      bg="light"
      expand="lg"
      className="shadow-sm px-3"
      sticky="top"
      collapseOnSelect
    >
      <Container fluid>
        <button 
          className="navbar-toggler me-2" 
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <Navbar.Brand className="fw-bold text-primary">
          Admin Panel
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
