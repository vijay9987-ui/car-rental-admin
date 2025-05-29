import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import PropTypes from 'prop-types';

const TopNavbar = ({ isSidebarCollapsed, onToggleSidebar }) => {
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
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {/* Future navigation links (optional) */}
            {/* <Nav.Link href="/profile">Profile</Nav.Link>
            <Nav.Link href="/settings">Settings</Nav.Link> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

TopNavbar.propTypes = {
  isSidebarCollapsed: PropTypes.bool,
  onToggleSidebar: PropTypes.func
};

export default TopNavbar;