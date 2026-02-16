const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'superadmin@edusaas.com';
        const existing = await User.findOne({ email });

        if (existing) {
            console.log('SuperAdmin already exists');
            process.exit();
        }

        await User.create({
            name: 'System Owner',
            email: email,
            password: 'superpassword123',
            role: 'superadmin',
            mustChangePassword: false
        });

        console.log('SuperAdmin created successfully');
        console.log('Email: ' + email);
        console.log('Password: superpassword123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createSuperAdmin();
