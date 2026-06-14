import { Activo } from './activos.js';
import { Orden } from './ordenes.js';
import { Usuario } from './usuarios.js';
import { HistorialOrden } from './historialOrden.js';

Activo.hasMany(Orden, { foreignKey: 'activoId', onDelete: 'CASCADE' });
Orden.belongsTo(Activo, { foreignKey: 'activoId' });

Usuario.hasMany(Orden, { foreignKey: 'solicitanteId', onDelete: 'CASCADE' });
Orden.belongsTo(Usuario, { foreignKey: 'solicitanteId' });

Usuario.hasMany(Orden, { foreignKey: 'tecnicoId', onDelete: 'SET NULL' });
Orden.belongsTo(Usuario, { foreignKey: 'tecnicoId' });

Orden.hasMany(HistorialOrden, { foreignKey: 'ordenId', onDelete: 'NO ACTION' })
HistorialOrden.belongsTo(Orden, { foreignKey: 'ordenId' });

Usuario.hasMany(HistorialOrden, { foreignKey: 'usuarioId', onDelete: 'NO ACTION' });
HistorialOrden.belongsTo(Usuario, { foreignKey: 'usuarioId' });