const { Product, syncDatabase } = require('./models');

const seedProducts = async () => {
    try {
        // Sync database first
        await syncDatabase();

        // Sample products data
        const products = [
            {
                name: 'Elegant Floral Dress',
                description: 'Elegant floral dress perfect for occasion. Made from premium fabric for all-day comfort.',
                price: 1999,
                brand: 'Tulip Fashion',
                stock: 50
            },
            {
                name: 'Premium Wireless Headphones',
                description: 'Latest gadgets and devices tech needs. Quality assured and competitively priced.',
                price: 4999,
                brand: 'ElectroX',
                stock: 30
            },
            {
                name: 'Organic Grocery Pack',
                description: 'Fresh groceries delivered to your door. Wide selection of organic and local produce.',
                price: 299,
                brand: 'GroceryPack',
                stock: 100
            },
            {
                name: 'Stylish Wristwatch',
                description: 'Stylish wristwatch with modern design. Water-resistant and durable for daily wear.',
                price: 2499,
                brand: 'TimePro',
                stock: 25
            },
            {
                name: 'Fashion Accessories Set',
                description: 'Trendy accessories to complement style. Choose from bags, and more.',
                price: 799,
                brand: 'AccSet',
                stock: 60
            },
            {
                name: 'Comfortable Shoes',
                description: 'Comfortable and fashionable shoes for occasions. Available in various sizes and colors.',
                price: 1599,
                brand: 'WalkEase',
                stock: 40
            },
            {
                name: 'High-Performance Laptop',
                description: 'High-performance laptops for work and play. Lightweight, powerful, and reliable.',
                price: 39999,
                brand: 'LapPro',
                stock: 15
            },
            {
                name: 'Latest Smartphone',
                description: 'Latest smartphones with advanced features. Stay connected with style and speed.',
                price: 24999,
                brand: 'SmartX',
                stock: 20
            },
            {
                name: 'Classic Book Collection',
                description: 'Explore a wide range of books across genres. Find your next great read here.',
                price: 499,
                brand: 'BookSet',
                stock: 80
            },
            {
                name: 'Modern Furniture Set',
                description: 'Modern and classic furniture for your home. Quality materials and elegant designs.',
                price: 8999,
                brand: 'FurniHome',
                stock: 10
            },
            {
                name: 'Educational Toys Set',
                description: 'Fun and educational toys for children of all ages. Safe and durable materials.',
                price: 699,
                brand: 'ToyBox',
                stock: 70
            },
            {
                name: 'Premium Kitchenware',
                description: 'Premium kitchenware for easy cooking. Durable, stylish, and easy to clean.',
                price: 1299,
                brand: 'KitchenPro',
                stock: 45
            },
            {
                name: 'Noise-Canceling Headphones',
                description: 'Wireless headphones with noise cancellation. Enjoy immersive sound quality.',
                price: 2999,
                brand: 'SoundMax',
                stock: 35
            },
            {
                name: 'Urban Backpack',
                description: 'Spacious and stylish backpack for daily use. Water-resistant and lightweight.',
                price: 1199,
                brand: 'UrbanPack',
                stock: 55
            },
            {
                name: 'UV-Protected Sunglasses',
                description: 'UV-protected sunglasses with modern frames. Perfect for sunny days.',
                price: 899,
                brand: 'SunStyle',
                stock: 65
            }
        ];

        // Clear existing products (optional)
        await Product.destroy({ where: {} });

        // Insert new products
        const createdProducts = await Product.bulkCreate(products);
        
        console.log(`✅ Successfully seeded ${createdProducts.length} products!`);
        console.log('Database seeding completed.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedProducts();
