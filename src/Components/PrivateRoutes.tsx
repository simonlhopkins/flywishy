import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../Store/UserStore";
const PrivateRoutes = () => {
  const { user } = useUserStore();
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
