import { Navigate, Outlet } from "react-router";
import { useAuthStatus } from "../hooks/useAuthStatus";
import Spinner from "./Spinner";

const PrivateRoute = () => {
  // const loggedIn = false; //We are redirected to the signin page as we manually put the log in to the false
  const { loggedIn, checkingStatus } = useAuthStatus();
  if (checkingStatus) {
    return <Spinner />;
  }
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
};
//1. outlet for adding the children inside
//2. navigate for redirect
//3. destructed two state from useAuthStatus
//4.
export default PrivateRoute;
