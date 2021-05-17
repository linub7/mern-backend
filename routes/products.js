const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const multer = require('multer');

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('Invalid image type');
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

//  @desc   Get All Products
//  @route  GET /api/v1/products
router.get(`/`, async (req, res, next) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(',') };
    }
    const products = await Product.find(filter).populate('category');
    if (!products) {
      return res.sendStatus(500);
    }
    res.status(200).json({
      success: true,
      data: {
        products,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      error: err,
    });
  }
});

//  @desc   Get Single Product
//  @route  GET /api/v1/products/:id
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(500).json({
        success: false,
        message: `The Product given by ID (${req.params.id}) was not Found`,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      error: err,
    });
  }
});

//  @desc   Post a product
//  @route  POST /api/v1/products
router.post(`/`, uploadOptions.single('image'), async (req, res, next) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Category',
      });
    }
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No File',
      });
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}/${fileName}`, // http://localhost:3000/public/uploads/image-2323232.jpeg
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });
    await product.save();
    if (!product) {
      return res.status(500).json({
        success: false,
        message: 'The Product can not be created',
      });
    }
    res.status(201).json({
      message: 'success',
      data: {
        product,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'fail',
      err: err,
    });
  }
});

//  @desc   Update Single Product
//  @route  PUT /api/v1/products/:id
router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Product ID' });
    }
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Category',
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!product) {
      return res.status(500).json({
        success: false,
        message: `The Product with the given ID (${req.params.id}) was not Found`,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        product,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: 'Something went wrong',
      error: err,
    });
  }
});

//  @desc   Delete Produc
//  @route  DELETE /api/v1/products/:id
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid Product ID' });
    }
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: `The Product given by id (${req.params.id}) was not Found`,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Product has been deleted',
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: 'Something went wrong',
      error: err,
    });
  }
});

//  @desc   Count residual Stock
//  @route  GET /api/v1/products/get/count
router.get('/get/count', async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments((count) => count);
    if (!productCount) {
      return res.status(500).json({ success: false });
    }
    res.status(200).json({ success: true, count: productCount });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: 'Something went wrong',
      error: err,
    });
  }
});

//  @desc   Get only isFeatured Products
//  @route  GET /api/v1/products/get/featured
router.get('/get/featured/:count', async (req, res, next) => {
  try {
    let count = req.params.count ? req.params.count : 0;
    count = parseInt(count);
    const productFeatured = await Product.find({ isFeatured: true }).limit(
      count
    );
    res.status(200).json({ success: true, data: { productFeatured } });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: 'Something went wrong',
      error: err,
    });
  }
});

//  @desc   update images for gallery
//  @route  PUT /api/v1/products/gallery-images/:id
router.put(
  '/gallery-images/:id',
  uploadOptions.array('images', 10),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid Product ID' });
      }
      const files = req.files;
      let imagesPaths = [];
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads`;
      if (files) {
        files.map((file) => {
          imagesPaths.push(`${basePath}/${file.fileName}`);
        });
      }
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
          images: imagesPaths,
        },
        {
          new: true,
          runValidators: true,
        }
      );
      if (!product) {
        return res.status(500).json({
          success: false,
          message: `The Product with the given ID (${req.params.id}) was not Found`,
        });
      }
      res.status(200).json({
        success: true,
        data: {
          product,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        success: false,
        message: 'Something went wrong',
        error: err,
      });
    }
  }
);

module.exports = router;
