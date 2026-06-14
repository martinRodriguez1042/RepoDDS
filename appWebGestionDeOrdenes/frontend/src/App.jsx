import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import OrderForm from './pages/OrderForm';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Rutas Protegidas - Genéricas (Todos los roles autenticados) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<OrderList />} />
                <Route path="/ordenes/:id" element={<OrderDetail />} />
              </Route>

              {/* Rutas Protegidas - Creación de órdenes (solicitante o admin) */}
              <Route 
                path="/ordenes/nueva" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'solicitante']}>
                    <OrderForm />
                  </ProtectedRoute>
                } 
              />

              {/* Rutas Protegidas - Edición de órdenes (solo admin) */}
              <Route 
                path="/ordenes/editar/:id" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <OrderForm />
                  </ProtectedRoute>
                } 
              />

              {/* Rutas Protegidas - Resumen / Dashboard (admin o mantenimiento) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'mantenimiento']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Ruta Comodín - No Encontrada */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;