const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const config = require("./config/config");
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const { format } = winston;
const multer = require('multer'); // Added for handling file uploads

// Load environment variables
dotenv.config();

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/activity.log' })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Initialize Clerk middleware
const clerkAuth = ClerkExpressWithAuth({
  secretKey: process.env.CLERK_SECRET_KEY
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files will be stored in 'uploads' folder temporarily

// Activity logging middleware
const logActivity = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || 'anonymous',
      userRole: req.user?.publicMetadata?.role || 'anonymous',
      ip: req.ip
    });
  });
  
  next();
};

// Clerk Authentication Middleware
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn('Authentication attempt without token');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await clerkAuth.verifyToken(token);
    if (!decoded) {
      logger.warn('Invalid token attempt', { token: token.substring(0, 10) + '...' });
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await clerkAuth.users.getUser(decoded.sub);
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', { error: error.message, stack: error.stack });
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.publicMetadata?.role || 'user';
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Unauthorized role access attempt', {
        userId: req.user?.id,
        userRole,
        requiredRoles: allowedRoles,
        path: req.path
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

const PORT = process.env.PORT || 8001;
const app = express();

// Enable CORS first to ensure all responses have CORS headers
app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET, POST, PUT, DELETE, PATCH",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply other middleware
app.use(limiter);
app.use(clerkAuth);
app.use(logActivity);
app.use(express.json());

// Connect to MongoDB
const mongoose = require('mongoose');
mongoose.connect(config.database.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => logger.info("Connected to MongoDB"))
  .catch(err => logger.error("MongoDB connection error:", err));

// Public routes
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// Add /analyze_batch route to handle file uploads
app.post(
  '/analyze_batch',
  requireAuth,
  requireRole(['admin', 'manager', 'user']),
  upload.single('file'),
  (req, res) => {
    logger.info('Analyze batch route hit', { file: req.file, userId: req.user?.id });
    if (!req.file) {
      logger.warn('No file uploaded for analyze_batch', { userId: req.user?.id });
      return res.status(400).json({ error: 'No file provided' });
    }

    // Mock response for now; implement actual CSV processing logic here
    const mockResponse = {
      anomaly_percentage: 5.2,
      anomalies_detected: 2,
      total_rows: 50
    };
    logger.info('Analyze batch response sent', { response: mockResponse, userId: req.user?.id });
    res.json(mockResponse);
  }
);

// Protected API routes
const authRoutes = require("./routes/auth.routes");
const aiRoutes = require("./routes/ai.routes");
const supplychainRoutes = require("./routes/supplychainRoutes");

// User management routes
app.get("/api/users", requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await clerkAuth.users.getUserList();
    const formattedUsers = users.map(user => ({
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl,
      role: user.publicMetadata?.role || 'user',
      createdAt: user.createdAt
    }));
    logger.info('Users list retrieved', { adminId: req.user.id });
    res.json(formattedUsers);
  } catch (error) {
    logger.error('Error fetching users:', { error: error.message, adminId: req.user.id });
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch("/api/users/:userId/role", requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    await clerkAuth.users.updateUser(userId, {
      publicMetadata: { role }
    });
    
    logger.info('User role updated', {
      adminId: req.user.id,
      targetUserId: userId,
      newRole: role
    });
    
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    logger.error('Error updating user role:', {
      error: error.message,
      adminId: req.user.id,
      targetUserId: req.params.userId
    });
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Protected routes with role-based access
app.use("/api/auth", requireAuth, authRoutes);
app.use("/api/ai", requireAuth, requireRole(['admin', 'manager', 'user']), aiRoutes);
app.use("/api/supplychain", requireAuth, requireRole(['admin', 'manager']), supplychainRoutes);

// Gemini AI route with authentication
app.post("/gemini", requireAuth, requireRole(['admin', 'manager', 'user']), async (req, res) => {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_AI_KEY);
    
    logger.info('Gemini AI request initiated', {
      userId: req.user.id,
      messageLength: req.body.message.length
    });
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({ history: req.body.history });
    const result = await chat.sendMessage(req.body.message);
    
    logger.info('Gemini AI request completed', {
      userId: req.user.id,
      responseLength: result.response.text().length
    });
    
    res.json({ response: result.response.text() });
  } catch (error) {
    logger.error('Gemini AI Error:', {
      error: error.message,
      userId: req.user.id,
      request: req.body.message.substring(0, 100) + '...'
    });
    res.status(500).json({ error: "AI Processing Error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    userId: req.user?.id || 'anonymous'
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info("Using server.js file with Clerk authentication and logging");
});