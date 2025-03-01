// frontend/src/Component/ProtectedRoute.jsx

import { useClerk } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { session } = useClerk();

  if (!session) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
};

export default ProtectedRoute;
