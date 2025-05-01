const express = require('express');
const router = express.Router({ mergeParams: true });
const Transaction = require('../models/Transaction');

// Get all transactions for a user
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.params.userId });
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalIncome - totalExpenses;
    const totalSavings = totalBalance; // Assuming savings is the remaining balance
    res.render('dashboard', { transactions, totalBalance, totalIncome, totalExpenses, totalSavings });
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

// Add a new transaction
router.get('/add', (req, res) => {
  res.render('addTransaction');
});

router.post('/add', async (req, res) => {
  const { type, amount, category, description } = req.body;
  try {
    const transaction = new Transaction({ user: req.params.userId, type, amount, category, description });
    await transaction.save();
    res.redirect(`/users/${req.params.userId}/transactions`);
  } catch (error) {
    res.status(400).json({ message: 'Transaction creation failed', error: error.message });
  }
});

// Edit a transaction
router.get('/edit/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    res.render('editTransaction', { transaction });
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch transaction', error: error.message });
  }
});

router.post('/edit/:id', async (req, res) => {
  const { type, amount, category, description } = req.body;
  try {
    await Transaction.findByIdAndUpdate(req.params.id, { type, amount, category, description });
    res.redirect(`/users/${req.params.userId}/transactions`);
  } catch (error) {
    res.status(400).json({ message: 'Transaction update failed', error: error.message });
  }
});

// Delete a transaction
router.post('/delete/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.redirect(`/users/${req.params.userId}/transactions`);
  } catch (error) {
    res.status(400).json({ message: 'Transaction deletion failed', error: error.message });
  }
});

module.exports = router;
