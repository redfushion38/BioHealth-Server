const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: true, // Si usas una conexión local, debe ser false
    enableArithAbort: true,
    trustServerCertificate: true
  }
};

const connectDB = async () => {
    try {
      const pool = await sql.connect(config);
      console.log('Conexión a la base de datos exitosa');
      return pool;
    } catch (err) {
      console.error('Error al conectar a la base de datos:', err);
      throw err;
    }
  };
  
  module.exports = connectDB;

