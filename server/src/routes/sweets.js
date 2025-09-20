const express = require('express');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const supabase = require('../config/supabase');
const router = express.Router();

// Get all sweets
router.get('/', async (req, res) => {
  try {
    const { data: sweets, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search sweets
router.get('/search', async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('is_available', true);

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    if (category) {
      query = query.eq('category_id', category);
    }

    if (minPrice) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice) {
      query = query.lte('price', maxPrice);
    }

    const { data: sweets, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(sweets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single sweet
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: sweet, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json(sweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new sweet (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image_url,
      category_id,
      stock_quantity,
      weight,
      ingredients,
      allergens,
      slug
    } = req.body;

    const { data: sweet, error } = await supabase
      .from('products')
      .insert([
        {
          name,
          description,
          price,
          image_url,
          category_id,
          stock_quantity,
          weight,
          ingredients,
          allergens,
          slug
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(sweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sweet (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image_url,
      category_id,
      stock_quantity,
      is_available,
      weight,
      ingredients,
      allergens,
      slug
    } = req.body;

    const { data: sweet, error } = await supabase
      .from('products')
      .update({
        name,
        description,
        price,
        image_url,
        category_id,
        stock_quantity,
        is_available,
        weight,
        ingredients,
        allergens,
        slug,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(sweet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sweet (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Purchase sweet (decrease quantity)
router.post('/:id/purchase', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Update stock
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ 
        stock_quantity: product.stock_quantity - quantity,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restock sweet (Admin only)
router.post('/:id/restock', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Get current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update stock
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ 
        stock_quantity: product.stock_quantity + quantity,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;