import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrdenById, cancelarOrden, procesarOrden, asignarOrden, resolverOrden } from '../services/ordenService.js';
import { getTecnicos } from '../services/usuarioService.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function OrdenDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const rol = usuario?.rol;

  const [orden, setOrden] = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  async function cargar() {
    try {
      const data = await getOrdenById(id);
      setOrden(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar la orden');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    if (rol === 'admin') {
      getTecnicos().then(setTecnicos).catch(() => {});
    }
  }, [id]);

  async function ejecutarAccion(accion) {
    setError(null);
    setMensaje(null);
    try {
      let res;
      if (accion === 'cancelar') res = await cancelarOrden(id);
      if (accion === 'procesar') res = await procesarOrden(id);
      if (accion === 'resolver') res = await resolverOrden(id);
      if (accion === 'asignar') res = await asignarOrden(id, tecnicoSeleccionado);
      setMensaje(res.message);
      cargar(); // recarga la orden para mostrar el estado actualizado
    } catch (err) {
      setError(err.response?.data?.error || 'Error al ejecutar la acción');
    }
  }

  if (cargando) return <p>Cargando...</p>;
  if (error && !orden) return <p style={{ color: 'red' }}>{error}</p>;
  if (!orden) return <p>No se encontró la orden.</p>;

  const esAbierta = orden.estado === 'abierta';
  const esEnProgreso = orden.estado === 'en_proceso';
  const esAsignada = orden.estado === 'asignada';
  const estaActiva = esAbierta || esEnProgreso;

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={() => navigate('/ordenes')}>← Volver</button>
      <button onClick={() => navigate(`/ordenes/${orden.id}/editar`)}>Editar</button>
      <h2>Orden #{orden.id}</h2>

      {mensaje && <p style={{ color: 'green' }}>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '1rem' }}>
        <tbody>
          <tr><td><strong>Título</strong></td><td>{orden.titulo}</td></tr>
          <tr><td><strong>Descripción</strong></td><td>{orden.descripcion}</td></tr>
          <tr><td><strong>Activo</strong></td><td>{orden.activoId}</td></tr>
          <tr><td><strong>Solicitante</strong></td><td>{orden.solicitanteId}</td></tr>
          <tr><td><strong>Técnico</strong></td><td>{orden.tecnicoId || 'Sin asignar'}</td></tr>
          <tr><td><strong>Prioridad</strong></td><td>{orden.prioridad}</td></tr>
          <tr><td><strong>Estado</strong></td><td>{orden.estado}</td></tr>
          <tr><td><strong>Fecha creación</strong></td><td>{new Date(orden.fechaCreacion).toLocaleDateString()}</td></tr>
          <tr>
            <td><strong>Fecha resolución</strong></td>
            <td>{orden.fechaResolucion ? new Date(orden.fechaResolucion).toLocaleDateString() : 'Sin resolver'}</td>
          </tr>
        </tbody>
      </table>

      {/* Acciones según rol y estado */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>

        {/* Asignar - admin y supervisor, solo si está abierta */}
        {(rol === 'admin') && esAbierta && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select value={tecnicoSeleccionado} onChange={e => setTecnicoSeleccionado(e.target.value)}>
              <option value="">Seleccioná un técnico</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
            <button onClick={() => ejecutarAccion('asignar')} disabled={!tecnicoSeleccionado}>
              Asignar
            </button>
          </div>
        )}

        {/* Procesar - admin, supervisor y tecnico, solo si está abierta */}
        {(rol === 'admin' || rol === 'tecnico') && esAsignada && (
          <button onClick={() => ejecutarAccion('procesar')}>Procesar</button>
        )}

        {/* Resolver - admin, supervisor y tecnico, solo si está en progreso */}
        {(rol === 'admin' || rol === 'tecnico') && esEnProgreso && (
          <button onClick={() => ejecutarAccion('resolver')}>Resolver</button>
        )}

        {/* Cancelar - admin y solicitante, solo si está activa */}
        {(rol === 'admin' || rol === 'solicitante') && estaActiva && (
          <button onClick={() => ejecutarAccion('cancelar')}>Cancelar</button>
        )}
      </div>
    </div>
  );
}