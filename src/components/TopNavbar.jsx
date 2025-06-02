import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';

const TopNavbar = ({ onToggleSidebar }) => {
  const storedUser = sessionStorage.getItem('adminUser');
  const sessionUser = storedUser ? JSON.parse(storedUser) : null;
  const name = sessionUser?.name;

  return (
    <Navbar
      bg="light"
      expand="lg"
      className="shadow-sm px-3"
      sticky="top"
      collapseOnSelect
    >
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Sidebar toggle button */}
        <button
          className="navbar-toggler me-2"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Brand name */}
        <Navbar.Brand className="fw-bold text-primary m-0">
          Admin Panel
        </Navbar.Brand>

        {/* Collapsible content (for small screens) */}
        <Navbar.Toggle aria-controls="admin-navbar-nav" />

        <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
          <Nav>
            <span className="navbar-text fw-semibold text-secondary text-end">
              Welcome, {name}
            </span>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
