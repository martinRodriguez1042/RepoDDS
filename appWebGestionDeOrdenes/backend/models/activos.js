import { DataTypes } from "sequelize";
import { INTEGER } from "sequelize";
import { cnnDb } from "../data/cnnSequelize.js";

export const Activo = cnnDb.define('activos', {
    'id': {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    'codigo': {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    'nombre': {
        type: DataTypes.STRING,
        allowNull: false
    },
    'tipo': {
        type: DataTypes.STRING,
        allowNull: false
    },
    'ubicacion': {
        type: DataTypes.STRING,
        allowNull: false
    },
    'estado': {
        type: DataTypes.STRING,
        allowNull: false
    },
    'criticidad': {
        type: DataTypes.STRING,
        allowNull: false
    }
},
    {
        timestamps: false,
        cnnDb
    })