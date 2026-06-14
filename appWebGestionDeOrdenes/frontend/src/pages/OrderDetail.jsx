import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ordenService from '../services/ordenService';
import activoService from '../services/activoService';
import { getTecnicos } from '../services/usuarioService';


const formatearValorAudit = (val) => {
  if (!val) return '-';
  if (typeof val !== 'object') return val;
  
  return Object.entries(val).map(([key, value]) => {
    const camposAmigables = {
      estado: 'Estado',
      prioridad: 'Prioridad',
      tecnicoId: 'Técnico ID',
      titulo: 'Título',
      descripcion: 'Descripción',
      activoId: 'Activo ID',
      solicitanteId: 'Solicitante ID'
    };
    
    const nombreCampo = camposAmigables[key] || key;
    const valorAmigable = typeof value === 'string' ? value.replace('_', ' ') : value;
    
    return `${nombreCampo}: ${valorAmigable}`;
  }).join('\n');
};

export const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orden, setOrden] = useState(null);
  const [activo, setActivo] = useState(null);
  const [historial, setHistorial] = useState([]);

  const [selectedTecnicoId, setSelectedTecnicoId] = useState('');
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataOrden = await ordenService.getOrden(id);
      setOrden(dataOrden);

      if (dataOrden && dataOrden.activoId) {
        const activosList = await activoService.getActivos();
        const foundActivo = activosList.find(a => a.id === dataOrden.activoId);
        setActivo(foundActivo);
      }

      const dataHistorial = await ordenService.getHistorialOrden(id);
      setHistorial(Array.isArray(dataHistorial) ? dataHistorial : []);

      if (user && (user.rol === 'admin' || user.rol === 'mantenimiento')) {
        try {
          const list = await getTecnicos();
          setTecnicos(list.filter(t => t.activo));
        } catch (tErr) {
          console.error("Error al cargar técnicos:", tErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        'No se pudo encontrar la orden o no tienes permisos para visualizarla.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleAction = async (serviceCall) => {
    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await serviceCall();
      setSuccessMsg('¡Estado actualizado exitosamente!');
      await fetchOrderDetail(); // Recargar datos
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al ejecutar la acción.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!selectedTecnicoId) return;
    handleAction(() => ordenService.asignarOrden(id, selectedTecnicoId));
  };

  if (loading) {
    return (
      <div className="loading-container glass-panel">
        <div className="spinner"></div>
        <p>Cargando detalles de la orden...</p>
      </div>
    );
  }

  if (error && !orden) {
    return (
      <div className="page-container">
        <div className="alert alert-error glass-panel">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-secondary mt-3">Volver al Listado</Link>
        </div>
      </div>
    );
  }

  const isCreador = orden.solicitanteId === user.id;
  const isTecnicoAsignado = orden.tecnicoId === user.id;
  const isAdmin = user.rol === 'admin' || user.rol === 'mantenimiento';

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Volver al Listado</Link>
          <h1>Orden #{orden.id}</h1>
          <p>{orden.titulo}</p>
        </div>
        {user.rol === 'admin' && (
          <Link to={`/ordenes/editar/${orden.id}`} className="btn btn-secondary">
            ✏️ Editar Orden
          </Link>
        )}
      </div>

      {successMsg && (
        <div className="alert alert-success animate-fade-in">
          <span>✅</span> {successMsg}
        </div>
      )}

      {error && (
        <div className="alert alert-error animate-fade-in">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="detail-grid">
        {/* Panel de Información General */}
        <div className="detail-card glass-panel">
          <h2>📋 Información de la Orden</h2>
          <div className="detail-info-list">
            <div className="detail-item">
              <span className="label">Título:</span>
              <span className="value">{orden.titulo}</span>
            </div>
            <div className="detail-item">
              <span className="label">Descripción:</span>
              <span className="value">{orden.descripcion}</span>
            </div>
            <div className="detail-item">
              <span className="label">Prioridad:</span>
              <span className={`badge badge-priority-${orden.prioridad}`}>{orden.prioridad}</span>
            </div>
            <div className="detail-item">
              <span className="label">Estado:</span>
              <span className={`badge badge-status-${orden.estado}`}>{orden.estado.replace('_', ' ')}</span>
            </div>
            <div className="detail-item">
              <span className="label">Fecha Creación:</span>
              <span className="value">{new Date(orden.fechaCreacion).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Fecha Resolución:</span>
              <span className="value">
                {orden.fechaResolucion ? new Date(orden.fechaResolucion).toLocaleString() : 'Pendiente'}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Técnico Asignado:</span>
              <span className="value">
                {orden.tecnicoId ? `Técnico (ID: #${orden.tecnicoId})` : 'Sin asignar'}
              </span>
            </div>
          </div>

          {/* Botones de acción dinámicos por rol */}
          <div className="detail-actions">
            <h3>⚙️ Acciones Disponibles</h3>
            <div className="actions-buttons-group">

              {/* ACCIÓN: Cancelar Orden */}
              {((isCreador && orden.estado === 'abierta') || isAdmin) && orden.estado !== 'resuelta' && orden.estado !== 'cancelada' && (
                <button
                  onClick={() => handleAction(() => ordenService.cancelarOrden(orden.id))}
                  className="btn btn-error"
                  disabled={actionLoading}
                >
                  ❌ Cancelar Orden
                </button>
              )}

              {/* ACCIÓN: Iniciar Trabajo (procesar) */}
              {(isTecnicoAsignado || isAdmin) && orden.estado === 'asignada' && (
                <button
                  onClick={() => handleAction(() => ordenService.procesarOrden(orden.id))}
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  🚀 Iniciar Trabajo
                </button>
              )}

              {/* ACCIÓN: Resolver Orden */}
              {(isTecnicoAsignado || isAdmin) && orden.estado === 'en_proceso' && (
                <button
                  onClick={() => handleAction(() => ordenService.resolverOrden(orden.id))}
                  className="btn btn-success"
                  disabled={actionLoading}
                >
                  ✔️ Marcar como Resuelta
                </button>
              )}
            </div>

            {/* ACCIÓN: Asignar Técnico (Solo admin/mantenimiento y si la orden está abierta) */}
            {isAdmin && orden.estado === 'abierta' && (
              <form onSubmit={handleAsignar} className="assign-form">
                <div className="form-group">
                  <label htmlFor="tecnico">Asignar Técnico a esta orden</label>
                  <div className="assign-input-group">
                    <select
                      id="tecnico"
                      value={selectedTecnicoId}
                      onChange={(e) => setSelectedTecnicoId(e.target.value)}
                      required
                    >
                      <option value="">Seleccione un técnico...</option>
                      {tecnicos.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} (ID: #{t.id})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary" disabled={actionLoading || !selectedTecnicoId}>
                      Asignar
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Panel del Activo Asociado */}
        <div className="detail-card glass-panel">
          <h2>⚙️ Detalles del Activo</h2>
          {activo ? (
            <div className="detail-info-list">
              <div className="detail-item">
                <span className="label">Código Patrimonial:</span>
                <span className="value"><strong>{activo.codigo}</strong></span>
              </div>
              <div className="detail-item">
                <span className="label">Nombre del Activo:</span>
                <span className="value">{activo.nombre}</span>
              </div>
              <div className="detail-item">
                <span className="label">Tipo:</span>
                <span className="value">{activo.tipo}</span>
              </div>
              <div className="detail-item">
                <span className="label">Ubicación:</span>
                <span className="value">{activo.ubicacion}</span>
              </div>
              <div className="detail-item">
                <span className="label">Estado Operativo:</span>
                <span className={`badge badge-status-${activo.estado}`}>{activo.estado}</span>
              </div>
              <div className="detail-item">
                <span className="label">Criticidad:</span>
                <span className={`badge badge-priority-${activo.criticidad}`}>{activo.criticidad}</span>
              </div>
            </div>
          ) : (
            <p>Cargando información del activo asociado...</p>
          )}
        </div>
      </div>

      {/* Historial de Auditoría */}
      <div className="audit-section glass-panel">
        <h2>📜 Historial de Cambios (Auditoría)</h2>
        {historial.length === 0 ? (
          <p className="no-history-text">No hay cambios registrados en el historial de esta orden.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Fecha y Hora</th>
                  <th>Valor Anterior</th>
                  <th>Valor Nuevo</th>
                </tr>
              </thead>
              <tbody>
                {historial.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.accion.replace('_', ' ').toUpperCase()}</strong></td>
                    <td>{new Date(h.fechaHora).toLocaleString()}</td>
                    <td>
                      {h.valorAnterior ? (
                        <pre className="json-pre">{formatearValorAudit(h.valorAnterior)}</pre>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {h.valorNuevo ? (
                        <pre className="json-pre">{formatearValorAudit(h.valorNuevo)}</pre>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
