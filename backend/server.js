const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const superadmin = require('./routes/superAdminRoutes');
const admin = require('./routes/adminRoutes');
const administration = require('./routes/administrationRoutes');
const teacher = require('./routes/teacherRoutes');
const student = require('./routes/studentRoutes');

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/superadmin', superadmin);
app.use('/api/v1/admin', admin);
app.use('/api/v1/administration', administration);
app.use('/api/v1/teacher', teacher);
app.use('/api/v1/student', student);

// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Multi-tenant School Management System API' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
});
