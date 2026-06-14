import { Op } from 'sequelize';
import { Orden } from '../models/ordenes.js';
import { HistorialOrden } from '../models/historialOrden.js';
import { Activo } from '../models/activos.js';
import { Usuario } from '../models/usuarios.js';

export async function getOrdenes({ activoId, estado, prioridad, tecnicoId } = {}, rol, usuarioId){
    const filtro = {}

    if(activoId){
        filtro.activoId = { [Op.eq]: parseInt(activoId) };
    } else {
        filtro.activoId = { [Op.ne]: null };
    }

    if(estado) {
        filtro.estado = { [Op.eq]: estado }
    } else {
        filtro.estado = { [Op.ne]: null }
    }

    if(prioridad) {
        filtro.prioridad = { [Op.eq]: prioridad };
    }
    else {
        filtro.prioridad = { [Op.ne]: null };
    }

    if(tecnicoId) {
        filtro.tecnicoId = { [Op.eq]: parseInt(tecnicoId)}
    }
    else {
        filtro.tecnicoId = { [Op.ne]: null };
    };

    if(rol === 'admin'){
        return await Orden.findAll({
            where: {
                activoId: filtro.activoId,
                estado: filtro.estado,
                prioridad: filtro.prioridad,
            }
        });
    }

    if(rol === 'solicitante'){
        const where = { solicitanteId: usuarioId };

        if(filtro.activoId) where.activoId = filtro.activoId;
        if(filtro.estado) where.estado = filtro.estado;
        if(filtro.prioridad) where.prioridad = filtro.prioridad;
        return await Orden.findAll({ where });
    }

    if(rol === 'tecnico'){
        const where = { tecnicoId: usuarioId };
        if(filtro.activoId) where.activoId = filtro.activoId;
        if(filtro.estado) where.estado = filtro.estado;
        if(filtro.prioridad) where.prioridad = filtro.prioridad;
        return await Orden.findAll({ where });
    }
}


export async function getOrdenById(id, rol, usuarioId){
    if(rol === 'admin'){
        return await Orden.findByPk(id);
    } else if(rol === 'solicitante'){
        const where = { solicitanteId: usuarioId, id };
        return await Orden.findOne({ where });
    } else if(rol === 'tecnico'){
        const where = { tecnicoId: usuarioId, id };
        return await Orden.findOne({ where });
    }
}


export async function getHistorialDeOrden(id, rol, usuarioId){
    const orden = await getOrdenById(id, rol, usuarioId);
    if(orden) {
        return await HistorialOrden.findAll({
            where: {
                ordenId: { [Op.eq]: parseInt(id) }
            }
        });
    }
    return null;
}


export async function postNuevaOrden(values, rol, usuarioId){
    if(rol === 'admin' || rol === 'solicitante'){
        values.solicitanteId = usuarioId;
        values.estado = 'abierta';
        values.fechaCreacion = new Date();
        const orden = await Orden.create(values);
        const historialOrdenValues = { ordenId: orden.id, usuarioId: usuarioId, accion: 'creacion', fechaHora: new Date() }
        return await HistorialOrden.create(historialOrdenValues)
    }
}


export async function modificarOrden(values, id, rol, usuarioId){
    if(rol === 'admin'){
        //Si se modifica la prioridad, modifica también la criticidad del activo, para que respeten las reglas del negocio
        if(values.prioridad){
            if(values.prioridad === 'alta' || values.prioridad === 'urgente'){
                const nuevaCriticidad = { criticidad: 'alta' };
                await Activo.update(nuevaCriticidad, { where: { id: { [Op.eq]: values.activoId }} });
            } else if(values.prioridad === 'media'){
                const nuevaCriticidad = { criticidad: 'media' };
                await Activo.update(nuevaCriticidad, { where: { id: { [Op.eq]: values.activoId }} });
            } else if(values.prioridad === 'baja'){
                const nuevaCriticidad = { criticidad: 'baja' };
                await Activo.update(nuevaCriticidad, { where: { id: { [Op.eq]: values.activoId }} });
            }
        }
        return await Orden.update(values, {
            where: {
                id: { [Op.eq]: id }
            }
        });
    } else {
        throw new Error('Usted no tiene permisos para modificar una orden');
    }
}

//validar el criterio de criticidad de activos en relación a la prioridad de las órdenes
export async function validarCriticidad(activoId, values){
    const criticidadesPermitidas = {
        baja: ['baja'],
        media: ['media'],
        alta: ['alta'],
        urgente: ['alta']
    };

    const activo = await Activo.findByPk(activoId);

    const permitidas = criticidadesPermitidas[values.prioridad];
    if(permitidas){
        if(!permitidas.includes(activo.criticidad)){
            throw new Error(
                `La prioridad ${values.prioridad} no es válida para un activo de criticidad ${activo.criticidad}`
            );
        }
    }
}

//validación de que el activo este en un estado válido para la asignación de una orden
export async function validarActivoEnAlta(activoId){
    const activo = await Activo.findByPk(activoId);

    if(activo.estado === 'baja'){
        throw new Error(
            'No puede asignarse una orden para un activo dado de baja'
        );
    } 
}

//validación de que el activo al que se le quiere asignar una orden exista
export async function validarExistenciaActivo(activoId){
    const activo = await Activo.findByPk(activoId);
    if(!activo) {
        throw new Error('Activo no encontrado o inexistente');
    }
}


