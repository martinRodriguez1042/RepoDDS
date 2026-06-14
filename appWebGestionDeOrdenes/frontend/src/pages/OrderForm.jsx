import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ordenService from '../services/ordenService';
import activoService from '../services/activoService';

export const OrderForm = () => {
  const { id } = useParams(); // Si existe ID, estamos editando
  const isEditMode = !!id;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [activoId, setActivoId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('media');

  const [activos, setActivos] = useState([]);
  const [selectedActivo, setSelectedActivo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoadingMetadata(true);
      try {

        const dataActivos = await activoService.getActivos();
        setActivos(dataActivos.filter(a => a.estado !== 'baja'));

        if (isEditMode) {

          if (user.rol !== 'admin') {
            navigate('/unauthorized');
            return;
          }

          const dataOrden = await ordenService.getOrden(id);
          if (dataOrden) {
            setActivoId(dataOrden.activoId.toString());
            setTitulo(dataOrden.titulo);
            setDescripcion(dataOrden.descripcion);
            setPrioridad(dataOrden.prioridad);

            const activeAsset = dataActivos.find(a => a.id === dataOrden.activoId);
            setSelectedActivo(activeAsset);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar la información requerida del servidor.');
      } finally {
        setLoadingMetadata(false);
      }
    };
    loadData();
  }, [id, isEditMode]);

  useEffect(() => {
    if (!activoId || activos.length === 0) {
      setSelectedActivo(null);
      setValidationError(null);
      return;
    }

    const activo = activos.find(a => a.id === parseInt(activoId));
    setSelectedActivo(activo);

    if (activo) {
      if (activo.criticidad === 'alta' && prioridad === 'baja') {
        setValidationError(
          'Regla de Negocio: Un activo de criticidad alta no puede tener una orden con prioridad baja.'
        );
      } else {
        setValidationError(null);
      }
    }
  }, [activoId, prioridad, activos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (validationError) {
      setError('Corrija los errores de validación antes de enviar el formulario.');
      return;
    }

    if (!activoId || !titulo || !descripcion || !prioridad) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      const values = {
        activoId: parseInt(activoId),
        titulo,
        descripcion,
        prioridad,
        estado: isEditMode ? undefined : 'abierta', // Si es alta, por defecto abierta
      };

      if (isEditMode) {
        await ordenService.editarOrden(id, values);
      } else {
        await ordenService.crearOrden(values);
      }

      navigate('/');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Error al guardar la orden. Verifique los datos ingresados.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingMetadata) {
    return (
      <div className="loading-container glass-panel">
        <div className="spinner"></div>
        <p>Cargando información del formulario...</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Cancelar y Volver</Link>
          <h1>{isEditMode ? `Editar Orden #${id}` : 'Crear Nueva Orden de Mantenimiento'}</h1>
          <p>Complete los datos del activo e incidente.</p>
        </div>
      </div>

      <div className="form-card-container">
        <div className="form-card glass-panel">
          {error && (
            <div className="alert alert-error animate-fade-in">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="order-form">
            <div className="form-group">
              <label htmlFor="activoId">Activo Afectado *</label>
              <select
                id="activoId"
                value={activoId}
                onChange={(e) => setActivoId(e.target.value)}
                disabled={loading || isEditMode} // En edición no permitimos cambiar el activo
                required
              >
                <option value="">Seleccione el activo...</option>
                {activos.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.codigo} - {a.nombre} (Criticidad: {a.criticidad})
                  </option>
                ))}
              </select>
              <small className="form-text">
                Solo se muestran activos que no se encuentran dados de baja.
              </small>
            </div>

            {selectedActivo && (
              <div className="activo-preview-box animate-fade-in">
                <h4>Detalles del Activo Seleccionado:</h4>
                <p>📍 <strong>Ubicación:</strong> {selectedActivo.ubicacion} | 🏷️ <strong>Tipo:</strong> {selectedActivo.tipo}</p>
                <p>⚡ <strong>Criticidad:</strong> <span className={`badge badge-priority-${selectedActivo.criticidad}`}>{selectedActivo.criticidad}</span></p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="titulo">Título del Incidente / Tarea *</label>
              <input
                type="text"
                id="titulo"
                placeholder="Ej. Fuga de agua o Fallo de encendido"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción Detallada *</label>
              <textarea
                id="descripcion"
                rows="5"
                placeholder="Describa el síntoma o la tarea de mantenimiento requerida con detalle..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="prioridad">Prioridad Requerida *</label>
              <select
                id="prioridad"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                disabled={loading}
                required
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            {validationError && (
              <div className="alert alert-warning animate-fade-in">
                <span>⚠️</span> {validationError}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                disabled={loading || !!validationError}
              >
                {loading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Registrar Orden'}
              </button>
              <Link to="/" className="btn btn-secondary">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
