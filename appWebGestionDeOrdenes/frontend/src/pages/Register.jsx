import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const rol = 'solicitante';
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!nombre || !email || !password) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoadingForm(true);
    try {
      await register(nombre, email, password, rol);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Error al registrar el usuario. Intente con otro correo electrónico.'
      );
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <span className="auth-icon">📝</span>
          <h2>Crear Cuenta</h2>
          <p>Regístrate en el Sistema de Mantenimiento</p>
        </div>

        {error && (
          <div className="alert alert-error animate-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success animate-fade-in">
            <span>✅</span> ¡Registro exitoso! Redirigiendo al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              placeholder="Ej. Pablo Díaz"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loadingForm || success}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loadingForm || success}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loadingForm || success}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-block ${loadingForm ? 'btn-loading' : ''}`}
            disabled={loadingForm || success}
          >
            {loadingForm ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
