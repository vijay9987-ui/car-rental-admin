import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 5;

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
        toast.success('Bookings fetched successfully!');
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error(error.message);
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
      toast.success('Bookings Updated successfully!');
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(error.message);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await axios.delete(`/api/bookings/${bookingId}`);
        fetchBookings();
        toast.success('Bookings deleted successfully!');
      } catch (error) {
        console.error("Error deleting booking:", error);
        toast.error(error.message);
      }
    }
  };

  // Pagination calculations
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);

  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

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
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <>
        <h2>Bookings Management</h2>
      </>
      <div className="table-responsive">
        <Table striped bordered hover responsive>
          <thead>
            <tr className='table-header'>
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
                <td>{booking.rentalStartDate}</td>
                <td>
                  {booking.from} - {booking.to}
                </td>
                <td>₹{booking.totalPrice}</td>
                <td>{booking.pickupLocation}</td>
                <td>{booking.status}</td>
                <td>{booking.paymentStatus}</td>
                <td>{booking.otp}</td>
                <td className="text-center">
                  <button
                    onClick={() => handleEdit(booking)}
                    className="mb-2 btn btn-sm btn-outline-warning"
                  >
                    <i className="fas fa-edit me-1"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(booking._id)}
                    className="btn btn-sm btn-outline-danger"
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
