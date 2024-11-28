const express = require('express');
const { getUsers, addUser } = require('../controllers/userController');
const { addMetrics, getMetrics } = require('../controllers/userController');
const { loginUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/users', getUsers);
router.post('/users', addUser);
router.post('/metrics', authMiddleware, addMetrics);
// router.get('/metrics', authMiddleware, (req, res) => {
//     // Aquí iría la lógica para obtener todas las métricas, si es necesario
//     res.send('Aquí van todas las métricas');
//   });
  
  // Ruta para obtener las métricas de un usuario específico (protegida por el middleware)
router.get('/metrics/:userID', getMetrics);// Para obtener métricas de un usuario
// Ruta para agregar un nuevo usuario

// Ruta para iniciar sesión
router.post('/login', loginUser);

module.exports = router;
