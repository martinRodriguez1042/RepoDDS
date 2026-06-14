import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

export function verificarToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({ error: 'Token requerido' });
    }

    try{
        const payload = jwt.verify(token, SECRET);
        req.usuario = payload; // { id, rol } disponible luego en los handlers
        next();
    } catch {
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
}