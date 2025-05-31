import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Pagination, Badge, Row, Col, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from "xlsx";
import 'react-toastify/dist/ReactToastify.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterField, setFilterField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const bookingsPerPage = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, filterField]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://194.164.148.244:4062/api/staff/allbookings");
      if (response.data?.bookings) {
        setBookings(response.data.bookings);
        // toast.success("Bookings fetched successfully!");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings.");
    }
  };

  const filterBookings = () => {
    const filtered = bookings.filter((booking) => {
      const fieldVal = (() => {
        switch (filterField) {
          case "id":
            return booking._id;
          case "name":
            return booking.userId?.name;
          case "email":
            return booking.userId?.email;
          case "pickuplocation":
            return booking.pickupLocation;
          case "status":
            return booking.status;
          case "paymentstatus":
            return booking.paymentStatus;
          case "rentaldate":
            return new Date(booking.rentalStartDate).toLocaleDateString();
          default:
            return "";
        }
      })();
      return fieldVal?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (booking) => {
    setSelectedBooking({ ...booking });
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    try {
      const { _id, status, paymentStatus } = selectedBooking;
      await axios.put(`http://194.164.148.244:4062/api/admin/statusbookings/${_id}`, { status });
      await axios.put(`http://194.164.148.244:4062/api/admin/payment-status/${_id}`, { paymentStatus });

      fetchBookings();
      setShowEditModal(false);
      toast.success("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking.");
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`http://194.164.148.244:4062/api/bookings/${bookingId}`);
        fetchBookings();
        toast.success("Booking deleted successfully!");
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error("Failed to delete booking.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const renderPagination = () => {
    const pages = [];
    for (let number = 1; number <= totalPages; number++) {
      pages.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Item disabled={currentPage === 1} onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}>
          Prev
        </Pagination.Item>
        {pages}
        <Pagination.Item disabled={currentPage === totalPages} onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}>
          Next
        </Pagination.Item>
      </Pagination>
    );
  };

  const handleDownloadExcel = () => {
    const data = bookings.map(booking => ({
      ID: booking._id,
      Name: booking.userId?.name,
      Email: booking.userId?.email,
      Car: booking.car?.carName,
      Model: booking.car?.model,
      RentalDate: new Date(booking.rentalStartDate).toLocaleDateString(),
      Timings: `${booking.from} - ${booking.to}`,
      TotalPrice: booking.totalPrice,
      PickupLocation: booking.pickupLocation,
      Status: booking.status,
      PaymentStatus: booking.paymentStatus,
      OTP: booking.otp
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    XLSX.writeFile(wb, "bookings.xlsx");
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="mb-4">Bookings Management</h2>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Select value={filterField} onChange={(e) => setFilterField(e.target.value)}>
            <option value="id">Search by Booking Id</option>
            <option value="name">Search by Name</option>
            <option value="email">Search by Email</option>
            <option value="pickuplocation">Search by Pickup Location</option>
            <option value="status">Search by Status</option>
            <option value="paymentstatus">Search by Payment Status</option>
            <option value="rentaldate">Search by Rental Date</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <InputGroup>
            <Form.Control type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </InputGroup>
        </Col>
        <Col md={3} className="text-end">
          <Button variant="success" onClick={handleDownloadExcel}><i className="fas fa-file-excel me-2"></i>Export to Excel</Button>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table striped bordered hover responsive>
          <thead>
            <tr className="table-header">
              <th>Name</th>
              <th>Email</th>
              <th>Car</th>
              <th>Model</th>
              <th>Rental Date</th>
              <th>Timings</th>
              <th>Total Price</th>
              <th>Pickup Location</th>
              <th>Status</th>
              <th>Payment</th>
              <th>OTP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.userId?.name}</td>
                <td>{booking.userId?.email}</td>
                <td>{booking.car?.carName}</td>
                <td>{booking.car?.model}</td>
                <td>{new Date(booking.rentalStartDate).toLocaleDateString()}</td>
                <td>{booking.from} - {booking.to}</td>
                <td>₹{booking.totalPrice}</td>
                <td>{booking.pickupLocation}</td>
                <td>
                  <Badge bg={getStatusBadge(booking.status)} className="text-capitalize">
                    {booking.status}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getPaymentBadge(booking.paymentStatus)} className="text-capitalize">
                    {booking.paymentStatus}
                  </Badge>
                </td>
                <td>{booking.otp}</td>
                <td className="text-center">
                  <Button variant="outline-warning" size="sm" className="mb-1" onClick={() => handleEdit(booking)}>
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(booking._id)}>
                    <i className="fas fa-trash-alt"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {renderPagination()}
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={selectedBooking.status}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  value={selectedBooking.paymentStatus}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, paymentStatus: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Bookings;
