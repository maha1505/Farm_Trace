import Batch from '../models/Batch.js';
import ShelfLife from '../models/ShelfLife.js';
import User from '../models/User.js';

// @desc    Register new batch
// @route   POST /api/batches
// @access  Private (Farmer)
export const registerBatch = async (req, res) => {
    try {
        const { productName, category, quantity, harvestTimestamp, shelfLife } = req.body;

        // Generate Unique Product ID (FT-YYYYMM-XXXXXX)
        const date = new Date();
        const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const batchId = `FT-${yearMonth}-${randomStr}`;

        const batch = await Batch.create({
            batchId,
            productName,
            category,
            quantity,
            harvestTimestamp,
            shelfLife,
            farmer: req.user.id,
            trustScore: 100,
            trustScoreLog: [],
            timeline: [
                {
                    status: 'Ready for Supply Chain',
                    location: 'Farm',
                    responsibleRole: 'Farmer',
                    responsibleUser: req.user.id,
                    note: 'Product harvested and registered'
                }
            ]
        });

        res.status(201).json({ success: true, data: batch });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all batches (Role based visibility)
// @route   GET /api/batches
// @access  Private
export const getBatches = async (req, res) => {
    try {
        let query;

        if (req.user.role === 'Farmer') {
            query = Batch.find({ farmer: req.user.id });
        } else if (req.user.role === 'Warehouse Manager') {
            query = Batch.find({
                $or: [
                    { status: 'Ready for Supply Chain' },
                    { warehouseManager: req.user.id },
                    // Also include batches in transition to warehouse in case warehouseManager wasn't set
                    { status: { $in: ['Assigned (Farm to Warehouse)', 'Picked Up', 'In Transit', 'Delivered to Warehouse', 'Assigned (Warehouse to Retailer)'] } }
                ]
            });
        } else if (req.user.role === 'Transporter') {
            query = Batch.find({ transporter: req.user.id });
        } else if (req.user.role === 'Retailer') {
            query = Batch.find({
                $or: [
                    { status: 'Delivered to Warehouse' },
                    { status: 'Delivered to Retailer' },
                    { retailer: req.user.id }
                ]
            });
        }

        const batches = await query.populate('farmer', 'name');

        // Calculate Freshness & Trust Score for each batch
        const batchesWithScores = batches.map(batch => {
            const remainingShelfLife = calculateRemainingShelfLife(batch);
            const priority = calculatePriority(remainingShelfLife, batch.shelfLife);
            const { score: trustScore, log: trustScoreLog } = calculateTrustScore(batch, remainingShelfLife);

            return {
                ...batch._doc,
                remainingShelfLife,
                priority,
                trustScore,
                trustScoreLog
            };
        });

        res.status(200).json({ success: true, data: batchesWithScores });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Helper: Calculate remaining shelf life in hours
const calculateRemainingShelfLife = (batch) => {
    const now = new Date();
    const harvestTime = new Date(batch.harvestTimestamp);
    const hoursElapsed = (now - harvestTime) / (1000 * 60 * 60);
    return Math.max(0, batch.shelfLife - hoursElapsed);
};

// Helper: Calculate priority based on remaining percent
const calculatePriority = (remaining, total) => {
    const percent = (remaining / total) * 100;
    if (percent < 20) return 'High';
    if (percent < 50) return 'Medium';
    return 'Low';
};

// Helper: Calculate Trust Score (0–100) based on supply chain handling
const calculateTrustScore = (batch, remainingShelfLife) => {
    let score = 100;
    const log = [];

    // Rule 1: High spoilage risk — freshness below 20% of shelf life
    const freshnessPercent = batch.shelfLife > 0 ? (remainingShelfLife / batch.shelfLife) * 100 : 0;
    if (freshnessPercent < 20) {
        score -= 20;
        log.push({ reason: 'High spoilage risk (freshness below 20%)', deduction: 20 });
    }

    // Rule 2: Product exceeded safe warehouse storage duration
    const warehouseEntry = batch.timeline?.find(e => e.status === 'Delivered to Warehouse');
    if (warehouseEntry && remainingShelfLife <= 0) {
        score -= 15;
        log.push({ reason: 'Exceeded safe warehouse storage duration', deduction: 15 });
    }

    // Rule 3: Transporter failed to provide a meaningful location update
    const transporterEvents = (batch.timeline || []).filter(e =>
        e.responsibleRole === 'Transporter' &&
        (e.status === 'Picked Up' || e.status === 'In Transit')
    );
    const missingLocation = transporterEvents.some(e =>
        !e.location || e.location.trim() === '' ||
        e.location.toLowerCase() === 'transporter update'
    );
    if (missingLocation) {
        score -= 10;
        log.push({ reason: 'Transporter did not provide a proper location update', deduction: 10 });
    }

    // Rule 4: Pickup from farmer delayed beyond 24 hours of batch registration
    const pickupEvent = batch.timeline?.find(e => e.status === 'Assigned (Farm to Warehouse)');
    if (!pickupEvent) {
        const hoursSinceCreation = (Date.now() - new Date(batch.createdAt)) / (1000 * 60 * 60);
        if (hoursSinceCreation > 24) {
            score -= 10;
            log.push({ reason: 'Pickup from farmer delayed beyond 24 hours', deduction: 10 });
        }
    }

    return { score: Math.max(0, score), log };
};

// @desc    Update batch status / Timeline
// @route   PUT /api/batches/:id/status
// @access  Private
export const updateBatchStatus = async (req, res) => {
    try {
        const { status, location, note, transporterId, warehouseManagerId } = req.body;
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }

        batch.status = status;
        if (transporterId) batch.transporter = transporterId;
        if (warehouseManagerId) batch.warehouseManager = warehouseManagerId;

        batch.timeline.push({
            status,
            location,
            responsibleRole: req.user.role,
            responsibleUser: req.user.id,
            note
        });

        await batch.save();

        res.status(200).json({ success: true, data: batch });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
