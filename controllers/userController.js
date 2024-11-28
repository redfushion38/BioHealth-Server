const connectDB = require('../config/db');
const bcrypt = require('bcryptjs');
const sql = require('mssql');
const jwt = require('jsonwebtoken');

const saltRounds = 10;  // Número de rondas de salting para bcrypt

// Función para agregar un usuario (con contrasenia encriptada)
exports.addUser = async (req, res) => {
  const { Nombre, Correo, Contrasenia } = req.body;
  console.log("empezamos");

  try {
    const pool = await connectDB();
    // Encriptar la contrasenia
    const hashedPassword = await bcrypt.hash(Contrasenia, saltRounds);

    await pool.request()
    .input('Nombre', sql.NVarChar, Nombre)
    .input('Correo', sql.NVarChar, Correo)
    .input('Contrasenia', sql.NVarChar, hashedPassword)
    .query('INSERT INTO users (Nombre, Correo, Contrasenia) VALUES (@Nombre, @Correo, @Contrasenia)'); 
  
    res.status(200).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error('Error en la creación de usuario:', error);
    res.status(500).json({ error: 'Error en la creación de usuario' });
  }
};

// Función para iniciar sesión
exports.loginUser = async (req, res) => {
  const { Correo, Contrasenia } = req.body;

  try {
    const pool = await connectDB();
    console.log("Conexión establecida.");

    const result = await pool.request()
      .input('Correo', sql.NVarChar, Correo)
      .query('SELECT * FROM Users WHERE Correo = @Correo');
    
    console.log("Consulta realizada.");
    console.log("Correo recibido:", Correo);


    if (result.recordset.length === 0) {
      console.log("Usuario no encontrado.");
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }

    const user = result.recordset[0];
    console.log("Usuario encontrado:", user);

    // Comparar la contraseña ingresada con la almacenada
    const passwordMatch = await bcrypt.compare(Contrasenia, user.Contrasenia);
    console.log("Contraseña comparada.");

    if (!passwordMatch) {
      console.log("Contraseña incorrecta.");
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Crear el token JWT
    const token = jwt.sign(
      { id: user.id, Correo: user.Correo },
      'secretkey', // Cambia esta clave secreta por algo más seguro
      { expiresIn: '1h' } // El token expirará en 1 hora
    );

    console.log("Token generado:", token);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
};



// exports.addUser = async (req, res) => {
//   const { nombre, correo } = req.body;

//   if (!nombre || !correo) {
//     return res.status(400).send('Nombre y correo electrónico son requeridos');
//   }

//   try {
//     const pool = await connectDB();
//     await pool.request()
//       .input('nombre', sql.NVarChar, nombre)
//       .input('correo', sql.NVarChar, correo)
//       .query('INSERT INTO Users (nombre, correo) VALUES (@nombre, @correo)');
//     res.status(201).send('Usuario agregado con éxito');
//     console.log("Lo hicimos")
//   } catch (error) {
//     console.error('Error al agregar usuario:', error);
//     res.status(500).send('Error del servidor');
//     console.log("Nada")
//   }
// };

exports.getUsers = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query('SELECT id, nombre, correo, creado FROM Users');
    console.log(result);
    res.status(200).json(result.recordset);
    console.log("Lo hicimos")
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error del servidor');
  }
};

// Agregar datos de métricas del usuario
exports.addMetrics = async (req, res) => {
    const { userID, peso, altura, genero, edad, bpmr, bpma, spo2, vam, vo2max } = req.body;

    if (!userID || !peso || !altura || !genero || !edad || !bpmr || !bpma || !spo2 || !vam || !vo2max) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const pool = await connectDB();
        await pool.request()
            .input('UserID', sql.Int, userID)
            .input('Peso', sql.Float, peso)
            .input('Altura', sql.Float, altura)
            .input('Genero', sql.NVarChar, genero)
            .input('Edad', sql.Int, edad)
            .input('BPMR', sql.Float, bpmr)
            .input('BPMA', sql.Float, bpma)
            .input('SPO2', sql.Float, spo2)
            .input('VAM', sql.Float, vam)
            .input('VO2MAX', sql.Float, vo2max)
            .query(`
                INSERT INTO UserMetrics (UserID, Peso, Altura, Genero, Edad, BPMR, BPMA, SPO2, VAM, VO2MAX)
                VALUES (@UserID, @Peso, @Altura, @Genero, @Edad, @BPMR, @BPMA, @SPO2, @VAM, @VO2MAX)
            `);
        res.status(201).json({ message: 'Métricas agregadas exitosamente.' });
    } catch (error) {
        console.error('Error al agregar métricas:', error);
        res.status(500).json({ error: 'Error al agregar métricas.' });
    }
};

// Obtener métricas de un usuario
exports.getMetrics = async (req, res) => {
    // const { userID } = req.params;

    try {
      // Convertir el id a número entero
    const userID = parseInt(req.params.userID, 10); 

    // Verifica si la conversión fue exitosa
    if (isNaN(userID)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
        const pool = await connectDB();
        const result = await pool.request()
            .input('UserID', sql.Int, userID)
            .query('SELECT * FROM UserMetrics WHERE UserID = @UserID');
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al obtener métricas:', error);
        res.status(500).json({ error: 'Error al obtener métricas.' });
    }
};
