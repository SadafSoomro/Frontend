import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Overview from './Pages/Overview';
import Products from './Pages/Products/Products';
import Categories from './Pages/Categories/Categories';
import Users from './Pages/Users/Users';
import Banners from './Pages/Banners/Banners';
import Login from './Pages/Auth/Login';
import Signup from './Pages/Auth/Signup';
import ForgotPassword from './Pages/Auth/ForgotPassword';
import ResetPassword from './Pages/Auth/ResetPassword';
import VerifyOTP from './Pages/Auth/VerifyOTP';
import Profile from './Pages/Profile/Profile';
import LandingPage from './Pages/Landing/LandingPage';

const Orders = () => <div className="animate-fade-in"><h1>Orders</h1><p className="text-secondary">Coming soon...</p></div>;
const Wallet = () => <div className="animate-fade-in"><h1>Wallet</h1><p className="text-secondary">Coming soon...</p></div>;
const Settings = () => <div className="animate-fade-in"><h1>Settings</h1><p className="text-secondary">Coming soon...</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="banners" element={<Banners />} />
          <Route path="orders" element={<Orders />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
