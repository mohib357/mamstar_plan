const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/mamstar_plan';

// User schema (same as your model)
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    permissions: [String],
    isActive: Boolean,
    lastLogin: Date
});

const User = mongoose.model('User', userSchema);

const seedAdmin = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully!');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@mamstar.com' });
        if (existingAdmin) {
            console.log('ℹ️ Admin user already exists');
            console.log('📧 Email:', existingAdmin.email);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 12);

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            email: 'admin@mamstar.com',
            password: hashedPassword,
            role: 'admin',
            permissions: ['dashboard', 'orders', 'products', 'customers', 'coupons', 'sms'],
            isActive: true,
            lastLogin: new Date()
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@mamstar.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: admin');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
    }
};

seedAdmin();