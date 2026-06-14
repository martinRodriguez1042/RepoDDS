import express from 'express';
import { getAllActivos } from '../services/activosServices.js';

const activoRouter = express.Router();

activoRouter.get('/activos', async(req, res) => {
    try{
        const activos = await getAllActivos();
        if(activos){
            res.json(activos);
        } else {
            res.status(404).json({ message: 'No se encontraron activos' });
        }
    } catch(error){
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


export default activoRouter;