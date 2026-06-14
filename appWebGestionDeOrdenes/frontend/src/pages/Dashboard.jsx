import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ordenService from '../services/ordenService';
import activoService from '../services/activoService';

export const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resumenData, activosData] = await Promise.all([
        ordenService.getResumen(),
        activoService.getActivos()
      ]);
      setResumen(resumenData);
      setActivos(activosData);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al obtener las estadísticas del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getActivoDetalle = (id) => {
    const act = activos.find(a => a.id === id);
    return act ? `${act.codigo} - ${act.nombre} (${act.ubicacion})` : `Activo #${id}`;
  };

  if (loading) {
    return (
      <div className="loading-container glass-panel">
        <div className="spinner"></div>
        <p>Generando resumen estadístico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error glass-panel">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="btn btn-secondary mt-3">Reintentar</button>
        </div>
      </div>
    );
  }

  const { ordenesPorEstado, ordenesUrgentes, ordenesSinTecnico, activosConMasFallas } = resumen;

  // Calcular total de órdenes para porcentajes
  const totalOrdenes = Object.values(ordenesPorEstado).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Panel de Resumen</h1>
          <p>Métricas consolidadas de órdenes de trabajo y rendimiento de activos.</p>
        </div>
      </div>

      {/* Grid de Tarjetas de Métricas Rápidas */}
      <div className="dashboard-kpi-grid">
        <div className="kpi-card glass-panel border-left-error">
          <div className="kpi-title">Órdenes Urgentes</div>
          <div className="kpi-value text-error">{ordenesUrgentes}</div>
          <div className="kpi-desc">Requieren atención prioritaria inmediata</div>
        </div>

        <div className="kpi-card glass-panel border-left-warning">
          <div className="kpi-title">Sin Técnico Asignado</div>
          <div className="kpi-value text-warning">{ordenesSinTecnico}</div>
          <div className="kpi-desc">Órdenes abiertas esperando asignación</div>
        </div>

        <div className="kpi-card glass-panel border-left-success">
          <div className="kpi-title">Total de Órdenes</div>
          <div className="kpi-value text-success">{totalOrdenes}</div>
          <div className="kpi-desc">Registradas en el sistema actualmente</div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Distribución por Estado */}
        <div className="dashboard-card glass-panel">
          <h2>📊 Distribución de Órdenes por Estado</h2>
          <div className="status-distribution">
            {Object.entries(ordenesPorEstado).map(([estado, count]) => {
              const porcentaje = Math.round((count / totalOrdenes) * 100);
              return (
                <div key={estado} className="status-progress-item">
                  <div className="status-progress-label">
                    <span className={`badge badge-status-${estado}`}>{estado.toUpperCase()}</span>
                    <strong>{count} ({porcentaje}%)</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill progress-bar-${estado}`} 
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activos con Más Fallas */}
        <div className="dashboard-card glass-panel">
          <h2>⚠️ Activos con Mayor Cantidad de Fallas</h2>
          {activosConMasFallas.length === 0 ? (
            <p className="no-data-text">No hay registros de fallas sobre activos aún.</p>
          ) : (
            <ul className="fail-assets-list">
              {activosConMasFallas.map((item, idx) => (
                <li key={item.activoId} className="fail-asset-item">
                  <div className="fail-asset-rank">#{idx + 1}</div>
                  <div className="fail-asset-info">
                    <span className="fail-asset-name">{getActivoDetalle(item.activoId)}</span>
                    <span className="fail-asset-count">{item.fallas} órdenes</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
