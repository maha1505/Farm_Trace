import mongoose from 'mongoose';

const shelfLifeSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, 'Please add a product name'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Fruits', 'Vegetables'],
        required: [true, 'Please add a category']
    },
    duration: {
        type: Number, // in hours
        required: [true, 'Please add shelf life duration in hours']
    },
    addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

export default mongoose.model('ShelfLife', shelfLifeSchema);
