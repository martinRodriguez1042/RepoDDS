import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/usuarios.js';

const SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

export async function registrar(values){
    console.log('body recibido: ', values);
    console.log('password: ', values.password);

    const hash = await bcrypt.hash(values.password, 10);
    console.log('hash generado: ', hash);

    const usuario = await Usuario.create({ ...values, passwordHash: hash });
    console.log('usuario creado: ', usuario?.dataValues);

    return usuario;
}


export async function login(email, password){
    const usuario = await Usuario.findOne({
        where: { email }
    });

    if(!usuario){
        throw new Error('Usuario no encontrado');
    }

    const valido = await bcrypt.compare(password, usuario.passwordHash);
    if(!valido){
        throw new Error('Contraseña incorrecta');
    }

    const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        SECRET,
        { expiresIn: '8h' }
    );

    return token
}