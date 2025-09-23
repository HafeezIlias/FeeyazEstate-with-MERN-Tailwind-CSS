import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
    const {currentUser} = useSelector((state) => state.user); //to get the user state from the redux store
  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />; // if user is logged in, render the child components, 
  // otherwise redirect to sign-in page.if we change the url it will navigate to sign-in page
  
}
