import { DataTypes } from "sequelize";
import { INTEGER } from "sequelize";
import { cnnDb } from "../data/cnnSequelize.js";

export const Usuario = cnnDb.define('usuarios', {
    'id': {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    'nombre': {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'email': {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    'passwordHash': {
        type: DataTypes.STRING,
        allowNull: false
    },
    'rol': {
        type: DataTypes.ENUM('solicitante', 'tecnico', 'admin'),
        allowNull: false
    },
    'activo': {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
},
    {
        timestamps: false,
        cnnDb
    })