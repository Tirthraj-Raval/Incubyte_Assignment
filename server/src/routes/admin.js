const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');
const router = express.Router();

// Get dashboard stats
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [
      { count: totalOrders },
      { count: totalProducts },
      { count: totalCustomers },
      { data: ordersData }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact' }),
      supabase.from('products').select('*', { count: 'exact' }),
      supabase.from('user_profiles').select('*', { count: 'exact' }),
      supabase.from('orders').select('total_amount, status')
    ]);

    const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const pendingOrders = ordersData.filter(order => order.status === 'pending').length;

    res.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      pendingOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders with pagination
router.get('/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products(*))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select('*, order_items(*, products(*))')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all products with pagination
router.get('/products', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: products, error, count } = await supabase
      .from('products')
      .select('*, categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all customers with pagination
router.get('/customers', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: customers, error, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;