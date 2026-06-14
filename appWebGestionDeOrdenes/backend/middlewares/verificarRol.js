export function verificarRol(...rolesPermitidos){
    return (req, res, next) => {
        if(!rolesPermitidos.includes(req.usuario.rol)){
            return res.status(403).json({ error: 'No tenés permisos para esto' });
        }
        next();
    }
}