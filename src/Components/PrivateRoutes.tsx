import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../Store/UserStore";
import EmailEntryDialog from "./dialogs/EmailEntryDialog";
const PrivateRoutes = () => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default PrivateRoutes;
