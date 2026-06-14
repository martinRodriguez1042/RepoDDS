import { DataTypes } from "sequelize";
import { INTEGER } from "sequelize";
import { cnnDb } from "../data/cnnSequelize.js";

export const HistorialOrden = cnnDb.define('historialOrdenes', {
    'id': {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    'ordenId': {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    'usuarioId': {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    'accion': {
        type: DataTypes.STRING,
        allowNull: false,
    },
    'fechaHora': {
        type: DataTypes.DATE,
        allowNull: false,
    },
    'valorAnterior': {
        type: DataTypes.JSON,
        allowNull: true,
    },
    'valorNuevo': {
        type: DataTypes.JSON,
        allowNull: true,
    }
},
    {
        timestamps: false,
        cnnDb
    })