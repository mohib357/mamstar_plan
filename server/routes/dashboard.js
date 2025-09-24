const express = require('express');
const router = express.Router();

// Example dashboard route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Dashboard API!' });
});

module.exports = router;
