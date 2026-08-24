// server.js
require('dotenv').config();

const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 5000;

console.log('🔍 Environment Variables:');
console.log('  PORT:', process.env.PORT);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('  DB_HOST:', process.env.DB_HOST);

// Test database connection before starting server
pool.connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📍 Allowing requests from: ${process.env.FRONTEND_URL}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('💡 Make sure you have network access to RDS');
    // Still start the server even if DB fails (for testing)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (without DB)`);
      console.log(`📍 Allowing requests from: ${process.env.FRONTEND_URL}`);
    });
  });