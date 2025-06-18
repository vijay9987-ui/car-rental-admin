import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Table,
  Spinner,
  Alert,
  Image,
  Pagination,
  Row,
  Col,
} from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import 'react-toastify/dist/ReactToastify.css';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    profileImage: '',
    address: '',
    role: 'staff',
    status: 'active',
  });
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const staffPerPage = 5;
  const indexOfLastStaff = currentPage * staffPerPage;
  const indexOfFirstStaff = indexOfLastStaff - staffPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirstStaff, indexOfLastStaff);
  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);

  // Filter & Search
  const [filterField, setFilterField] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = staffList.filter((staff) =>
      staff[filterField]?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStaff(filtered);
    setCurrentPage(1);
  };

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

  const fetchStaff = async () => {
    try {
      const res = await fetch('http://194.164.148.244:4062/api/admin/getallstaffs');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaffList(data.staff || []);
      setFilteredStaff(data.staff || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      mobile: staff.mobile,
      profileImage: staff.profileImage || 'default-profile-image.jpg',
      address: staff.address || '',
      role: staff.role || 'staff',
      status: staff.status || 'active',
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      mobile: '',
      profileImage: 'default-profile-image.jpg',
      address: '',
      role: 'staff',
      status: 'active',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingStaff ? 'PUT' : 'POST';
      const url = editingStaff
        ? `http://194.164.148.244:4062/api/admin/updatestaff/${editingStaff._id}`
        : 'http://194.164.148.244:4062/api/admin/addstaff';

      const payload = {
        ...formData,
        createdBy: 'admin',
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(editingStaff ? 'Failed to update staff' : 'Failed to add staff');

      toast.success(editingStaff ? 'Staff updated successfully!' : 'Staff added successfully!');
      await fetchStaff();
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await fetch(
        `http://194.164.148.244:4062/api/admin/deletestaff/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete staff');
      toast.success('Staff deleted successfully!');
      await fetchStaff();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      staffList.map((staff) => ({
        ID: staff._id,
        Name: staff.name,
        Email: staff.email,
        Mobile: staff.mobile,
        Address: staff.address,
        Role: staff.role,
        Status: staff.status,
        ProfileImage: staff.profileImage,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'StaffList');
    XLSX.writeFile(workbook, 'StaffList.xlsx');
  };

  return (
    <div className="container-fluid p-3">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className='d-flex justify-content-between'>
        <h2 className="mb-4 text-center">Staff Members</h2>
        <div>
          <Button variant="primary" onClick={openAddModal}>
            <i className="fas fa-plus me-2"></i>Add Staff
          </Button>
        </div>
      </div>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
            <option value="id">Filter by Id</option>
            <option value="name">Filter by Name</option>
            <option value="email">Filter by Email</option>
            <option value="mobile">Filter by Mobile</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder={`Search by ${filterField}`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Col>
        <Col md={3} className="text-end">
          <Button variant="success" className="me-2" onClick={downloadExcel}>
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
          <div className="table-responsive">
            <Table bordered hover responsive striped className="text-center">
              <thead>
                <tr className="table-header">
                  <th>S.NO</th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStaff.length === 0 ? (
                  <tr>
                    <td colSpan="8">No staff found.</td>
                  </tr>
                ) : (
                  currentStaff.map((staff, index) => (
                    <tr key={staff._id}>
                      <td className="text-center">{index + 1}</td>
                      <td>{staff._id?.slice(-6)}</td>
                      <td>
                        <Image
                          src={staff.profileImage || 'default-profile-image.jpg'}
                          alt={staff.name}
                          roundedCircle
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}

                        />
                      </td>
                      <td>{staff.name}</td>
                      <td>{staff.email}</td>
                      <td>{staff.mobile}</td>
                      <td>{staff.role}</td>
                      <td>{staff.status}</td>
                      <td className="text-center align-middle">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-1 mb-1 mt-1 ms-1"
                          onClick={() => openEditModal(staff)}
                        >
                          <i className="fas fa-edit" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(staff._id)}
                        >
                          <i className="fas fa-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          {renderPagination()}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingStaff ? 'Edit Staff' : 'Add Staff'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {['name', 'email', 'mobile', 'address', 'profileImage'].map((field) => (
              <Form.Group key={field} className="mb-3">
                <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                <Form.Control
                  type={field === 'mobile' ? 'tel' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange} required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={closeModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingStaff ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Staff;
