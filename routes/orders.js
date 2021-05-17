const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

//  @desc       Get All Orders
//  @route      GET /api/v1/orders
router.get('/', async (req, res, next) => {
  try {
    const orderList = await Order.find()
      .populate('user', 'name')
      .sort('-dateOrdered');
    if (!orderList) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      success: true,
      data: {
        orderList,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

//  @desc       Get single Order
//  @route      GET /api/v1/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name')
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      });
    if (!order) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

//  @desc       Update Order
//  @route      PUT /api/v1/orders/:id
router.put('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

//  @desc       Delete Order
//  @route      DELETE /api/v1/orders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const order = await Order.findByIdAndRemove(req.params.id);
    await order.orderItems.map(async (orderItem) => {
      await OrderItem.findByIdAndRemove(orderItem);
    });
    if (!order) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      success: true,
      message: 'the Order deleted',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

//  @desc   create an order
//  @route  POST /api/v1/orders
router.post('/', async (req, res, next) => {
  try {
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
          quantity: orderItem.quantity,
          product: orderItem.product,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );
    const orderItemsIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate(
          'product',
          'price'
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    console.log(totalPrice);
    let order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });
    order = await order.save();
    if (!order) {
      return res.status(404).send('The Order cannot be created');
    }
    res.status(201).send(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

//  @desc   get total sales
//  @desc   GET /api/v1/orders/get/totalSales
router.get('/get/totalSales', async (req, res, next) => {
  try {
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null, // if we remove this line mongoose crashed, => a group specification must include an _id
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);

    if (!totalSales) {
      return res.status(400).send('The Order Sales Can not be generated');
    }

    res.status(200).send({ totalSales: totalSales.pop().totalSales });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

//  @desc   get
//  @route  GET /api/v1/oredrs/get/count
router.get('/get/count', async (req, res, next) => {
  try {
    const orderCount = await Order.countDocuments((count) => count);
    if (!orderCount) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({ success: true, orderCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

//  @desc       Get user order list
//  @route      GET /api/v1/get/userorders/:userId
router.get('/get/usersorders/:userId', async (req, res, next) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userId })
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      })
      .sort('-dateOrdered');
    if (!userOrderList) {
      res.status(500).json({ success: false });
    }
    res.status(200).json({
      success: true,
      data: {
        userOrderList,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
