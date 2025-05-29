import React from 'react';
import { Row, Col, Container, Card } from 'react-bootstrap';
import { FaUsers, FaCarSide, FaClipboardList } from 'react-icons/fa';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Mock data
const userCount = 120;
const vehicleCount = 45;
const bookingCount = 80;

const bookingStatus = {
  confirmed: 50,
  pending: 20,
  cancelled: 10,
};

// Bar Chart Data
const barData = {
  labels: ['Users', 'Vehicles', 'Bookings'],
  datasets: [
    {
      label: 'Count',
      data: [userCount, vehicleCount, bookingCount],
      backgroundColor: ['#A66CFF', '#9C9EFE', '#A66CFF'],
      borderRadius: 10,
    },
  ],
};

// Pie Chart Data
const pieData = {
  labels: ['Confirmed', 'Pending', 'Cancelled'],
  datasets: [
    {
      data: [bookingStatus.confirmed, bookingStatus.pending, bookingStatus.cancelled],
      backgroundColor: ['#198754', '#ffc107', '#dc3545'],
      borderWidth: 1,
    },
  ],
};

const Dashboard = () => {
  return (
    <Container fluid className="p-4" style={{ background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)' }}>
      <h2 className="mb-4 fw-bold">Admin Dashboard</h2>

      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="text-white h-100 shadow" style={{ backgroundColor: '#A66CFF' }}>
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title>Users</Card.Title>
                <h3>{userCount}</h3>
              </div>
              <FaUsers size={40} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-white h-100 shadow" style={{ backgroundColor: '#9C9EFE' }}>
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title>Vehicles</Card.Title>
                <h3>{vehicleCount}</h3>
              </div>
              <FaCarSide size={40} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="text-white h-100 shadow" style={{ backgroundColor: '#A66CFF' }}>
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title>Bookings</Card.Title>
                <h3>{bookingCount}</h3>
              </div>
              <FaClipboardList size={40} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <div className="p-3 bg-white shadow rounded h-100">
            <h5 className="mb-3 fw-bold">Summary Bar Chart</h5>
            <Bar data={barData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 20,
                  },
                },
              },
            }} />
          </div>
        </Col>

        <Col md={6} className="mb-4">
          <div className="p-3 bg-white shadow rounded h-100">
            <h5 className="mb-3 fw-bold">Booking Status Pie Chart</h5>
            <Pie data={pieData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
