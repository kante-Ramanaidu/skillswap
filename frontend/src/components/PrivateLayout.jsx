// Add useLocation to your import
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function PrivateLayout() {
  const location = useLocation();

  // Hide navbar on study room and chat pages
  const hideNavbar = location.pathname.startsWith('/study/') || 
                     location.pathname.startsWith('/chat/');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </>
  );
}
export default PrivateLayout;