import { cnnDb } from "./data/cnnSequelize.js";
import express from 'express';
import { Activo, Orden, Usuario } from './models/index.js';
import productRouter from './routers/activos.js';
import activoRouter from "./routers/activos.js";
import ordenRouter from "./routers/ordenes.js";
import usuarioRouter from "./routers/usuarios.js";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));
app.use('/api', usuarioRouter);
app.use('/api', activoRouter);
app.use('/api', ordenRouter);
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Error interno del servidor' });
})


app.listen(3000, async() => {
    await cnnDb.sync()
    console.log('Base de datos sincronizada');
    console.log('Servidor escuchando en http://localhost:3000');
});