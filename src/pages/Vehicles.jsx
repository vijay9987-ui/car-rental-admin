import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table, Spinner, Alert, Pagination, InputGroup, FormControl } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    carName: '', model: '', year: '', pricePerHour: '',
    fuel: '', seats: '', type: '', location: '', carType: '', carImage: '',
  });
  const [searchType, setSearchType] = useState('carName');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await fetch('http://194.164.148.244:4062/api/car/get-cars');
        if (!res.ok) throw new Error('Failed to fetch vehicles');
        const data = await res.json();
        const carList = data.cars || [];
        setVehicles(carList);
        setFilteredVehicles(carList);
        // toast.success('Vehicles fetched successfully!');
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filterVehicles = () => {
    const filtered = vehicles.filter((v) =>
      v[searchType]?.toString().toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredVehicles(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    filterVehicles();
  }, [searchText, searchType, vehicles]);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      carName: '', model: '', year: '', pricePerHour: '',
      fuel: '', seats: '', type: '', location: '', carType: '', carImage: '',
    });
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      carName: vehicle.carName, model: vehicle.model, year: vehicle.year,
      pricePerHour: vehicle.pricePerHour, fuel: vehicle.fuel, seats: vehicle.seats,
      type: vehicle.type, location: vehicle.location, carType: vehicle.carType,
      carImage: (vehicle.carImage || []).join(', '),
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newVehicleData = {
      ...formData,
      carImage: formData.carImage
        ? formData.carImage.split(',').map((url) => url.trim())
        : [],
    };

    try {
      if (editingVehicle) {
        const res = await fetch(`http://194.164.148.244:4062/api/car/updatecar/${editingVehicle._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVehicleData),
        });
        if (!res.ok) throw new Error('Failed to update vehicle');
        setVehicles((prev) =>
          prev.map((v) => (v._id === editingVehicle._id ? { ...v, ...newVehicleData } : v))
        );
        toast.success('Car updated successfully!');
      } else {
        const res = await fetch('http://194.164.148.244:4062/api/car/add-cars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVehicleData),
        });
        if (!res.ok) throw new Error('Failed to add vehicle');
        const addedVehicle = await res.json();
        setVehicles((prev) => [...prev, addedVehicle.car]);
        toast.success('Car added successfully!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const res = await fetch(`http://194.164.148.244:4062/api/car/deletecar/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete vehicle');
        setVehicles((prev) => prev.filter((v) => v._id !== id));
        toast.success('Car deleted successfully!');
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const handleDownload = () => {
    const wsData = vehicles.map(v => ({
      ID: v._id,
      Name: v.carName,
      Model: v.model,
      Year: v.year,
      PricePerHour: v.pricePerHour,
      Fuel: v.fuel,
      Seats: v.seats,
      Type: v.type,
      Location: v.location,
      CarType: v.carType,
      Images: (v.carImage || []).join(', '),
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vehicles");
    XLSX.writeFile(wb, "Vehicles.xlsx");
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="container-fluid p-3">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Vehicles Management</h2>
        <div>
          {/* <Button
            variant="success"
            className="me-2"
            onClick={handleDownload}
          >
            Download Excel
          </Button> */}
          <Button
            variant="primary"
            onClick={openAddModal}
          >
            Add Vehicle
          </Button>
        </div>
      </div>

      {/* Filter/Search */}
      <div className="row mb-3">
        <div className="col-md-3">
          <Form.Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="_id">Search by Id</option>
            <option value="model">Search by Model</option>
            <option value="carName">Search by carName</option>
          </Form.Select>
        </div>
        <div className="col-md-6">
          <InputGroup>
            <FormControl
              type="text"
              placeholder={`Search ${searchType}`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {/* <Button variant="outline-secondary" onClick={() => setSearchText('')}>Clear</Button> */}
          </InputGroup>
        </div>
        <div className="col-md-3 text-end">
        <Button
          variant="success"
          className="me-2 "
          onClick={handleDownload}
        >
          <i className="fas fa-file-excel me-2"></i>Export to Excel
        </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <div className="table-responsive">
            <Table bordered hover striped>
              <thead>
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
                {paginatedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center">No vehicles found.</td>
                  </tr>
                ) : (
                  paginatedVehicles.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>{vehicle._id.slice(-6)}</td>
                      <td>
                        {vehicle.carImage?.[0] ? (
                          <img
                            src={vehicle.carImage[0]}
                            alt={vehicle.carName}
                            style={{ width: '80px', height: '50px', objectFit: 'cover' }}
                          />
                        ) : 'No Image'}
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
                        <button className="me-1 btn btn-sm btn-outline-warning" onClick={() => openEditModal(vehicle)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(vehicle._id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          <div className="d-flex justify-content-center">{renderPagination()}</div>
        </>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {['carName', 'model', 'year', 'pricePerHour', 'fuel', 'seats', 'type', 'location', 'carType'].map((field) => (
              <Form.Group key={field} className="mb-3">
                <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                <Form.Control
                  type={['year', 'pricePerHour', 'seats'].includes(field) ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>Car Image URLs (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="carImage"
                value={formData.carImage}
                onChange={handleChange}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={closeModal} className="me-2">Cancel</Button>
              <Button variant="primary" type="submit">{editingVehicle ? 'Update' : 'Add'}</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Vehicles;
