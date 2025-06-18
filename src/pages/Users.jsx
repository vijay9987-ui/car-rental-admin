import React, { useEffect, useState } from 'react';
import { Button, Modal, Table, Row, Col, Form, Spinner, Alert, Pagination, Image, Dropdown, FormControl } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', profileImage: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailedUser, setDetailedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('name');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://194.164.148.244:4062/api/admin/allusers');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data.users || []);
        setFilteredUsers(data.users || []);
        // toast.success('Users fetched successfully!');
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const value = user[filterField] ? user[filterField].toString().toLowerCase() : '';
        return value.includes(searchTerm.toLowerCase());
      });
      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, filterField, users]);

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
        toast.info('Add user API not implemented.');
      }

      setShow(false);
      setEditingIndex(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (index) => {
    const user = filteredUsers[index];
    const confirmDelete = window.confirm(`Are you sure you want to delete user ${user.name}?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://194.164.148.244:4062/api/admin/deleteuser/${user.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');

      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);

      toast.success('User deleted successfully!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const res = await fetch(`http://194.164.148.244:4062/api/users/get-user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user details');
      const data = await res.json();
      setDetailedUser(data.user);
      setShowDetailsModal(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const downloadExcel = () => {
    // Prepare data for Excel
    const data = users.map(user => ({
      ID: user.id,
      Name: user.name || '-',
      Email: user.email || '-',
      Mobile: user.mobile || '-',
      'Profile Image': user.profileImage || '-',
      'Created At': user.createdAt ? new Date(user.createdAt) : '-',
      'Updated At': user.updatedAt ? new Date(user.updatedAt) : '-',
      'Total Bookings': user.myBookings?.length || 0,
      'Wallet Amount': user.totalWalletAmount || 0,
      'Aadhar Status': user.documents?.aadharCard?.status || 'Not uploaded',
      'License Status': user.documents?.drivingLicense?.status || 'Not uploaded'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    // Generate file and download
    XLSX.writeFile(wb, "users_data.xlsx");
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

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
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Users Management</h2>
        {/* <Button
          variant="primary"
          onClick={() => handleShow()}
        >
          Add New User
        </Button> */}
      </div>

      {/* Updated Search and Filter Section to match Staff component */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
          >
            <option value="id">Filter by Id</option>
            <option value="email">Filter by Email</option>
            <option value="mobile">Filter by Mobile</option>
            <option value="name">Filter by Name</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <FormControl
            type="text"
            placeholder={`Search by ${filterField}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={3} className="text-end">
          <Button
            variant="success"
            onClick={downloadExcel}
            className="ms-2"
          >
            <i className="fas fa-file-excel me-2"></i>Export to Excel
          </Button>
        </Col>
      </Row>

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
                  }}
                >
                  <th onClick={() => requestSort('id')}>
                    SNO {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('id')}>
                    ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Profile</th>
                  <th onClick={() => requestSort('name')}>
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('mobile')}>
                    Mobile {sortConfig.key === 'mobile' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('email')}>
                    Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((u, i) => (
                    <tr key={indexOfFirstUser + i}>
                      <td className="text-center">{indexOfFirstUser + i + 1}</td>
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
                      <td className="text-center align-middle">
                        <button
                          size="sm"
                          onClick={() => handleShow(u, users.findIndex(user => user.id === u.id))}
                          className="me-1 mb-1 mt-1 ms-1 btn btn-sm btn-outline-warning"
                        >
                          <i className="fas fa-edit "></i>
                        </button>
                        <button
                          size="sm"
                          onClick={() => handleDelete(filteredUsers.findIndex(user => user.id === u.id))}
                          className=" btn btn-sm btn-outline-danger"
                        >
                          <i className="fas fa-trash "></i>
                        </button>
                      </td>
                      <td className="text-center align-middle">
                        <button
                          className="me-2 btn btn-sm btn-outline-info text-center"
                          onClick={() => handleViewDetails(u.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No users found</td>
                  </tr>
                )}
              </tbody>
            </Table>
            {renderPagination()}
          </div>
        </>
      )}

      {/* Edit User Modal */}
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

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailedUser ? (
            <>
              <Row className="mb-3">
                <Col md={4} className="text-center">
                  <Image
                    src={detailedUser.profileImage || "/profile.png"}
                    alt="Profile"
                    fluid
                    style={{
                      width: "250px",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "50%", // makes it a perfect circle
                      border: "2px solid #ccc" // optional: adds a light border
                    }}
                  />

                </Col>
                <Col md={8}>
                  <p><strong>userId: </strong> {detailedUser.id}</p>
                  <p><strong>Name: </strong>{detailedUser.name}</p>
                  <p><strong>Email:</strong> {detailedUser.email}</p>
                  <p><strong>Mobile:</strong> {detailedUser.mobile}</p>
                  <p><strong>Created At:</strong> {new Date(detailedUser.createdAt).toLocaleString()}</p>
                  <p><strong>Updated At:</strong> {new Date(detailedUser.updatedAt).toLocaleString()}</p>
                </Col>
              </Row>

              <hr />

              <h6>Bookings ({detailedUser.myBookings?.length || 0})</h6>
              <div className="table-responsive mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="table table-sm table-striped table-bordered">
                  <thead>
                    <tr className='table-header'>
                      <th>Car ID</th>
                      <th>Date</th>
                      <th>Pickup</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedUser.myBookings?.length > 0 ? (
                      detailedUser.myBookings.map((booking, idx) => (
                        <tr key={idx}>
                          <td>{booking.carId?.slice(-6)}</td>
                          <td>{booking.rentalStartDate}</td>
                          <td>{booking.pickupLocation}</td>
                          <td>{booking.from}</td>
                          <td>{booking.to}</td>
                          <td>₹{booking.totalPrice}</td>
                          <td>
                            <span className="badge bg-warning text-dark">{booking.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">No bookings found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <hr />

              <h6>Wallet Transactions (Total: ₹{detailedUser.totalWalletAmount || 0})</h6>
              <ul className="list-group mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {detailedUser.wallet?.length > 0 ? (
                  detailedUser.wallet.map((entry) => (
                    <li key={entry._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold">{entry.type?.toUpperCase()}</span>: {entry.message}
                        <div className="text-muted small">{new Date(entry.date).toLocaleString()}</div>
                      </div>
                      <span className="badge bg-primary rounded-pill">₹{entry.amount}</span>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-center">No wallet transactions</li>
                )}
              </ul>

              <hr />

              <h6>Documents</h6>
              <Row className="mb-4">
                <Col md={6} className="d-flex flex-column align-items-center text-center">
                  <p><strong>Aadhar Card:</strong></p>
                  {detailedUser.documents?.aadharCard?.url ? (
                    <>
                      <Image
                        src={detailedUser.documents.aadharCard.url}
                        style={{ maxWidth: "200px", height: "auto", marginBottom: "10px" }}
                        fluid
                        thumbnail
                      />
                      <p>Status: <span className="badge bg-info">{detailedUser.documents.aadharCard.status}</span></p>
                    </>
                  ) : (
                    <p>Not uploaded</p>
                  )}
                </Col>

                <Col md={6} className="d-flex flex-column align-items-center text-center">
                  <p><strong>Driving License:</strong></p>
                  {detailedUser.documents?.drivingLicense?.url ? (
                    <>
                      <Image
                        src={detailedUser.documents.drivingLicense.url}
                        style={{ maxWidth: "200px", height: "auto", marginBottom: "10px" }}
                        fluid
                        thumbnail
                      />
                      <p>Status: <span className="badge bg-info">{detailedUser.documents.drivingLicense.status}</span></p>
                    </>
                  ) : (
                    <p>Not uploaded</p>
                  )}
                </Col>
              </Row>

            </>
          ) : (
            <div className="text-center">
              <Spinner animation="border" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Users;