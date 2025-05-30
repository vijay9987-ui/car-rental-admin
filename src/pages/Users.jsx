import React, { useEffect, useState } from 'react';
import { Button, Modal, Table, Form, Spinner, Alert, Pagination, Image } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', profileImage: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://194.164.148.244:4062/api/admin/allusers');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users || []);
        toast.success('Users fetched successfully!');
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleShow = (user = { name: '', email: '', mobile: '', profileImage: '' }, index = null) => {
    setEditingIndex(index);
    setFormData(user);
    setShow(true);
  };

  const handleSave = async () => {
    try {
      if (editingIndex !== null) {
        const userId = users[editingIndex].id;
        const res = await fetch(`http://194.164.148.244:4062/api/admin/updateuser/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error('Failed to update user');

        const updatedUsers = [...users];
        updatedUsers[editingIndex] = { ...updatedUsers[editingIndex], ...formData };
        setUsers(updatedUsers);

        toast.success('User updated successfully!');
      } else {
        // Optional: handle creation if API is available
        toast.info('Add user API not implemented.');
      }

      setShow(false);
      setEditingIndex(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (index) => {
    const user = users[index];
    const confirmDelete = window.confirm(`Are you sure you want to delete user ${user.name}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://194.164.148.244:4062/api/admin/deleteuser/${user.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');

      const updatedUsers = users.filter((_, i) => i !== index);
      setUsers(updatedUsers);

      toast.success('User deleted successfully!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const renderPagination = () => {
    const pages = [];
    for (let number = 1; number <= totalPages; number++) {
      pages.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Item
          disabled={currentPage === 1}
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
        >
          Prev
        </Pagination.Item>
        {pages}
        <Pagination.Item
          disabled={currentPage === totalPages}
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        >
          Next
        </Pagination.Item>
      </Pagination>
    );
  };

  return (
    <div className="p-3">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <div className="d-flex justify-content-center align-items-center mb-3">
        <h3 className="mb-4 text-center">Users Management</h3>
        {/* <Button
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white"
          }}
          onClick={() => handleShow()}
        >
          Add User
        </Button> */}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <div className='table-responsive'>
            <Table striped bordered hover responsive>
              <thead>
                <tr
                  className='table-header'
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    textAlign: "center"
                  }} //gradient-header  css for gradient
                >
                  <th>SNO</th>
                  <th>ID</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((u, i) => (
                  <tr key={indexOfFirstUser + i}>
                    <td>{indexOfFirstUser + i + 1}</td>
                    <td>{u.id?.slice(-6) || '-'}</td>
                    <td>
                      <Image
                        src={u.profileImage ? u.profileImage : "/profile.png"}
                        alt="profile"
                        roundedCircle
                        width="40"
                        height="40"
                      />

                    </td>
                    <td>{u.name || '-'}</td>
                    <td>{u.mobile || '-'}</td>
                    <td>{u.email || '-'}</td>
                    <td>
                      <button
                        size="sm"
                        onClick={() => handleShow(u, indexOfFirstUser + i)}
                        className="me-2 btn btn-sm btn-outline-warning"
                      >
                        <i className="fas fa-edit me-1"></i>
                      </button>
                      <button
                        size="sm"
                        onClick={() => handleDelete(indexOfFirstUser + i)}
                        className="me-2 btn btn-sm btn-outline-danger"
                      >
                        <i className="fas fa-trash me-1"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {renderPagination()}
          </div>
        </>
      )}

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingIndex !== null ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile</Form.Label>
              <Form.Control
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Image URL</Form.Label>
              <Form.Control
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;
