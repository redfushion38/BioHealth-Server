const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Asegúrate de que esté habilitado para RDS.
    trustServerCertificate: false,
  },
};


const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log('Conexión a la base de datos RDS exitosa');
    return pool;
  })
  .catch((err) => {
    console.error('Error al conectar a la base de datos RDS:', err);
    throw err;
  });

module.exports = { sql, poolPromise };

