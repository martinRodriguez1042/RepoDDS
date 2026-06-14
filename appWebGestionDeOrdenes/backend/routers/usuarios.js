import { Router } from "express";
import { registrar, login } from "../services/usuariosServices.js";
import { verificarToken } from '../middlewares/verificarToken.js';
import { Usuario } from "../models/usuarios.js";

const usuarioRouter = Router();

usuarioRouter.post('/auth/register', async (req, res) => {
    try{
        const usuario = await registrar(req.body);
        res.status(201).json(usuario);
    } catch(error){
        res.status(400).json({ error: error.message });
    }
});


usuarioRouter.post('/auth/login', async (req, res) => {
    try{
        const token = await login(req.body.email, req.body.password);
        res.json({ token });
    } catch (error){
        res.status(401).json({ error: error.message });
    }
});


usuarioRouter.get('/usuarios/tecnicos', verificarToken, async (req, res) => {
  try {
    const tecnicos = await Usuario.findAll({ where: { rol: 'tecnico' } });
    res.json(tecnicos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default usuarioRouter;