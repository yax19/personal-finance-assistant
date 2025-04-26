const express = require('express');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id });
    res.render('dashboard', { transactions });
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

router.get('/add', protect, (req, res) => {
  res.render('addTransaction');
});

router.post('/add', protect, async (req, res) => {
  const { type, amount, category, description } = req.body;
  try {
    const transaction = new Transaction({ user: req.user._id, type, amount, category, description });
    await transaction.save();
    res.redirect('/dashboard');
  } catch (error) {
    res.status(400).json({ message: 'Transaction creation failed', error: error.message });
  }
});

router.get('/edit/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    res.render('editTransaction', { transaction });
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch transaction', error: error.message });
  }
});

router.post('/edit/:id', protect, async (req, res) => {
  const { type, amount, category, description } = req.body;
  try {
    await Transaction.findByIdAndUpdate(req.params.id, { type, amount, category, description });
    res.redirect('/dashboard');
  } catch (error) {
    res.status(400).json({ message: 'Transaction update failed', error: error.message });
  }
});

router.get('/delete/:id', protect, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (error) {
    res.status(400).json({ message: 'Transaction deletion failed', error: error.message });
  }
});

module.exports = router;
