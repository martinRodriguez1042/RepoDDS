import { Activo } from '../models/activos.js';
import { Op } from 'sequelize';

export async function getAllActivos(){
    return await Activo.findAll()
}