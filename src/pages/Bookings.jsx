import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Pagination, Badge, Row, Col, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from "xlsx";
import 'react-toastify/dist/ReactToastify.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterField, setFilterField] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const bookingsPerPage = 5;

  useEffect(() => {
    fetchBookings();
  }, []);

  const filterBookings = useCallback(() => {
    const filtered = bookings.filter((booking) => {
      const fieldVal = (() => {
        switch (filterField) {
          case "id":
            return booking._id || '';
          case "name":
            return booking.userId?.name || '';
          case "email":
            return booking.userId?.email || '';
          case "pickuplocation":
            return booking.pickupLocation || '';
          case "status":
            return booking.status || '';
          case "paymentstatus":
            return booking.paymentStatus || '';
          case "rentaldate":
            return booking.rentalStartDate ? new Date(booking.rentalStartDate).toLocaleDateString() : '';
          default:
            return "";
        }
      })();
      return fieldVal.toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [bookings, searchQuery, filterField]);

  useEffect(() => {
    filterBookings();
  }, [filterBookings]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://194.164.148.244:4062/api/staff/allbookings");
      if (response.data?.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings.");
    }
  };

  const fetchBookingDetails = async (bookingId) => {
    try {
      const response = await axios.get(`http://194.164.148.244:4062/api/staff/singlebooking/${bookingId}`);
      if (response.data?.booking) {
        setBookingDetails(response.data.booking);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Failed to fetch booking details.");
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking({ ...booking });
    setShowEditModal(true);
  };

  const handleViewDetails = (bookingId) => {
    fetchBookingDetails(bookingId);
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
        await axios.delete(`http://194.164.148.244:4062/api/admin/deletebooking/${bookingId}`);
        fetchBookings();
        toast.success("Booking deleted successfully!");
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error("Failed to delete booking.");
      }
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return 'secondary';
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'active': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getPaymentBadge = (paymentStatus) => {
    if (!paymentStatus) return 'secondary';
    switch (paymentStatus.toLowerCase()) {
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
      ID: booking._id || '',
      Name: booking.userId?.name || '',
      Email: booking.userId?.email || '',
      Car: booking.car?.carName || '',
      Model: booking.car?.model || '',
      RentalDate: booking.rentalStartDate ? new Date(booking.rentalStartDate).toLocaleDateString() : '',
      Timings: `${booking.from || ''} - ${booking.to || ''}`,
      TotalPrice: booking.totalPrice || '',
      PickupLocation: booking.pickupLocation || '',
      Status: booking.status || '',
      PaymentStatus: booking.paymentStatus || '',
      OTP: booking.otp || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    XLSX.writeFile(wb, "bookings.xlsx");
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="d-flex justify-content-center allign-items-center">
        <h2 className="mb-4">Bookings Management</h2>
      </div>

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
              <th>S.NO</th>
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
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {currentBookings.length > 0 ? (
              currentBookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td className="text-center">{index + 1}</td>
                  <td>{booking.userId?.name || 'N/A'}</td>
                  <td>{booking.userId?.email || 'N/A'}</td>
                  <td>{booking.car?.carName || 'N/A'}</td>
                  <td>{booking.car?.model || 'N/A'}</td>
                  <td>{booking.rentalStartDate ? new Date(booking.rentalStartDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{booking.from || 'N/A'} - {booking.to || 'N/A'}</td>
                  <td>₹{booking.totalPrice || '0'}</td>
                  <td>{booking.pickupLocation || 'N/A'}</td>
                  <td>
                    <Badge bg={getStatusBadge(booking.status)} className="text-capitalize">
                      {booking.status || 'N/A'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getPaymentBadge(booking.paymentStatus)} className="text-capitalize">
                      {booking.paymentStatus || 'N/A'}
                    </Badge>
                  </td>
                  <td>{booking.otp || 'N/A'}</td>
                  <td className="text-center align-middle">
                    <Button variant="outline-warning" size="sm" className="me-1 mb-1 mt-1" onClick={() => handleEdit(booking)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(booking._id)}>
                      <i className="fas fa-trash-alt"></i>
                    </Button>
                  </td>
                  <td className="text-center align-middle">
                    <Button variant="outline-info" size="sm" className="me-1 mb-1 mt-1" onClick={() => handleViewDetails(booking._id)}>
                      view
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="text-center">No bookings found</td>
              </tr>
            )}
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
                  <option value="paid">Paid</option>
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

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingDetails && (
            <div className="row">
              {/* Left Column: User Info + Document */}
              <div className="col-md-6">
                <h5>User Information</h5>
                <p><strong>Name:</strong> {bookingDetails.userId?.name}</p>
                <p><strong>Email:</strong> {bookingDetails.userId?.email}</p>
                <p><strong>Mobile:</strong> {bookingDetails.userId?.mobile}</p>

                <h5 className="mt-4">Document Status</h5>
                <p>
                  <strong>Aadhar Card:</strong>
                  <Badge bg={bookingDetails.userId?.documents?.aadharCard?.status === 'approved' ? 'success' : 'warning'} className="ms-2">
                    {bookingDetails.userId?.documents?.aadharCard?.status || 'Not uploaded'}
                  </Badge>
                </p>
                <p>
                  <strong>Driving License:</strong>
                  <Badge bg={bookingDetails.userId?.documents?.drivingLicense?.status === 'approved' ? 'success' : 'warning'} className="ms-2">
                    {bookingDetails.userId?.documents?.drivingLicense?.status || 'Not uploaded'}
                  </Badge>
                </p>

                {/* Document Images */}
                <h5 className="mt-4">Document Images</h5>
                <div className="document-images">
                  {bookingDetails.userId?.documents?.aadharCard?.url && (
                    <div className="mb-3">
                      <h6>Aadhar Card</h6>
                      <img
                        src={bookingDetails.userId.documents.aadharCard.url}
                        alt="Aadhar Card"
                        className="img-fluid img-thumbnail"
                        style={{ maxHeight: '300px' }}
                      />
                      <p className="text-muted small mt-1">
                        Uploaded: {new Date(bookingDetails.userId.documents.aadharCard.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {bookingDetails.userId?.documents?.drivingLicense?.url && (
                    <div className="mb-3">
                      <h6>Driving License</h6>
                      <img
                        src={bookingDetails.userId.documents.drivingLicense.url}
                        alt="Driving License"
                        className="img-fluid img-thumbnail"
                        style={{ maxHeight: '300px' }}
                      />
                      <p className="text-muted small mt-1">
                        Uploaded: {new Date(bookingDetails.userId.documents.drivingLicense.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Car Info + Booking Info */}
              <div className="col-md-6">
                <h5>Car Information</h5>
                <p><strong>Car Name:</strong> {bookingDetails.car?.carName}</p>
                <p><strong>Model:</strong> {bookingDetails.car?.model}</p>
                <p><strong>Year:</strong> {bookingDetails.car?.year}</p>
                <p><strong>Vehicle No.:</strong> {bookingDetails.car?.vehicleNumber}</p>
                <p><strong>Type:</strong> {bookingDetails.car?.type}</p>
                <p><strong>Fuel:</strong> {bookingDetails.car?.fuel}</p>
                <p><strong>Seats:</strong> {bookingDetails.car?.seats}</p>
                <p><strong>Location:</strong> {bookingDetails.car?.location}</p>
                <p><strong>Car Type:</strong> {bookingDetails.car?.carType}</p>
                <p><strong>Price Per Hour:</strong> ₹{bookingDetails.car?.pricePerHour}</p>
                <p><strong>Price Per Day:</strong> ₹{bookingDetails.car?.pricePerDay}</p>
                <p><strong>Extended Per Hour:</strong> ₹{bookingDetails.car?.extendedPrice?.perHour}</p>
                <p><strong>Extended Per Day:</strong> ₹{bookingDetails.car?.extendedPrice?.perDay}</p>
                <p><strong>Delay Per Hour:</strong> ₹{bookingDetails.car?.delayPerHour}</p>
                <p><strong>Delay Per Day:</strong> ₹{bookingDetails.car?.delayPerDay}</p>

                <h5 className="mt-4">Booking Details</h5>
                <p><strong>Rental Start:</strong> {new Date(bookingDetails.rentalStartDate).toLocaleDateString()}</p>
                <p><strong>Rental End:</strong> {new Date(bookingDetails.rentalEndDate).toLocaleDateString()}</p>
                <p><strong>Timings:</strong> {bookingDetails.from} - {bookingDetails.to}</p>
                <p><strong>Total Price:</strong> ₹{bookingDetails.totalPrice}</p>
                <p><strong>Pickup Location:</strong> {bookingDetails.pickupLocation}</p>
                <p><strong>Deposit:</strong> {bookingDetails.deposit}</p>
                <p><strong>OTP:</strong> {bookingDetails.otp}</p>

                <p>
                  <strong>Status:</strong>
                  <Badge bg={getStatusBadge(bookingDetails.status)} className="ms-2">
                    {bookingDetails.status}
                  </Badge>
                </p>
                <p>
                  <strong>Payment Status:</strong>
                  <Badge bg={getPaymentBadge(bookingDetails.paymentStatus)} className="ms-2">
                    {bookingDetails.paymentStatus}
                  </Badge>
                </p>

                {bookingDetails.car?.carImage?.length > 0 && (
                  <div className="mt-3">
                    <h5>Car Images</h5>
                    <div className="d-flex flex-wrap">
                      {bookingDetails.car.carImage.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Car ${index + 1}`}
                          className="img-thumbnail me-2 mb-2"
                          style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Bookings;