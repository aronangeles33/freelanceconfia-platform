// Proyecto: Backend para FreelanceConfía - Plataforma de freelancers en América Latina
// Tecnologías: Node.js, Express, MongoDB (con Mongoose), JWT para autenticación, Socket.io para chat en tiempo real, Stripe para pagos con escrow, bcrypt para hashing passwords, express-rate-limit para seguridad.
// Objetivo: Crear una API REST escalable que soporte autenticación, gestión de usuarios, proyectos, postulaciones, mensajería, pagos, y sistema de reputación/matching con IA simple.
// Estructura: Endpoints para /users, /projects, /applications, /messages, /payments, /reputation, /matching.
// Seguridad: Usa JWT para autenticación, bcrypt para contraseñas, CORS para frontend, rate limiting para prevenir abusos.
// Integraciones: MongoDB Atlas para base de datos, Stripe para pagos, Socket.io para mensajería en tiempo real.
// Instrucciones: Genera el código completo paso a paso. Usa placeholders para credenciales (process.env.MONGO_URI, etc.) que se configurarán en .env. Maneja errores con try-catch y devuelve respuestas JSON claras. Optimiza para producción (logging, validaciones). No generes credenciales reales.

// Paso 1: Importar dependencias y configurar Express
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const stripe = require('stripe');
const rateLimit = require('express-rate-limit');

// Configuración de variables de entorno
// En desarrollo: usar .env file
// En producción: usar variables de entorno nativas de Render
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Debug: Mostrar variables de entorno (sin mostrar valores sensibles completos)
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Si MONGODB_URI es undefined, mostrar error específico
if (!process.env.MONGODB_URI) {
  console.error('❌ CRITICAL: MONGODB_URI is undefined');
  console.error('Available environment variables:');
  Object.keys(process.env).filter(key => key.startsWith('MONGO')).forEach(key => {
    console.error(`  ${key}: ${!!process.env[key]}`);
  });
} else {
  console.log('✅ MONGODB_URI is available');
}

// Validar variables de entorno requeridas
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
const missingVars = requiredEnvVars.filter(varName => {
  const value = process.env[varName];
  return !value || value.trim() === '';
});

if (missingVars.length > 0) {
  console.error('❌ Missing or empty required environment variables:', missingVars.join(', '));
  console.error('Please check your environment configuration.');
  console.error('All env variables:', Object.keys(process.env).sort());
  process.exit(1);
}

console.log('✅ All required environment variables are set and non-empty');
console.log('Environment:', process.env.NODE_ENV || 'development');

const app = express();

// Configurar trust proxy para Render
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: ["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  } 
});

// Middleware: JSON parsing, CORS, rate limiting (100 requests por 15 min)
app.use(express.json());
app.use(cors({ 
  origin: [
    "http://localhost:3000", 
    "http://localhost:8080", 
    "http://127.0.0.1:3000", 
    "http://127.0.0.1:8080",
    process.env.FRONTEND_URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Servir archivos estáticos del frontend (React build)
const frontendPath = path.join(__dirname, 'FreelanceConfía', 'confia-talento-latam-main', 'dist');
console.log('Serving static files from:', frontendPath);
app.use(express.static(frontendPath));

// Paso 2: Conectar a MongoDB Atlas
// Usa process.env.MONGODB_URI, maneja errores de conexión
console.log('🔗 Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Server will continue running but database operations will fail');
    // No hacer process.exit() para que el servidor siga corriendo y podamos hacer debug
  });

// Paso 3: Definir Modelos de Mongoose
// Modelo User (para freelancers y empresas)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['freelancer', 'company'], required: true },
  skills: [String], // Para freelancers
  location: String,
  portfolio: [String], // URLs o referencias a trabajos
  reputationScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Hash password antes de guardar
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
const User = mongoose.model('User', userSchema);

// Modelo Project
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  budget: { type: Number, required: true },
  category: String,
  location: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

// Modelo Application (postulaciones)
const applicationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposal: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', applicationSchema);

// Modelo Message
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Modelo Payment
const paymentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'held', 'completed', 'refunded'], default: 'pending' },
  stripeId: String,
  createdAt: { type: Date, default: Date.now }
});
const Payment = mongoose.model('Payment', paymentSchema);

// Paso 4: Middleware de autenticación JWT
// Verifica token en Authorization header, decodifica, y agrega user a req
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Token is not valid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid.' });
  }
};

