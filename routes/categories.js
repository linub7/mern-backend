const Category = require('../models/Category');
const express = require('express');
const router = express.Router();

//  @desc   Get All Categories
//  @route  GET /api/v1/categories
router.get('/', async (req, res, next) => {
  try {
    const categoryList = await Category.find();

    if (!categoryList) {
      return res.status(500).json({ success: 'false' });
    }

    res.status(200).json({
      success: true,
      data: {
        categoryList,
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

//  @desc   Get Single Category
//  @route  GET /api/v1/categories/:id
router.get('/:id', async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(500).json({
        success: false,
        message: `The Category with the given ID (${req.params.id}) was not Found`,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        category,
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

//  @desc   create a Category
//  @route  POST /api/v1/categories
router.post('/', async (req, res, next) => {
  try {
    const category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    await category.save();
    if (!category) {
      return res.status(404).send('The Categry cannot be created');
    }
    res.status(201).json({
      success: true,
      data: {
        category,
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

//  @desc   Update Single Category
//  @route  PUT /api/v1/categories/:id
router.put('/:id', async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(500).json({
        success: false,
        message: `The Category with the given ID (${req.params.id}) was not Found`,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        category,
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

//  @desc   delete a single Category
//  @route  DELETE /api/v1/categories/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await Category.findByIdAndRemove(req.params.id);
    res.status(200).json({
      success: true,
      message: 'category has been deleted',
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

module.exports = router;
