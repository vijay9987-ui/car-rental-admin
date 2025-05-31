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
import { saveAs } from 'file-saver';
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
      // toast.success('Staff fetched successfully!');
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
      profileImage: staff.profileImage,
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
      const res = await fetch(
        `http://194.164.148.244:4062/api/admin/updatestaff/${editingStaff.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );
      if (!res.ok) throw new Error('Failed to update staff');
      toast.success('Staff updated successfully!');
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
        {
          method: 'DELETE',
        }
      );
      if (!res.ok) throw new Error('Failed to delete staff');
      toast.success('Staff deleted successfully!');
      await fetchStaff();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(staffList.map(staff => ({
      ID: staff.id,
      Name: staff.name,
      Email: staff.email,
      Mobile: staff.mobile,
      'Profile Image': `http://194.164.148.244:4062${staff.profileImage}`,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'StaffList');
    XLSX.writeFile(workbook, 'StaffList.xlsx');
  };

  return (
    <div className="container-fluid p-3">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="mb-4 text-center">Staff Members</h2>

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
          <Button variant="success" onClick={downloadExcel}>
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
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6">No staff found.</td>
                  </tr>
                ) : (
                  currentStaff.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.id.slice(-6)}</td>
                      <td>
                        <Image
                          src={`http://194.164.148.244:4062${staff.profileImage}`}
                          alt={staff.name}
                          roundedCircle
                          style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                          }}
                        />
                      </td>
                      <td>{staff.name}</td>
                      <td>{staff.email}</td>
                      <td>{staff.mobile}</td>
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          onClick={() => openEditModal(staff)}
                        >
                          <i className="fas fa-edit" />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(staff.id)}
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

      {/* Edit Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {['name', 'email', 'mobile'].map((field) => (
              <Form.Group key={field} className="mb-3">
                <Form.Label>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Form.Label>
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
              <Form.Label>Profile Image URL</Form.Label>
              <Form.Control
                type="text"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={closeModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Update
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Staff;
