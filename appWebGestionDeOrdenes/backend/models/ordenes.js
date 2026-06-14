import { DataTypes } from "sequelize";
import { INTEGER } from "sequelize";
import { cnnDb } from "../data/cnnSequelize.js";

export const Orden = cnnDb.define('ordenes', {
    'id': {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    'activoId': {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    'titulo': {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'descripcion': {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'solicitanteId': {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    'tecnicoId': {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    'prioridad': {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'estado': {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'fechaCreacion': {
        type: DataTypes.DATE,
        allowNull: false,
    },
    'fechaResolucion': {
        type: DataTypes.DATE,
        allowNull: true,
    }
},
    {
        timestamps: false,
        cnnDb
    })