const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'products.json');


function readProducts() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
    return [];
  }
}
//-----------
function writeProducts(products) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

// GET 
router.get('/', (req, res) => {
  try {
    const products = readProducts();
    const { id, name } = req.query;

    if (id) {
      const product = products.find(p => p.id === Number(id));
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(product);
    }

    if (name) {
      const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(name.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(name.toLowerCase()))
      );
      return res.json(filteredProducts);
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET 
router.get('/:id', (req, res) => {
  try {
    const products = readProducts();
    const product = products.find(p => p.id === Number(req.params.id));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST
router.post('/', (req, res) => {
  try {
    const products = readProducts();
    const { name, brand, category, price, description, imgURL } = req.body;

    if (!name || price === undefined || price === null || price === '') {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      name,
      brand: brand || '',
      category: category || '',
      price: Number(price),
      description: description || '',
      imgURL: imgURL || ''
    };

    products.push(newProduct);
    writeProducts(products);

    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct,
      products: products
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT
router.put('/:id', (req, res) => {
  try {
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === Number(req.params.id));

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentProduct = products[productIndex];
    const { name, brand, category, price, description, imgURL } = req.body;

    if (name !== undefined) currentProduct.name = name;
    if (brand !== undefined) currentProduct.brand = brand;
    if (category !== undefined) currentProduct.category = category;
    if (price !== undefined) currentProduct.price = Number(price);
    if (description !== undefined) currentProduct.description = description;
    if (imgURL !== undefined) currentProduct.imgURL = imgURL;

    writeProducts(products);

    res.json({
      message: 'Product updated successfully',
      product: currentProduct,
      products: products
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE 
router.delete('/:id', (req, res) => {
  try {
    const products = readProducts();
    const productIndex = products.findIndex(p => p.id === Number(req.params.id));

    if (productIndex === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deletedProduct = products.splice(productIndex, 1)[0];
    writeProducts(products);

    res.json({
      message: 'Product deleted successfully',
      deletedProduct: deletedProduct,
      products: products
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
