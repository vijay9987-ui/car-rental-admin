import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10; // You can change this number

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(
        "http://194.164.148.244:4062/api/staff/allbookings"
      );
      if (response.data && response.data.bookings) {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`/api/bookings/${selectedBooking._id}`, selectedBooking);
      fetchBookings();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`/api/bookings/${bookingId}`);
        fetchBookings();
      } catch (error) {
        console.error("Error deleting booking:", error);
      }
    }
  };

  // Pagination calculations
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="container mt-4">
      <h2>Bookings</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Car</th>
            <th>Model</th>
            <th>Rental Date</th>
            <th>From - To</th>
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
              <td>{booking.rentalStartDate}</td>
              <td>
                {booking.from} - {booking.to}
              </td>
              <td>₹{booking.totalPrice}</td>
              <td>{booking.pickupLocation}</td>
              <td>{booking.status}</td>
              <td>{booking.paymentStatus}</td>
              <td>{booking.otp}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEdit(booking)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(booking._id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button
          variant="secondary"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          Prev
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <Form>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedBooking.status}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Control>
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label>Payment Status</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedBooking.paymentStatus}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      paymentStatus: e.target.value,
                    })
                  }
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </Form.Control>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingsPage;
