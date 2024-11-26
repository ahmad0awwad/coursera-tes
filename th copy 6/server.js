const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Importing the filesystem module
const Invoice = require('./models/invoice');
const Area = require('./models/area');
const Slider = require('./models/slider');
const Category = require('./models/category');
const outputPath = path.join(__dirname, 'output.json');

////
//var serveStatic = require('serve-static')
//const publicDir = path.join(__dirname, 'public');
const { MongoClient } = require('mongodb');

////
const app = express();
const PORT = 8000;
////
//const compression = require('compression');
//app.use(compression());

////

//لتحديث الداتا بيس من ملف output.json
const isValidCategory = (category) => {
    return category._id && category.name && Array.isArray(category.subcategories);
};
const syncJsonToDatabase = async () => {
    try {
        console.log('Syncing database with output.json...');
        const jsonData = fs.readFileSync(outputPath, 'utf8');
        const { categories: jsonCategories } = JSON.parse(jsonData);

        console.log('Parsed categories from output.json:', jsonCategories);

        // Fetch all categories from the database
        const dbCategories = await Category.find();

        // Sync categories
        for (const categoryData of jsonCategories) {
            if (!isValidCategory(categoryData)) {
                console.error(`Invalid category format: ${JSON.stringify(categoryData)}`);
                continue; // Skip invalid entries
            }

            let category = await Category.findById(categoryData._id);

            if (!category) {
                console.log(`Creating new category: ${categoryData.name}`);
                category = new Category(categoryData);
            } else {
                console.log(`Updating existing category: ${categoryData.name}`);

                for (const subcategoryData of categoryData.subcategories) {
                    let subcategory = category.subcategories.id(subcategoryData._id);

                    if (!subcategory) {
                        console.log(`Adding new subcategory: ${subcategoryData.name}`);
                        category.subcategories.push(subcategoryData);
                    } else {
                        console.log(`Syncing products in subcategory: ${subcategoryData.name}`);

                        for (const productData of subcategoryData.products) {
                            const existingProduct = subcategory.products.id(productData._id);

                            if (!existingProduct) {
                                console.log(`Adding new product: ${productData.name}`);
                                subcategory.products.push(productData);
                            } else {
                                console.log(`Updating product: ${productData.name}`);
                                Object.assign(existingProduct, productData);

                                if (productData.Video) {
                                    console.log(`Updating video for product: ${productData.name}`);
                                    existingProduct.Video = productData.Video;
                                }
                            }
                        }

                        subcategory.products = subcategory.products.filter(product =>
                            subcategoryData.products.some(jsonProduct => jsonProduct._id === product._id)
                        );
                    }
                }

                category.subcategories = category.subcategories.filter(subcategory =>
                    categoryData.subcategories.some(jsonSubcategory => jsonSubcategory._id === subcategory._id)
                );
            }

            await category.save();
        }

        for (const dbCategory of dbCategories) {
            if (!jsonCategories.some(jsonCategory => jsonCategory._id === dbCategory._id)) {
                console.log(`Deleting category: ${dbCategory.name}`);
                await Category.findByIdAndDelete(dbCategory._id);
            }
        }

        console.log('Database successfully synced with output.json');
    } catch (error) {
        console.error('Error syncing output.json to database:', error);
    }
};

syncJsonToDatabase();





// Watch for changes in `output.json`
fs.watch(outputPath, async (eventType) => {
    if (eventType === 'change') {
        console.log('output.json file changed. Syncing to database...');
        await syncJsonToDatabase();
    }
});
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
/* 
mongoose.connect('mongodb://admin:1234@127.0.0.1:27017/invoices?authSource=admin', {
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 1000
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err)); */



