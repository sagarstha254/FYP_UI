import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser, "userstatesss");
  return currentUser ? <Outlet /> : <Navigate to="/signin" />;
}
