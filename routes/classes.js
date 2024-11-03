const express = require('express');
const router = express.Router();

// GET route to show the classes list
router.get('/', (req, res) => {
    // Fetch classes data
    const classes = [/* ... */]; // Replace with actual data fetching
    res.render('classes', { title: 'Classes', classes: classes });
});



module.exports = router;