// Paso 5: Endpoints de Autenticación
// POST /api/register: Registra usuario (freelancer o empresa)
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name, role, skills, location } = req.body;

    // Validaciones básicas
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password and role are required' });
    }

    if (!['freelancer', 'company'].includes(role)) {
      return res.status(400).json({ error: 'Role must be freelancer or company' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      name,
      role,
      skills: skills || [],
      location
    });

    await user.save();

    // Generar JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Devolver usuario sin password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/login: Autentica usuario
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verificar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generar JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Devolver usuario sin password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paso 6: Endpoints para Users
// GET /api/users/:id: Obtiene perfil de usuario
app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id: Actualiza perfil
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    // Verificar que el usuario solo pueda actualizar su propio perfil
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, skills, location, portfolio } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (skills) updateData.skills = skills;
    if (location) updateData.location = location;
    if (portfolio) updateData.portfolio = portfolio;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paso 7: Endpoints para Projects
// GET /api/projects: Lista todos los proyectos abiertos
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'open' })
      .populate('client', 'name location role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/featured: Lista proyectos destacados (lógica simple: mayor presupuesto)
app.get('/api/projects/featured', async (req, res) => {
  try {
    const featuredProjects = await Project.find({ status: 'open' })
      .populate('client', 'name location role')
      .sort({ budget: -1 })
      .limit(5);

    res.json(featuredProjects);
  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/projects: Crea un proyecto (solo companies)
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    // Verificar que el usuario sea una empresa
    if (req.user.role !== 'company') {
      return res.status(403).json({ error: 'Only companies can create projects' });
    }

    const { title, description, budget, category, location } = req.body;

    // Validaciones básicas
    if (!title || !budget) {
      return res.status(400).json({ error: 'Title and budget are required' });
    }

    const project = new Project({
      title,
      description,
      budget,
      category,
      location,
      client: req.user._id
    });

    await project.save();
    await project.populate('client', 'name location role');

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/projects/:id: Detalle de proyecto
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name location role');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paso 8: Endpoints para Applications
// POST /api/applications: Postularse a un proyecto
app.post('/api/applications', authMiddleware, async (req, res) => {
  try {
    // Verificar que el usuario sea un freelancer
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ error: 'Only freelancers can apply to projects' });
    }

    const { projectId, proposal } = req.body;

    // Validaciones básicas
    if (!projectId || !proposal) {
      return res.status(400).json({ error: 'Project ID and proposal are required' });
    }

    // Verificar que el proyecto existe y está abierto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ error: 'Project is not open for applications' });
    }

    // Verificar que el freelancer no haya aplicado ya
    const existingApplication = await Application.findOne({
      project: projectId,
      freelancer: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this project' });
    }

    const application = new Application({
      project: projectId,
      freelancer: req.user._id,
      proposal
    });

    await application.save();
    await application.populate('freelancer', 'name skills location reputationScore');
    await application.populate('project', 'title budget');

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/applications/project/:projectId: Lista postulaciones de un proyecto
app.get('/api/applications/project/:projectId', authMiddleware, async (req, res) => {
  try {
    // Verificar que el usuario es el dueño del proyecto
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const applications = await Application.find({ project: req.params.projectId })
      .populate('freelancer', 'name skills location reputationScore')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get project applications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/applications/:id: Aceptar/rechazar postulación
app.patch('/api/applications/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    // Validar status
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    const application = await Application.findById(req.params.id)
      .populate('project');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verificar que el usuario es el dueño del proyecto
    if (application.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    application.status = status;
    await application.save();

    // Si se acepta la aplicación, cambiar el estado del proyecto
    if (status === 'accepted') {
      await Project.findByIdAndUpdate(application.project._id, { status: 'in-progress' });
    }

    res.json({
      message: `Application ${status} successfully`,
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paso 9: Endpoints para Reputation (IA simple)
// GET /api/reputation/:type/:id: Calcula puntaje de reputación (freelancer o company)
app.get('/api/reputation/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['freelancer', 'company'].includes(type)) {
      return res.status(400).json({ error: 'Type must be freelancer or company' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Lógica simple: promedio de reviews (mocked) + éxito de pagos (Payments con status 'completed')
    // Ejemplo: score = (avgReviews * 0.6 + paymentSuccessRate * 0.4) * 100

    // Obtener pagos completados relacionados con el usuario
    let completedPayments = 0;
    let totalPayments = 0;

    if (type === 'freelancer') {
      // Para freelancers, contar pagos de proyectos donde fueron aceptados
      const acceptedApplications = await Application.find({ 
        freelancer: id, 
        status: 'accepted' 
      }).populate('project');

      for (const app of acceptedApplications) {
        const payments = await Payment.find({ project: app.project._id });
        totalPayments += payments.length;
        completedPayments += payments.filter(p => p.status === 'completed').length;
      }
    } else {
      // Para companies, contar pagos de sus proyectos
      const projects = await Project.find({ client: id });
      for (const project of projects) {
        const payments = await Payment.find({ project: project._id });
        totalPayments += payments.length;
        completedPayments += payments.filter(p => p.status === 'completed').length;
      }
    }

    const paymentSuccessRate = totalPayments > 0 ? completedPayments / totalPayments : 0;
    
    // Mock de reviews (en una implementación real, tendrías un modelo Review)
    const avgReviews = 4.2; // Valor simulado entre 1-5
    
    const reputationScore = Math.round((avgReviews / 5 * 0.6 + paymentSuccessRate * 0.4) * 100);

    // Actualizar el score en el usuario
    await User.findByIdAndUpdate(id, { reputationScore });

    res.json({
      userId: id,
      type,
      reputationScore,
      details: {
        avgReviews,
        paymentSuccessRate: Math.round(paymentSuccessRate * 100),
        totalPayments,
        completedPayments
      }
    });
  } catch (error) {
    console.error('Get reputation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paso 10: Endpoints para Matching (IA simple)
// GET /api/matching/:freelancerId: Recomienda proyectos según skills
app.get('/api/matching/:freelancerId', async (req, res) => {
  try {
    const freelancer = await User.findById(req.params.freelancerId);
    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    if (freelancer.role !== 'freelancer') {
      return res.status(400).json({ error: 'User must be a freelancer' });
    }

    // Busca proyectos abiertos, compara skills de freelancer con categoría, devuelve top 5
    const freelancerSkills = freelancer.skills || [];
    
    let matchedProjects = [];
    
    if (freelancerSkills.length > 0) {
      // Buscar proyectos cuya categoría coincida con las skills del freelancer
      const skillsRegex = new RegExp(freelancerSkills.join('|'), 'i');
      
      matchedProjects = await Project.find({
        status: 'open',
        $or: [
          { category: { $regex: skillsRegex } },
          { title: { $regex: skillsRegex } },
          { description: { $regex: skillsRegex } }
        ]
      })
      .populate('client', 'name location role')
      .sort({ budget: -1 })
      .limit(5);
    }

    // Si no hay matches específicos, devolver proyectos recientes
    if (matchedProjects.length === 0) {
      matchedProjects = await Project.find({ status: 'open' })
        .populate('client', 'name location role')
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.json({
      freelancerId: req.params.freelancerId,
      matchedProjects,
      matchingCriteria: freelancerSkills
    });
  } catch (error) {
    console.error('Get matching projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Paso 11: Endpoints para Messages
// GET /api/messages/:userId: Obtiene conversaciones de un usuario
app.get('/api/messages/:userId', authMiddleware, async (req, res) => {
  try {
    // Verificar que el usuario solo pueda ver sus propios mensajes
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.params.userId },
        { receiver: req.params.userId }
      ]
    })
    .populate('sender', 'name role')
    .populate('receiver', 'name role')
    .sort({ timestamp: -1 });

    // Agrupar por conversación
    const conversations = {};
    messages.forEach(message => {
      const otherUserId = message.sender._id.toString() === req.params.userId 
        ? message.receiver._id.toString() 
        : message.sender._id.toString();
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          participant: message.sender._id.toString() === req.params.userId 
            ? message.receiver 
            : message.sender,
          messages: []
        };
      }
      conversations[otherUserId].messages.push(message);
    });

    res.json(Object.values(conversations));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.io para chat en tiempo real
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, content } = data;

      // Guardar mensaje en la base de datos
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content
      });

      await message.save();
      await message.populate('sender', 'name role');
      await message.populate('receiver', 'name role');

      // Emitir mensaje al receptor
      io.to(receiverId).emit('newMessage', message);
      
      // Confirmar al remitente
      socket.emit('messageSent', message);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Paso 12: Endpoints para Payments (con Stripe para escrow)
// Inicializa Stripe con process.env.STRIPE_SECRET_KEY
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create: Crea un payment intent para escrow
app.post('/api/payments/create', authMiddleware, async (req, res) => {
  try {
    const { projectId, amount } = req.body;

    // Verificar que el usuario sea el cliente del proyecto
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Crear payment intent en Stripe
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      metadata: {
        projectId: projectId,
        clientId: req.user._id.toString()
      }
    });

    // Guardar payment en la base de datos
    const payment = new Payment({
      project: projectId,
      amount,
      status: 'pending',
      stripeId: paymentIntent.id
    });

    await payment.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/payments/confirm: Confirma pago tras completar proyecto
app.post('/api/payments/confirm', authMiddleware, async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId).populate('project');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verificar que el usuario sea el cliente del proyecto
    if (payment.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Confirmar el pago en Stripe
    await stripeClient.paymentIntents.confirm(payment.stripeId);

    // Actualizar status del payment
    payment.status = 'completed';
    await payment.save();

    // Actualizar status del proyecto
    await Project.findByIdAndUpdate(payment.project._id, { status: 'completed' });

    res.json({
      message: 'Payment confirmed successfully',
      payment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FreelanceConfía API is running',
    timestamp: new Date().toISOString()
  });
});

// Servir el frontend para todas las rutas que no sean API
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'FreelanceConfía', 'confia-talento-latam-main', 'dist', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Paso 13: Iniciar servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server accessible at: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});