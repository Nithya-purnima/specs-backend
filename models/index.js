const sequelize = require('../config/database');
const Customer = require('./Customer');
const Product = require('./Product');
const Admin = require('./Admin');
const Seller = require('./Seller');
const Order = require('./Order');

// Define relationships
Seller.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(Seller, { foreignKey: 'sellerId', as: 'seller' });

// Order relationships
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Order.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Order.belongsTo(Seller, { foreignKey: 'sellerId', as: 'seller' });

Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Product.hasMany(Order, { foreignKey: 'productId', as: 'orders' });
Seller.hasMany(Order, { foreignKey: 'sellerId', as: 'orders' });

// Sync all models with database
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
    }
};

module.exports = {
    sequelize,
    Customer,
    Product,
    Admin,
    Seller,
    Order,
    syncDatabase
};