export async function cancelarOrden(values, id, rol, usuarioId){
    const orden = await Orden.findByPk(id)

    if(orden.estado === 'resuelta'){
        throw new Error("No puede cancelarse una orden ya resuelta");
        
    } else {
        const nuevoEstado = { estado: 'cancelada' };
        //Añade un registro al historial de la orden con el cambio
        if(rol === 'admin' || rol === 'solicitante'){
            const historialOrdenValues = { ordenId: id, usuarioId: usuarioId, accion: 'cancelacion', fechaHora: new Date(), valorAnterior: { "estado": orden.estado }, valorNuevo: { "estado": values.estado } };
            await HistorialOrden.create(historialOrdenValues);
        }
        if(rol === 'admin'){
            return await Orden.update(nuevoEstado, {
                where: {
                    id: { [Op.eq]: id }
                }
            });
        }
        if(rol === 'solicitante'){
            const where = { solicitanteId: usuarioId, id };
            return await Orden.update(nuevoEstado, { where });
        }
    }
}


export async function procesarOrden(values ,id, rol, usuarioId){
    const orden = await Orden.findByPk(id);
    const nuevoEstado = { estado: 'en_proceso' };
    if(orden.estado !== 'asignada'){
        throw new Error("No puede procesarse una orden que no esté en estado 'asignada'");      
    }

    //Añade un registro al historial de la orden con el cambio
    if(rol === 'admin' || rol === 'tecnico'){
        const historialOrdenValues = { ordenId: id, usuarioId: usuarioId, accion: 'cambio_estado', fechaHora: new Date(), valorAnterior: { "estado": "asignada" }, valorNuevo: { "estado": "en_proceso" } };
        await HistorialOrden.create(historialOrdenValues);
    }

    if(rol === 'admin'){
        return await Orden.update(nuevoEstado, {
            where: {
                id: { [Op.eq]: id }
            }
        })
    } else if(rol === 'tecnico'){
        const where = { tecnicoId: usuarioId, id };
        return await Orden.update(nuevoEstado, { where });
    } else {
        throw new Error("Usted no tiene permisos para realizar esta acción");
    }


}


export async function asignarOrden(values, id, rol, usuarioId){
    const orden = await Orden.findByPk(id);
    const tecnico = await Usuario.findByPk(values.tecnicoId)
    const nuevosDatos = { 
        estado: 'asignada',
        tecnicoId: values.tecnicoId
    };

    if(!tecnico){
        throw new Error("El técnico que desea asignar no se encuentra o no existe");
    }

    if(!tecnico.activo){
        throw new Error("El técnico que dese asignar no está activo");
    }

    if(tecnico.rol !== 'tecnico'){
        throw new Error('El usuario que desea asignar a la orden no es un técnico');
    }

    if(orden.estado !==  'abierta'){
        throw new Error("Solo pueden asignarse órdenes en estado 'abierta'");
    }

    if(rol === 'admin'){
        await Orden.update(nuevosDatos, {
            where: {
                id: { [Op.eq]: id }
            }
        });
        const historialOrdenValues = { ordenId: id, usuarioId: usuarioId, accion: 'asignacion', fechaHora: new Date(), valorAnterior: { "estado": "abierta" }, valorNuevo: { "estado": "asignada" } };
        return await HistorialOrden.create(historialOrdenValues);
    } else {
        throw new Error('Usted no tiene permisos para asignar un técnico');
    }
}


export async function resolverOrden(values, id, rol, usuarioId){
    const orden = await Orden.findByPk(id);
    const nuevoEstado = { estado: 'resuelta' };

    if(orden.estado === 'cancelada'){
        throw new Error('No puede resolverse una orden cancelada');
    }
    if(orden.estado !== 'en_proceso'){
        throw new Error("No puede resolverse una orden que no está en estado 'en proceso'");
    }
    if(!orden.tecnicoId){
        throw new Error('No puede resolverse una orden que no tiene a un técnico asignado');
    }

    //Añade un registro al historial de la orden con el cambio
    if(rol === 'admin' || rol === 'tecnico'){
        const historialOrdenValues = { ordenId: id, usuarioId: usuarioId, accion: 'resolucion', fechaHora: new Date(), valorAnterior: { "estado": "en_proceso" }, valorNuevo: { "estado": "resuelta" } };
        await HistorialOrden.create(historialOrdenValues);
    }

    if(rol === 'admin'){
        return await Orden.update(nuevoEstado, {
            where: { id: { [Op.eq]: id } }
        });
    } else if(rol === 'tecnico'){
        const where = { tecnicoId: usuarioId, id };
        return await Orden.update(nuevoEstado, { where });
    } else {
        throw new Error('Usted no tiene permisos para resolver una orden');
    }
    
}

export async function getresumen(rol, usuarioId) {
    if (rol !== 'admin') {
        throw new Error('No tiene permisos para acceder al resumen');
    }

    const totalResumen = await Orden.findAll();
    const ordenesPorEstado = {
        abierta: 0,
        asignada: 0,
        en_proceso: 0,
        resuelta: 0,
        cancelada: 0
    };
    let ordenesUrgentes = 0;
    let ordenesSinTecnico = 0;
    const fallasPorActivo = {};

    totalResumen.forEach(o => {
        if (ordenesPorEstado[o.estado] !== undefined) {
            ordenesPorEstado[o.estado]++;
        }
        if (o.prioridad === 'urgente') {
            ordenesUrgentes++;
        }
        if (!o.tecnicoId) {
            ordenesSinTecnico++;
        }
        fallasPorActivo[o.activoId] = (fallasPorActivo[o.activoId] || 0) + 1;
    });

    const activosConMasFallas = Object.entries(fallasPorActivo)
        .map(([activoId, count]) => ({
            activoId: parseInt(activoId),
            fallas: count
        }))
        .sort((a, b) => b.fallas - a.fallas)
        .slice(0, 5);

    return {
        ordenesPorEstado,
        ordenesUrgentes,
        ordenesSinTecnico,
        activosConMasFallas
    };
}