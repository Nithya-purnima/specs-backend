const bcrypt = require('bcryptjs');
const { Admin, syncDatabase } = require('./models');

const createAdminAccount = async () => {
    try {
        // Sync database first
        await syncDatabase();

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ where: { email: 'admin@gmail.com' } });
        
        if (existingAdmin) {
            console.log('⚠️  Admin account already exists!');
            console.log('Email: admin@gmail.com');
            return;
        }

        // Create default admin account
        const hashedPassword = await bcrypt.hash('Password123', 10);
        
        const admin = await Admin.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: hashedPassword
        });

        console.log('✅ Admin account created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email: admin@gmail.com');
        console.log('Password: Password123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change the password after first login!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin account:', error);
        process.exit(1);
    }
};

createAdminAccount();
