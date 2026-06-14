import express from 'express';
import { getOrdenes, getOrdenById, getHistorialDeOrden, postNuevaOrden, modificarOrden, validarCriticidad, validarActivoEnAlta, validarExistenciaActivo, cancelarOrden, asignarOrden, resolverOrden, procesarOrden, getresumen } from '../services/ordenesServices.js';
import { verificarToken } from '../middlewares/verificarToken.js';
import { verificarRol } from '../middlewares/verificarRol.js';

const ordenRouter = express.Router()

ordenRouter.get('/ordenes', verificarToken, async (req, res) => {
    const { activoId, estado, prioridad, tecnicoId } = req.query

    try {
        const { rol, id } = req.usuario;
        const ordenes = await getOrdenes(req.query, rol, id);
        if (ordenes) {
            res.json(ordenes);
        } else {
            res.status(404).json({ message: 'No se encontraron órdenes con los filtros ingresados' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


ordenRouter.get('/ordenes/resumen', verificarToken, verificarRol('admin'), async (req, res) => {
    try {
        const { rol, id } = req.usuario;
        const resumen = await getresumen(rol, id);
        res.json(resumen);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


ordenRouter.get('/ordenes/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { rol, id: usuarioId } = req.usuario;
    const orden = await getOrdenById(id, rol, usuarioId);

    try {
        if (orden) {
            res.json(orden)
        } else {
            res.status(404).json({ message: 'No se encontró una orden con el id ingresado' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


ordenRouter.get('/ordenes/:id/historial', verificarToken, async (req, res) => {
    const { rol, id: usuarioId } = req.usuario;
    const { id } = req.params;
    const ordenes = await getHistorialDeOrden(id, rol, usuarioId);

    try {
        if (ordenes) {
            res.json(ordenes);
        } else {
            res.status(404).json({ message: 'No se encontró historial de cambios para la orden especificada' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


ordenRouter.post('/ordenes', verificarToken, async (req, res) => {
    try {
        const { rol, id: usuarioId } = req.usuario;
        const body = req.body;
        const values = {};

        if (body.activoId !== undefined && body.activoId !== "") values.activoId = body.activoId;
        if (body.titulo !== undefined && body.titulo !== "") values.titulo = body.titulo;
        if (body.descripcion !== undefined && body.descripcion !== "") values.descripcion = body.descripcion;
        if (body.prioridad !== undefined && body.prioridad !== "") values.prioridad = body.prioridad;
        if (body.tecnicoId !== undefined && body.tecnicoId !== "") values.tecnicoId = body.tecnicoId;

        console.log('body recibido:', req.body);

        if (values) {
            await validarExistenciaActivo(values.activoId);
            //Valida que las prioridades y criticidades coincidan según los criterios expuestos en las reglas del negocio
            await validarCriticidad(values.activoId, values);
            await validarActivoEnAlta(values.activoId);

            await postNuevaOrden(values, rol, usuarioId);
            res.json({ message: 'Orden cargada exitosamente' });

        } else {
            res.status(400).json({ message: 'Se esperaba un objeto Orden' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


ordenRouter.put('/ordenes/:id', verificarToken, async (req, res) => {
    try {
        const { rol, id: usuarioId } = req.usuario;
        const { id } = req.params;
        const { activoId, titulo, descripcion, solicitanteId, tecnicoId, prioridad, estado, fechaCreacion, fechaResolucion } = req.body;
        const values = {};
        //Si no se modificó el campo, lo deja como está. 
        if (activoId !== undefined && activoId !== "") values.activoId = activoId;
        if (titulo !== undefined && titulo !== "") values.titulo = titulo;
        if (descripcion !== undefined && descripcion !== "") values.descripcion = descripcion;
        if (solicitanteId !== undefined && solicitanteId !== "") values.solicitanteId = solicitanteId;
        if (tecnicoId !== undefined && tecnicoId !== "") values.tecnicoId = tecnicoId;
        if (prioridad !== undefined && prioridad !== "") values.prioridad = prioridad;
        if (estado !== undefined && estado !== "") values.estado = estado;
        if (fechaCreacion !== undefined && fechaCreacion !== "") values.fechaCreacion = fechaCreacion;
        if (fechaResolucion !== undefined && fechaResolucion !== "") values.fechaResolucion = fechaResolucion;

        if (values) {
            await validarExistenciaActivo(values.activoId);
            await validarActivoEnAlta(values.activoId);
            const ordenActualizada = await modificarOrden(values, id, rol, usuarioId);
            res.json({ message: 'Orden modificada exitosamente', ordenActualizada });
        } else {
            res.status(400).json({ message: 'Se esperaba un objeto Orden' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


ordenRouter.patch('/ordenes/:id/cancelar', verificarToken, async (req, res) => {
    console.log('body:', req.body);
  console.log('id:', req.params.id);
  console.log('usuario:', req.usuario);
    try {
        const { rol, id: usuarioId } = req.usuario;
        const { id } = req.params;
        const values = req.body;

        if (values) {
            await cancelarOrden(values, id, rol, usuarioId);
            res.json({ message: 'Orden cancelada exitosamente' });
        } else {
            res.status(400).json({ message: 'Se esperaba un objeto Orden' });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


ordenRouter.patch('/ordenes/:id/procesar', verificarToken, async (req, res) => {
    try {
        const { rol, id: usuarioId } = req.usuario;
        const { id } = req.params;
        const values = req.body;

        if (values) {
            await procesarOrden(values, id, rol, usuarioId);
            res.json({ message: 'Se cambió el estado de la orden exitosamente' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


ordenRouter.patch('/ordenes/:id/asignar', verificarToken, async (req, res) => {
    try {
        const { rol, id: usuarioId } = req.usuario
        const { id } = req.params;
        const values = req.body;

        if (values) {
            await asignarOrden(values, id, rol, usuarioId);
            res.json({ message: 'Orden asignada exitosamente' });
        } else {
            res.status(400).json({ message: 'Se esperaba un objeto orden' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})


ordenRouter.patch('/ordenes/:id/resolver', verificarToken, async (req, res) => {
    try {
        const { rol, id: usuarioId } = req.usuario;
        const { id } = req.params;
        const values = req.body;

        if (values) {
            values.fechaResolucion = new Date()
            await resolverOrden(values, id, rol, usuarioId);
            res.json({ message: 'Orden resuelta exitosamente' });
        } else {
            res.status(400).json({ message: 'Se esperaba un objeto Orden' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default ordenRouter;