mongoose.connect('mongodb://localhost:27017/yourDatabaseName', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// API to fetch products from yourCollectionName
app.get('/api/yourCollectionName', async (req, res) => {
    try {
        const products = await Product.find();  // Fetch all products
        res.json(products);  // Send the products as JSON
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
const ProductSchema = new mongoose.Schema({
    name: String,
    customId: String, // Ensure this field exists
    'First Cat': String,
    'Second Cat': String,
    Description: String,
    'Sell Price': Number,
    'Gold Weight': String,
    'Diamond Weight': String,
    'Qty in Stock': Number,
    Picture: String, // Add for product images
    // Add other fields as needed
});

// Create the model for the collection
const Product = mongoose.model('yourCollectionName', ProductSchema);


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static(uploadsDir));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// API to get sliders
app.get('/api/slider', async (req, res) => {
    try {
        const sliders = await Slider.find();
        res.json(sliders);
    } catch (error) {
        console.error('Error fetching sliders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/api/categories/:categoryId/subcategories/:subcategoryId', async (req, res) => {
    const { categoryId, subcategoryId } = req.params;

    try {
        const category = await Category.findById(categoryId).populate('subcategories');
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const subcategory = category.subcategories.find(sub => sub._id === subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        res.json(subcategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// API to get featured products
app.get('/api/featured-products', async (req, res) => {
    try {
        const categories = await Category.find({ 'subcategories.products.featured': true });
        const featuredProducts = [];
        categories.forEach(category => {
            category.subcategories.forEach(subcategory => {
                subcategory.products.forEach(product => {
                    if (product.featured) {
                        featuredProducts.push(product);
                    }
                });
            });
        });
        res.json(featuredProducts);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/api/yourCollectionName', (req, res) => {
    // Logic to fetch data
    res.json({ message: 'Your data here' });  // Respond with JSON data
});

// API to create a new category
app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const category = new Category({ name, subcategories: [] });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to create a new subcategory
app.post('/api/categories/:categoryId/subcategories', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        category.subcategories.push({ name, products: [] });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to add a new product
app.post('/api/categories/:categoryId/subcategories/:subcategoryId/products', upload.array('images', 5), async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { 'name.en': nameEn, 'name.ar': nameAr, 'description.en': descriptionEn, 'description.ar': descriptionAr, price, featured } = req.body;
        const images = req.files.map(file => `/uploads/${file.filename}`);

        if (!nameEn || !nameAr || !descriptionEn || !descriptionAr || isNaN(price)) {
            return res.status(400).json({ error: 'Invalid product data' });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const subcategory = category.subcategories.id(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }

        const product = {
            name: { en: nameEn, ar: nameAr },
            price: parseFloat(price),
            description: { en: descriptionEn, ar: descriptionAr },
            images,
            featured: featured === 'true'
        };

        subcategory.products.push(product);
        await category.save();

        res.status(201).json(product);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// API to update a category
app.put('/api/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(categoryId, { name }, { new: true });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to update a subcategory
app.put('/api/categories/:categoryId/subcategories/:subcategoryId', async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const { name } = req.body;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const subcategory = category.subcategories.id(subcategoryId);
        if (!subcategory) {
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        subcategory.name = name;
        await category.save();
        res.json(subcategory);
    } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to update a product
app.put('/api/products/:productId', upload.array('editProductImages', 5), async (req, res) => {
    try {
        const { productId } = req.params;
        const { 'name.en': nameEn, 'name.ar': nameAr, 'description.en': descriptionEn, 'description.ar': descriptionAr, price, featured, deleteImages } = req.body;
        const newImages = req.files.map(file => `/uploads/${file.filename}`);

        const categories = await Category.find();
        let product = null;
        let subcategory = null;
        let category = null;

        for (const cat of categories) {
            for (const sub of cat.subcategories) {
                const foundProduct = sub.products.id(productId);
                if (foundProduct) {
                    product = foundProduct;
                    subcategory = sub;
                    category = cat;
                    break;
                }
            }
            if (product) break;
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Update product details
        if (nameEn) product.name.en = nameEn;
        if (nameAr) product.name.ar = nameAr;
        if (descriptionEn) product.description.en = descriptionEn;
        if (descriptionAr) product.description.ar = descriptionAr;
        if (price) product.price = parseFloat(price);
        product.featured = featured === 'true';

        // Delete specified images
        if (deleteImages) {
            const deleteImagesArray = JSON.parse(deleteImages);
            product.images = product.images.filter(image => !deleteImagesArray.includes(image));
        }

        // Append new images
        product.images = product.images.concat(newImages);

        await category.save();
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// API to delete a category
app.delete('/api/categories/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to delete a subcategory
app.delete('/api/categories/:categoryId/subcategories/:subcategoryId', async (req, res) => {
    try {
        const { categoryId, subcategoryId } = req.params;
        const category = await Category.findById(categoryId);
        if (!category) {
            console.error(`Category not found: ${categoryId}`);
            return res.status(404).json({ error: 'Category not found' });
        }
        const subcategory = category.subcategories.id(subcategoryId);
        if (!subcategory) {
            console.error(`Subcategory not found: ${subcategoryId}`);
            return res.status(404).json({ error: 'Subcategory not found' });
        }
        category.subcategories.pull({ _id: subcategoryId });
        await category.save();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to delete a product
app.delete('/api/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const categories = await Category.find();
        let product = null;
        let subcategory = null;
        let category = null;

        for (const cat of categories) {
            for (const sub of cat.subcategories) {
                const foundProduct = sub.products.id(productId);
                if (foundProduct) {
                    product = foundProduct;
                    subcategory = sub;
                    category = cat;
                    break;
                }
            }
            if (product) break;
        }

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Remove the product
        subcategory.products.pull(productId);
        await category.save();

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// API to create a new invoice
app.post('/api/invoices', upload.array('civilIdImages', 2), async (req, res) => {
    try {
        console.log('Received invoice data:', req.body);
        const { orderDetails } = req.body;
        const parsedOrderDetails = JSON.parse(orderDetails);

        const invoiceData = {
            shippingMethod: parsedOrderDetails.shippingMethod,
            pickupDetails: parsedOrderDetails.pickupDetails,
            deliveryDetails: parsedOrderDetails.deliveryDetails,
            paymentMethod: parsedOrderDetails.paymentMethod,
            cart: parsedOrderDetails.cart
        };

        if (req.files) {
            const civilIdImages = req.files.map(file => `/uploads/${file.filename}`);
            invoiceData.deliveryDetails.civilIdImages = civilIdImages;
        }

        const invoice = new Invoice(invoiceData);
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        console.error('Error processing invoice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// API to get all invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find();
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API to get all areas
app.get('/api/areas', async (req, res) => {
    try {
        const areas = await Area.find();
        res.json(areas);
    } catch (error) {
        console.error('Error fetching areas:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

 
//API to get all categories from output.json
app.get('/api/categories', (req, res) => {
    const filePath = path.join(__dirname, 'output.json');  // Path to your output.json file

    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading output.json:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Parse and return the JSON data
        const categories = JSON.parse(data);
        res.json(categories);
    });
}); 
/////
/////
// API to get subcategories by category ID from output.json
app.get('/api/categories/:id', (req, res) => {
    const filePath = path.join(__dirname, 'output.json');  // Path to your output.json file

    // Read the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading output.json:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Parse the JSON data
        const categories = JSON.parse(data);

        // Find the category by ID
        const category = categories.find(cat => cat._id === req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Return the found category (including subcategories)
        res.json(category);
    });
});

app.get('/api/categories/:categoryId/subcategories/:subcategoryId/products', (req, res) => {
    const { categoryId, subcategoryId } = req.params;
    const filePath = path.join(__dirname, 'output.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading output.json:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
            const jsonData = JSON.parse(data);
            const categories = jsonData.categories;
            console.log('Categories fetched:', categories);

            const category = categories.find(cat => cat._id === categoryId);
            if (!category) {
                console.error(`Category ${categoryId} not found.`);
                return res.status(404).json({ error: 'Category not found' });
            }

            const subcategory = category.subcategories.find(sub => sub._id === subcategoryId);
            if (!subcategory) {
                console.error(`Subcategory ${subcategoryId} not found in category ${categoryId}.`);
                return res.status(404).json({ error: 'Subcategory not found' });
            }

            console.log('Products:', subcategory.products);
            res.json(subcategory.products || []);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            return res.status(500).json({ error: 'Invalid JSON format in output.json' });
        }
    });
});





// API to fetch products from yourCollectionName
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();  // Fetch all products
        console.log('Fetched Products:', products);  // Log to see the fetched data
        res.json(products);  // Send the products as JSON
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/api/products/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        console.log("Extracted productId from API:", productId);

        const categories = await Category.find(); // Fetch all categories
        console.log("Categories fetched:", categories.length);

        let product = null;

        // Traverse categories and subcategories to find the product
        for (const category of categories) {
            console.log(`Checking category: ${category.name || "No name"}`);
            for (const subcategory of category.subcategories || []) {
                console.log(`Checking subcategory: ${subcategory.name || "No name"}`);
                
                // Log the products in the current subcategory
                console.log("Products in subcategory:", subcategory.products || "No products");

                // Ensure products array exists and match product ID
                const products = subcategory.products || [];
                product = products.find(p => String(p._id) === productId);

                if (product) {
                    console.log("Product found:", product);
                    break; // Stop searching
                }
            }

            if (product) break; // Exit the loop once the product is found
        }

        if (!product) {
            console.error(`Product with ID ${productId} not found.`);
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(product); // Return the found product
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});















///
app.use((req, res, next) => {
    if (req.url.endsWith('.html')) {
      const newUrl = req.url.slice(0, -5);
      return res.redirect(301, newUrl);
    }
    next();
  });
  
app.use(express.static(path.join(__dirname, 'public'), {
    extensions: ['html']
  }));
  

  
  app.use((req, res) => {
    res.redirect('/no');
  });
  ////
  const orderSchema = new mongoose.Schema({
    customer: {
        name: String,
        civilId: String,
        phone: String,
        address: String,
    },
    products: [
        {
            type: String,
            name: String,
            quantity: Number,
            price: Number,
            discount: Number,
        }
    ],
    totalPrice: Number,
    totalDiscount: Number,
    netTotal: Number,
    paymentMethod: String,
});


  app.get('/api/order/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});








