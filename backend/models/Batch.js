import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    batchId: {
        type: String,
        unique: true,
        required: true
    },
    productName: {
        type: String,
        required: [true, 'Please add a product name']
    },
    category: {
        type: String,
        enum: ['Fruits', 'Vegetables'],
        required: [true, 'Please add a category']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add quantity']
    },
    harvestTimestamp: {
        type: Date,
        required: [true, 'Please add harvest timestamp']
    },
    shelfLife: {
        type: Number, // in hours
        required: [true, 'Please add shelf life duration']
    },
    farmer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: [
            'Ready for Supply Chain',
            'Assigned (Farm to Warehouse)',
            'Assigned (Warehouse to Retailer)',
            'Picked Up',
            'In Transit',
            'Delivered to Warehouse',
            'Delivered to Retailer'
        ],
        default: 'Ready for Supply Chain'
    },
    transporter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    warehouseManager: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    retailer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    timeline: [
        {
            status: String,
            timestamp: {
                type: Date,
                default: Date.now
            },
            location: String,
            responsibleRole: String,
            responsibleUser: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            note: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    trustScore: {
        type: Number,
        default: 100
    },
    trustScoreLog: [
        {
            reason: String,
            deduction: Number
        }
    ]
});

export default mongoose.model('Batch', batchSchema);
