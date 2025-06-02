import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Settings = () => {
  const storedUser = sessionStorage.getItem('adminUser');
  const sessionUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = sessionUser?.id;

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchAdminProfile();
    } else {
      toast.error('Admin user not found in session');
      setLoading(false);
    }
  }, [userId]);

  const fetchAdminProfile = async () => {
    try {
      const res = await axios.get(`http://194.164.148.244:4062/api/admin/profileadmin/${userId}`);
      const data = res.data.admin;
      setAdminData({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch profile data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setAdminData({ ...adminData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`http://194.164.148.244:4062/api/admin/updateprofile/${userId}`, adminData);
      toast.success('Profile updated successfully!');

      // ✅ Update session storage with new admin data
      const updatedUser = { ...sessionUser, ...adminData };
      sessionStorage.setItem('adminUser', JSON.stringify(updatedUser));
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white text-center">
              <h4 className="mb-0">Admin Settings</h4>
            </div>
            <div className="card-body">
              {loading ? (
                <p className="text-center mb-0">Loading profile...</p>
              ) : (
                <form onSubmit={handleUpdate} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={adminData.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Mobile Number</label>
                    <input
                      type="text"
                      name="mobile"
                      value={adminData.mobile}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                  <div className="col-12 text-center mt-3">
                    <button
                      type="submit"
                      className="btn btn-success px-4"
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
