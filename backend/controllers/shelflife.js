import ShelfLife from '../models/ShelfLife.js';

// @desc    Get all shelf life records
// @route   GET /api/shelflife
// @access  Private
export const getShelfLives = async (req, res) => {
    try {
        const shelfLives = await ShelfLife.find();
        res.status(200).json({ success: true, data: shelfLives });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add shelf life record
// @route   POST /api/shelflife
// @access  Private (Farmer)
export const addShelfLife = async (req, res) => {
    try {
        const { productName, category, duration } = req.body;
        const shelfLife = await ShelfLife.create({
            productName,
            category,
            duration,
            addedBy: req.user.id
        });
        res.status(201).json({ success: true, data: shelfLife });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
