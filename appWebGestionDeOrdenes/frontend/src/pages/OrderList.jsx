import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ordenService from '../services/ordenService';
import activoService from '../services/activoService';


export const OrderList = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [activos, setActivos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activoIdFilter, setActivoIdFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [prioridadFilter, setPrioridadFilter] = useState('');
  const [tecnicoIdFilter, setTecnicoIdFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [sortBy, setSortBy] = useState('fechaCreacion');
  const [order, setOrder] = useState('DESC');

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const activosData = await activoService.getActivos();
        setActivos(activosData);
      } catch (err) {
        console.error('Error al cargar metadatos de filtros', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activoIdFilter) params.activoId = activoIdFilter;
      if (estadoFilter) params.estado = estadoFilter;
      if (prioridadFilter) params.prioridad = prioridadFilter;
      if (tecnicoIdFilter) params.tecnicoId = tecnicoIdFilter;

      params.sortBy = sortBy;
      params.order = order;
      params.page = currentPage;
      params.limit = limit;

      const data = await ordenService.getOrdenes(params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Error al obtener el listado de órdenes del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activoIdFilter, estadoFilter, prioridadFilter, tecnicoIdFilter, sortBy, order]);

  const getActivoNombre = (id) => {
    const activo = activos.find(a => a.id === id);
    return activo ? `${activo.codigo} - ${activo.nombre}` : `Activo #${id}`;
  };

  const getTecnicoNombre = (id) => {
    return id ? `Técnico (ID: #${id})` : 'Sin asignar';
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'fechaCreacion') {
      return order === 'ASC'
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    }

    if (typeof valA === 'string') {
      return order === 'ASC'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return order === 'ASC' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
  });

  const totalPages = Math.ceil(sortedOrders.length / limit) || 1;
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSortToggle = (field) => {
    if (sortBy === field) {
      setOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(field);
      setOrder('ASC');
    }
    setCurrentPage(1); // Resetear a la primera página tras ordenar
  };

  const clearFilters = () => {
    setActivoIdFilter('');
    setEstadoFilter('');
    setPrioridadFilter('');
    setTecnicoIdFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Gestión de Órdenes</h1>
          <p>Visualiza, filtra y administra las solicitudes de mantenimiento.</p>
        </div>
        {(user.rol === 'admin' || user.rol === 'solicitante') && (
          <Link to="/ordenes/nueva" className="btn btn-primary">
            ➕ Nueva Orden
          </Link>
        )}
      </div>

      {/* Panel de Filtros */}
      <div className="filters-container glass-panel">
        <h3>🔍 Filtros de Búsqueda</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Activo Asociado</label>
            <select
              value={activoIdFilter}
              onChange={(e) => { setActivoIdFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todos los Activos</option>
              {activos.map(a => (
                <option key={a.id} value={a.id}>{a.codigo} - {a.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Estado de la Orden</label>
            <select
              value={estadoFilter}
              onChange={(e) => { setEstadoFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todos los Estados</option>
              <option value="abierta">Abierta</option>
              <option value="asignada">Asignada</option>
              <option value="en_proceso">En Proceso</option>
              <option value="resuelta">Resuelta</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="form-group">
            <label>Prioridad de la Orden</label>
            <select
              value={prioridadFilter}
              onChange={(e) => { setPrioridadFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">Todas las Prioridades</option>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          {/* Filtro de Técnico solo visible para administradores, mantenimiento o técnicos */}
          {user.rol !== 'solicitante' && (
            <div className="form-group">
              <label>ID del Técnico</label>
              <input
                type="number"
                placeholder="ID de técnico (ej: 2, 5, 8)..."
                value={tecnicoIdFilter}
                onChange={(e) => { setTecnicoIdFilter(e.target.value); setCurrentPage(1); }}
              />
            </div>
          )}
        </div>

        <div className="filters-actions">
          <button onClick={clearFilters} className="btn btn-secondary btn-sm">
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Cuerpo del Listado */}
      {loading ? (
        <div className="loading-container glass-panel">
          <div className="spinner"></div>
          <p>Cargando órdenes...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error glass-panel">
          <span>⚠️</span> {error}
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="empty-state glass-panel">
          <span>📂</span>
          <h3>No se encontraron órdenes</h3>
          <p>Prueba ajustando los filtros seleccionados o crea una nueva orden de trabajo.</p>
        </div>
      ) : (
        <div className="table-responsive glass-panel">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => handleSortToggle('id')} className="sortable-th">
                  ID {sortBy === 'id' ? (order === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th>Activo</th>
                <th onClick={() => handleSortToggle('titulo')} className="sortable-th">
                  Título {sortBy === 'titulo' ? (order === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSortToggle('prioridad')} className="sortable-th">
                  Prioridad {sortBy === 'prioridad' ? (order === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSortToggle('estado')} className="sortable-th">
                  Estado {sortBy === 'estado' ? (order === 'ASC' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSortToggle('fechaCreacion')} className="sortable-th">
                  Creado {sortBy === 'fechaCreacion' ? (order === 'ASC' ? '▲' : '▼') : ''}
                </th>
                {user.rol !== 'solicitante' && <th>Técnico</th>}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(o => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td className="text-truncate">{getActivoNombre(o.activoId)}</td>
                  <td>{o.titulo}</td>
                  <td>
                    <span className={`badge badge-priority-${o.prioridad}`}>
                      {o.prioridad}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-status-${o.estado}`}>
                      {o.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(o.fechaCreacion).toLocaleDateString()}</td>
                  {user.rol !== 'solicitante' && <td>{getTecnicoNombre(o.tecnicoId)}</td>}
                  <td>
                    <div className="table-row-actions">
                      <Link to={`/ordenes/${o.id}`} className="btn btn-secondary btn-xs">
                        Ver Detalle
                      </Link>
                      {user.rol === 'admin' && (
                        <Link to={`/ordenes/editar/${o.id}`} className="btn btn-primary btn-xs">
                          Editar
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Controles de Paginación */}
          <div className="pagination-container">
            <div className="pagination-info">
              Mostrando {paginatedOrders.length} de {sortedOrders.length} órdenes.
            </div>

            <div className="pagination-limit">
              <label>Filas por página:</label>
              <select value={limit} onChange={(e) => { setLimit(parseInt(e.target.value)); setCurrentPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="pagination-buttons">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-xs"
              >
                ◀ Anterior
              </button>
              <span className="page-number">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-xs"
              >
                Siguiente ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
