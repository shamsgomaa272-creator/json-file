const express = require('express');
const productRouter = require('./product');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Products API'
  });
});

app.use('/product', productRouter);
app.use('/products', productRouter);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
