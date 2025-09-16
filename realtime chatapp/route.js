const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// Simple register/login - for demo only (no validation)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ message: 'User exists' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ username, passwordHash: hash });
        res.json({ id: user._id, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid creds' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(400).json({ message: 'Invalid creds' });
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, id: user._id, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
