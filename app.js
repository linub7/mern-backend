const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt');
const cors = require('cors');

const app = express();
require('dotenv/config');

// Enable CORS
app.use(cors());
app.options('*', cors());

const api = process.env.API_URL;

// SET Morgan
app.use(morgan('tiny'));

// SET express.json() middleware in order to use req.body
app.use(express.json());

// Custom middlware
app.use(authJwt());
app.use((err, req, res, next) => {
  if (err.message.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'The User is not authorized' });
  }

  if (err.message.name === 'ValidationError') {
    return res.status(401).json({ message: err });
  }

  return res.status(500).json({ message: err });
  next();
});
app.use('/public/uploads', express.static(__dirname + 'public/uploads'));

// IMPORT & SET Routes
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');

app.use(`${api}/products`, productsRoutes);
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/users`, usersRoutes);

// CONNECT MONGO DB
mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connect Successfully');
  })
  .catch((err) => console.log(err));

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
