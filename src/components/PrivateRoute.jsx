import { Navigate, Outlet } from "react-router";
import { useAuthStatus } from "../hooks/useAuthStatus";

const PrivateRoute = () => {
  // const loggedIn = false; //We are redirected to the signin page as we manually put the log in to the false
  const { loggedIn, checkingStatus } = useAuthStatus();
  if (checkingStatus) {
    return <h3>Loading...</h3>;
  }
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
};
//1. outlet for adding the children inside
//2. navigate for redirect
//3. destructed two state from useAuthStatus
//4.
export default PrivateRoute;
