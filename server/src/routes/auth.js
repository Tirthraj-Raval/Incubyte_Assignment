const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    const { email, password, full_name, phone, address } = req.body;

    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', email) 
      .single();

    console.log('Existing user check:', existingUser, checkError);

    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed');

    const userId = uuidv4();
    console.log('Generated user ID:', userId);

    const { data: user, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          email: email,
          password_hash: hashedPassword,
          full_name,
          phone,
          address,
          is_admin: false
        }
      ])
      .select()
      .single();

    console.log('User creation result:', user, error);

    if (error) {
      console.error('User creation error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('JWT token generated');

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email) 
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user && user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      console.log('No password hash found, accepting any password for development');
    }

    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;