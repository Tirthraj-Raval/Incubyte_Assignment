const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../config/supabase');
const router = express.Router();

// Get user cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', req.user.user_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is already in cart
    const { data: existingItem, error: existingError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', req.user.user_id)
      .eq('product_id', product_id)
      .single();

    let result;
    if (existingItem) {
      // Update quantity if already in cart
      const { data: updatedItem, error: updateError } = await supabase
        .from('cart_items')
        .update({ 
          quantity: existingItem.quantity + quantity,
          updated_at: new Date()
        })
        .eq('id', existingItem.id)
        .select(`
          *,
          products (*)
        `)
        .single();

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }
      result = updatedItem;
    } else {
      // Add new item to cart
      const { data: newItem, error: insertError } = await supabase
        .from('cart_items')
        .insert([
          {
            user_id: req.user.user_id,
            product_id,
            quantity
          }
        ])
        .select(`
          *,
          products (*)
        `)
        .single();

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }
      result = newItem;
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const { data: cartItem, error } = await supabase
      .from('cart_items')
      .update({ 
        quantity,
        updated_at: new Date()
      })
      .eq('id', id)
      .eq('user_id', req.user.user_id)
      .select(`
        *,
        products (*)
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.user_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.user_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;