// src/components/PrivateLayout.jsx
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

export default function PrivateLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
