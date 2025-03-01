require('dotenv').config();

module.exports = {
    port: process.env.PORT || 8000,
    googleGeminiKey: process.env.GOOGLE_GEMINI_AI_KEY,
    environment: process.env.NODE_ENV || 'development',
    corsOptions: {
        origin: '*',
        optionsSuccessStatus: 200
    },
    database: {
        url: process.env.MONGODB_URI || 'mongodb://localhost:27017/sih2024',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key'
};
