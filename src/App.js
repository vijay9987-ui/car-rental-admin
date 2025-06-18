import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Vehicles from './pages/Vehicles';
import Bookings from './pages/Bookings';
import AdminBannerManager from './pages/AdminBannerManager';
import Settings from './pages/Settings';
import Staff from './pages/Staff';
import PrivateRoute from './components/PrivateRoute'; // import your new private route

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AdminLogin />} />
        {/* <Route path="/register" element={<AdminRegister />} /> */}

        {/* Protected/Admin Routes */}
        <Route path="/admin" element={<PrivateRoute />}>
          {/* PrivateRoute will render Outlet, which is AdminLayout here */}
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="staff" element={<Staff />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="banners" element={<AdminBannerManager />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
