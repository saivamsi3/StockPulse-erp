const express = require('express');
const cors = require('cors');
const { corsOrigins } = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const productRoutes = require('./routes/product.routes');
const challanRoutes = require('./routes/challan.routes');
const userRoutes = require('./routes/user.routes');
const { requireAuth } = require('./middleware/auth');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/users', userRoutes);

app.use('/api', notFoundHandler);
app.use(errorHandler);

module.exports = app;
