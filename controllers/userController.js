const { sql, poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRounds = 10; // Número de rondas para el salting de bcrypt

// **Agregar un usuario**
exports.addUser = async (req, res) => {
  const { Nombre, Correo, Contrasenia } = req.body;

  try {
    const pool = await poolPromise;

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(Contrasenia, saltRounds);

    await pool.request()
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Correo', sql.NVarChar, Correo)
      .input('Contrasenia', sql.NVarChar, hashedPassword)
      .query('INSERT INTO users (Nombre, Correo, Contrasenia) VALUES (@Nombre, @Correo, @Contrasenia)');

    res.status(200).json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    console.error('Error en la creación de usuario:', err);
    res.status(500).json({ error: 'Error en la creación de usuario' });
  }
};

// **Iniciar sesión**
exports.loginUser = async (req, res) => {
  const { Correo, Contrasenia } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('Correo', sql.NVarChar, Correo)
      .query('SELECT * FROM Users WHERE Correo = @Correo');

    if (result.recordset.length === 0) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }

    const user = result.recordset[0];

    // Comparar contraseñas
    const passwordMatch = await bcrypt.compare(Contrasenia, user.Contrasenia);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Correo o contraseña incorrectos' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, Correo: user.Correo },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error en el inicio de sesión:', err);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
};

// **Obtener todos los usuarios**
exports.getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT id, nombre, correo, creado FROM Users');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// **Agregar métricas del usuario**
exports.addMetrics = async (req, res) => {
  const { userID, peso, altura, genero, edad, bpmr, bpma, spo2, vam, vo2max } = req.body;

  try {
    const pool = await poolPromise;
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
  } catch (err) {
    console.error('Error al agregar métricas:', err);
    res.status(500).json({ error: 'Error al agregar métricas.' });
  }
};

// **Obtener métricas de un usuario**
exports.getMetrics = async (req, res) => {
  const userID = parseInt(req.params.userID, 10);

  if (isNaN(userID)) {
    return res.status(400).json({ error: 'ID de usuario inválido' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userID)
      .query('SELECT * FROM UserMetrics WHERE UserID = @UserID');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error al obtener métricas:', err);
    res.status(500).json({ error: 'Error al obtener métricas.' });
  }
};
