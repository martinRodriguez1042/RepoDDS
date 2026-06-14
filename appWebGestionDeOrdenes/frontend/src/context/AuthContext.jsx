import { createContext, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as authServiceLogin, register as authServiceRegister } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }){
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [usuario, setUsuario] = useState(() => {
        const t = localStorage.getItem('token');
        if (!t) return null;
        try {
            return jwtDecode(t);
        } catch (e) {
            console.error("Invalid token format in localStorage, clearing token:", e);
            localStorage.removeItem('token');
            return null;
        }
    });

    const user = usuario;

    function guardarToken(token){
        localStorage.setItem('token', token);
        setToken(token);
        setUsuario(jwtDecode(token));
    }

    async function login(email, password) {
        const data = await authServiceLogin(email, password); // data matches { token }
        guardarToken(data.token);
        return data;
    }

    async function register(nombre, email, password, rol) {
        const data = await authServiceRegister({ nombre, email, password, rol });
        return data;
    }

    function cerrarSesion(){
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    }

    const logout = cerrarSesion;

    return (
        <AuthContext.Provider value={{ 
            token, 
            usuario, 
            user, 
            guardarToken, 
            cerrarSesion, 
            logout, 
            login,
            register
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext);
}