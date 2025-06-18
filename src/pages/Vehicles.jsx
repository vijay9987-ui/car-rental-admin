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
    carName: '', model: '', year: '', pricePerHour: '', pricePerDay: '',
    extendedPrice: { perHour: '', perDay: '' }, fuel: '', seats: '', type: '',
    location: '', carType: '', carImage: '', status: 'active',
    availabilityStatus: true, description: '', vehicleNumber: '',
    delayPerHour: '', delayPerDay: '',
    availability: [{ date: '', timeSlots: [''] }]
  });
  const [searchType, setSearchType] = useState('carName');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [files, setFiles] = useState([]);
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
      carName: '', model: '', year: '', pricePerHour: '', pricePerDay: '',
      extendedPrice: { perHour: '', perDay: '' }, fuel: '', seats: '', type: '',
      location: '', carType: '', carImage: '', status: 'active',
      availabilityStatus: true, description: '', vehicleNumber: '',
      delayPerHour: '', delayPerDay: '',
      availability: [{ date: '', timeSlots: [''] }]
    });
    setFiles([]);
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      carName: vehicle.carName,
      model: vehicle.model,
      year: vehicle.year,
      pricePerHour: vehicle.pricePerHour,
      pricePerDay: vehicle.pricePerDay,
      extendedPrice: vehicle.extendedPrice || { perHour: '', perDay: '' },
      fuel: vehicle.fuel,
      seats: vehicle.seats,
      type: vehicle.type,
      location: vehicle.location,
      carType: vehicle.carType,
      carImage: (vehicle.carImage || []).join(', '),
      status: vehicle.status || 'active',
      availabilityStatus: vehicle.availabilityStatus !== false,
      description: vehicle.description || '',
      vehicleNumber: vehicle.vehicleNumber || '',
      delayPerHour: vehicle.delayPerHour || '',
      delayPerDay: vehicle.delayPerDay || '',
      availability: vehicle.availability || [{ date: '', timeSlots: [''] }]
    });
    setFiles([]);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtendedPriceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      extendedPrice: {
        ...prev.extendedPrice,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[index][field] = field === 'timeSlots' ? value.split(',') : value;
    setFormData(prev => ({
      ...prev,
      availability: updatedAvailability
    }));
  };

  const addAvailabilitySlot = () => {
    setFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { date: '', timeSlots: [''] }]
    }));
  };

  const removeAvailabilitySlot = (index) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      availability: updatedAvailability
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // Add all form data to FormData object
    Object.keys(formData).forEach(key => {
      if (key === 'extendedPrice') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === 'availability') {
        formDataToSend.append(key, JSON.stringify(formData[key].filter(slot => slot.date && slot.timeSlots.length > 0)));
      } else if (key !== 'carImage') {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Add files if any
    files.forEach(file => {
      formDataToSend.append('carImage', file);
    });

    try {
      if (editingVehicle) {
        const res = await fetch(`http://194.164.148.244:4062/api/car/updatecar/${editingVehicle._id}`, {
          method: 'PUT',
          body: formDataToSend,
        });
        if (!res.ok) throw new Error('Failed to update vehicle');
        const updatedVehicle = await res.json();
        setVehicles((prev) =>
          prev.map((v) => (v._id === editingVehicle._id ? updatedVehicle.car : v))
        );
        toast.success('Car updated successfully!');
      } else {
        const res = await fetch('http://194.164.148.244:4062/api/car/add-cars', {
          method: 'POST',
          body: formDataToSend,
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
      PricePerDay: v.pricePerDay,
      ExtendedPricePerHour: v.extendedPrice?.perHour || '',
      ExtendedPricePerDay: v.extendedPrice?.perDay || '',
      Status: v.status || 'active',
      AvailabilityStatus: v.availabilityStatus !== false ? 'Available' : 'Not Available',
      Availability: v.availability?.map(a => `${a.date}: ${a.timeSlots.join(', ')}`).join('; ') || '',
      Fuel: v.fuel,
      Seats: v.seats,
      Type: v.type,
      Location: v.location,
      CarType: v.carType,
      Description: v.description || '',
      VehicleNumber: v.vehicleNumber || '',
      DelayPerHour: v.delayPerHour || '',
      DelayPerDay: v.delayPerDay || '',
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
            <option value="location">Search by Location</option>
            <option value="status">Search by Status</option>
            <option value="vehicleNumber">Search by Vehicle Number</option>
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
          </InputGroup>
        </div>
        <div className="col-md-3 text-end">
          <Button
            variant="success"
            className="me-2"
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
                <tr className='table-header'>
                  <th>S.NO</th>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price/Hr</th>
                  <th>Price/Day</th>
                  <th>Ext. Price/Hr</th>
                  <th>Ext. Price/Day</th>
                  <th>Status</th>
                  <th>Availability</th>
                  <th>Fuel</th>
                  <th>Seats</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Car Type</th>
                  <th>Veh. Number</th>
                  <th>Delay/Hr</th>
                  <th>Delay/Day</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="20" className="text-center">No vehicles found.</td>
                  </tr>
                ) : (
                  paginatedVehicles.map((vehicle, index) => (
                    <tr key={vehicle._id}>
                      <td className="text-center">{index + 1}</td>
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
                      <td>₹{vehicle.pricePerHour}</td>
                      <td>₹{vehicle.pricePerDay}</td>
                      <td>₹{vehicle.extendedPrice?.perHour || '-'}</td>
                      <td>₹{vehicle.extendedPrice?.perDay || '-'}</td>
                      <td>
                        <span className={`badge bg-${vehicle.status === 'active' ? 'success' : 'warning'}`}>
                          {vehicle.status || 'active'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${vehicle.availabilityStatus !== false ? 'success' : 'danger'}`}>
                          {vehicle.availabilityStatus !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>{vehicle.fuel}</td>
                      <td>{vehicle.seats}</td>
                      <td>{vehicle.type}</td>
                      <td>{vehicle.location}</td>
                      <td>{vehicle.carType}</td>
                      <td>{vehicle.vehicleNumber || '-'}</td>
                      <td>₹{vehicle.delayPerHour || '-'}</td>
                      <td>₹{vehicle.delayPerDay || '-'}</td>
                      <td className="text-center align-middle">
                        <button className="me-1 mb-1 mt-1 ms-1 btn btn-sm btn-outline-warning" onClick={() => openEditModal(vehicle)}>
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
      <Modal show={showModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              {['carName', 'model', 'year', 'pricePerHour', 'pricePerDay', 'fuel', 'seats', 'type', 'location', 'carType', 'vehicleNumber', 'delayPerHour', 'delayPerDay'].map((field) => (
                <Form.Group key={field} className="mb-3 col-md-6">
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}</Form.Label>
                  <Form.Control
                    type={['year', 'pricePerHour', 'pricePerDay', 'seats', 'delayPerHour', 'delayPerDay'].includes(field) ? 'number' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required={!['pricePerDay', 'delayPerHour', 'delayPerDay'].includes(field)}
                  />
                </Form.Group>
              ))}

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Extended Price Per Hour</Form.Label>
                <Form.Control
                  type="number"
                  name="perHour"
                  value={formData.extendedPrice.perHour}
                  onChange={handleExtendedPriceChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Extended Price Per Day</Form.Label>
                <Form.Control
                  type="number"
                  name="perDay"
                  value={formData.extendedPrice.perDay}
                  onChange={handleExtendedPriceChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="onHold">On Hold</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Availability Status</Form.Label>
                <Form.Select
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availabilityStatus: e.target.value === 'true'
                  }))}
                >
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-12">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-12">
                <Form.Label>Car Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept="image/*"
                />
                {editingVehicle && formData.carImage && (
                  <div className="mt-2">
                    <small>Current Images: {formData.carImage}</small>
                  </div>
                )}
              </Form.Group>

              {/* <Form.Group className="mb-3 col-12">
                <Form.Label>Availability Slots</Form.Label>
                {formData.availability.map((slot, index) => (
                  <div key={index} className="row mb-2">
                    <div className="col-md-5">
                      <Form.Control
                        type="date"
                        placeholder="Date (YYYY/MM/DD)"
                        value={slot.date}
                        onChange={(e) => handleAvailabilityChange(index, 'date', e.target.value)}
                      />
                    </div>
                    <div className="col-md-5">
                      <Form.Control
                        type="text"
                        placeholder="Time slots (comma separated)"
                        value={slot.timeSlots?.join(',') || ''}
                        onChange={(e) => handleAvailabilityChange(index, 'timeSlots', e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeAvailabilitySlot(index)}
                        disabled={formData.availability.length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addAvailabilitySlot}
                >
                  Add Availability Slot
                </Button>
              </Form.Group> */}
            </div>
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