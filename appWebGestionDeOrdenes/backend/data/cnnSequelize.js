import { Sequelize } from 'sequelize';

export const cnnDb = new Sequelize('database', '', '', {
    dialect: 'sqlite',
    storage: './data/database.sqlite',
})
