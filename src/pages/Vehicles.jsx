import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    carName: '',
    model: '',
    year: '',
    pricePerHour: '',
    fuel: '',
    seats: '',
    type: '',
    location: '',
    carType: '',
    carImage: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('http://194.164.148.244:4062/api/car/get-cars');
        if (!res.ok) throw new Error('Failed to fetch vehicles');
        const data = await res.json();
        setVehicles(data.cars || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      carName: '',
      model: '',
      year: '',
      pricePerHour: '',
      fuel: '',
      seats: '',
      type: '',
      location: '',
      carType: '',
      carImage: '',
    });
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      carName: vehicle.carName,
      model: vehicle.model,
      year: vehicle.year,
      pricePerHour: vehicle.pricePerHour,
      fuel: vehicle.fuel,
      seats: vehicle.seats,
      type: vehicle.type,
      location: vehicle.location,
      carType: vehicle.carType,
      carImage: (vehicle.carImage || []).join(', '),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newVehicleData = {
      ...formData,
      carImage: formData.carImage
        ? formData.carImage.split(',').map((url) => url.trim())
        : [],
    };

    if (editingVehicle) {
      setVehicles((prev) =>
        prev.map((v) =>
          v._id === editingVehicle._id ? { ...v, ...newVehicleData } : v
        )
      );
    } else {
      const newVehicle = {
        ...newVehicleData,
        _id: Math.random().toString(36).substr(2, 24),
        createdAt: new Date().toISOString(),
      };
      setVehicles((prev) => [...prev, newVehicle]);
    }

    setShowModal(false);
  };


  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles((prev) => prev.filter((v) => v._id !== id));
    }
  };

  return (
    <div className="container-fluid p-3">
      <h2 className="mb-4">Vehicles</h2>
      <Button variant="primary" className="mb-3" onClick={openAddModal}>
        Add Vehicle
      </Button>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div className="table-responsive">
          <Table bordered hover striped>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Model</th>
                <th>Year</th>
                <th>Price/Hr</th>
                <th>Fuel</th>
                <th>Seats</th>
                <th>Type</th>
                <th>Location</th>
                <th>Car Type</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center">
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr key={vehicle._id}>
                    <td>{vehicle._id.slice(-6)}</td>
                    <td>
                      {vehicle.carImage?.[0] ? (
                        <img
                          src={vehicle.carImage[0]}
                          alt={vehicle.carName}
                          style={{ width: '80px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td>{vehicle.carName}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.year}</td>
                    <td>${vehicle.pricePerHour}</td>
                    <td>{vehicle.fuel}</td>
                    <td>{vehicle.seats}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.location}</td>
                    <td>{vehicle.carType}</td>
                    <td className="text-center">
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(vehicle)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(vehicle._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {[
              'carName',
              'model',
              'year',
              'pricePerHour',
              'fuel',
              'seats',
              'type',
              'location',
              'carType',
            ].map((field) => (
              <Form.Group key={field} className="mb-3" controlId={`form${field}`}>
                <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                <Form.Control
                  type={['year', 'pricePerHour', 'seats'].includes(field) ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  placeholder={`Enter ${field}`}
                />
              </Form.Group>
            ))}

            {/* Car Image Field */}
            <Form.Group className="mb-3" controlId="formCarImage">
              <Form.Label>Car Image URLs (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="carImage"
                value={formData.carImage}
                onChange={handleChange}
                placeholder="e.g. https://link1.jpg, https://link2.jpg"
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={closeModal} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingVehicle ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Vehicles;
