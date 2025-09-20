const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../config/supabase');
const router = express.Router();
const {isAdmin} = require("../middleware/auth");

// Get user orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*, products (*))
      `)
      .eq('user_id', req.user.user_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*, products (*))
      `)
      .eq('id', id)
      .eq('user_id', req.user.user_id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      items
    } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single();

      if (productError) {
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }

      totalAmount += product.price * item.quantity;
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: req.user.user_id,
          order_number: orderNumber,
          total_amount: totalAmount,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address
        }
      ])
      .select()
      .single();

    if (orderError) {
      return res.status(400).json({ error: orderError.message });
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: 0 // Will be updated in the next step
    }));

    const { data: createdOrderItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select(`
        *,
        products (*)
      `);

    if (itemsError) {
      // Delete the order if items creation fails
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(400).json({ error: itemsError.message });
    }

    // Update prices in order items
    for (const item of createdOrderItems) {
      const { data: product } = await supabase
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single();

      await supabase
        .from('order_items')
        .update({ price: product.price })
        .eq('id', item.id);
    }

    // Clear user's cart
    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.user_id);

    // Get the complete order with updated prices
    const { data: completeOrder, error: completeError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*, products (*))
      `)
      .eq('id', order.id)
      .single();

    if (completeError) {
      return res.status(400).json({ error: completeError.message });
    }

    res.status(201).json(completeOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', authenticateToken, isAdmin, async (req, res) => {
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
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;