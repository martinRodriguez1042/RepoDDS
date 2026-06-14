import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, roles, allowedRoles }){
    const { token, usuario } = useAuth();
    const roleList = roles || allowedRoles;

    if(!token) return <Navigate to="/login" />;
    
    if(roleList && usuario && !roleList.includes(usuario.rol)) {
        return <Navigate to="/unauthorized" />;
    }

    return children ? children : <Outlet />;
}