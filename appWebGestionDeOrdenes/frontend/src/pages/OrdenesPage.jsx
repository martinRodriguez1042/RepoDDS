import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenes } from '../services/ordenService.js';

const ESTADOS = ['', 'abierta', 'en progreso', 'resuelta', 'cancelada'];
const PRIORIDADES = ['', 'baja', 'media', 'alta', 'urgente'];

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    activoId: '',
    estado: '',
    prioridad: '',
    tecnicoId: ''
  });
  const navigate = useNavigate();

  async function cargarOrdenes() {
    setCargando(true);
    setError(null);
    try {
      // limpia filtros vacíos antes de enviar
      const filtrosActivos = Object.fromEntries(
        Object.entries(filtros).filter(([_, v]) => v !== '')
      );
      const data = await getOrdenes(filtrosActivos);
      setOrdenes(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar órdenes');
      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarOrdenes();
  }, []);

  function handleChange(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  function handleFiltrar(e) {
    e.preventDefault();
    cargarOrdenes();
  }

  function handleLimpiar() {
    setFiltros({ activoId: '', estado: '', prioridad: '', tecnicoId: '' });
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Órdenes</h2>
      <button onClick={() => navigate('/ordenes/nueva')}>+ Nueva orden</button>
      {/* Filtros */}
      <form onSubmit={handleFiltrar} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          name="activoId"
          placeholder="ID Activo"
          type="number"
          value={filtros.activoId}
          onChange={handleChange}
        />
        <select name="estado" value={filtros.estado} onChange={handleChange}>
          {ESTADOS.map(e => <option key={e} value={e}>{e || 'Todos los estados'}</option>)}
        </select>
        <select name="prioridad" value={filtros.prioridad} onChange={handleChange}>
          {PRIORIDADES.map(p => <option key={p} value={p}>{p || 'Todas las prioridades'}</option>)}
        </select>
        <input
          name="tecnicoId"
          placeholder="ID Técnico"
          type="number"
          value={filtros.tecnicoId}
          onChange={handleChange}
        />
        <button type="submit">Filtrar</button>
        <button type="button" onClick={handleLimpiar}>Limpiar</button>
      </form>

      {/* Estados */}
      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!cargando && !error && ordenes.length === 0 && <p>No se encontraron órdenes.</p>}

      {/* Tabla */}
      {ordenes.length > 0 && (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Activo</th>
              <th>Estado</th>
              <th>Prioridad</th>
              <th>Técnico</th>
              <th>Fecha creación</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(orden => (
              <tr key={orden.id}>
                <td>{orden.id}</td>
                <td>{orden.titulo}</td>
                <td>{orden.activoId}</td>
                <td>{orden.estado}</td>
                <td>{orden.prioridad}</td>
                <td>{orden.tecnicoId || '-'}</td>
                <td>{new Date(orden.fechaCreacion).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => navigate(`/ordenes/${orden.id}`)}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}