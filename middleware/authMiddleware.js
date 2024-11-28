const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const decoded = jwt.verify(token, 'secretkey'); // Usa la misma clave secreta que en el login
    req.user = decoded; // Guardamos los datos del usuario en el request
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Token inválido.' });
  }
};

module.exports = authMiddleware;
