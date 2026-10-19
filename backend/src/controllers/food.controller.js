const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const commentModel = require("../models/comment.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    try {
        console.log("1. Create food request received");

        console.log("2. Food partner:", req.foodPartner?._id);
        console.log("3. Request body:", req.body);
        console.log("4. File received:", !!req.file);

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload a file"
            });
        }

        console.log("5. Starting ImageKit upload...");

        const fileUploadResult = await storageService.uploadFile(
            req.file.buffer,
            `${uuid()}`
        );

        console.log("6. ImageKit upload completed");
        console.log("ImageKit result:", fileUploadResult);

        console.log("7. Saving food to MongoDB...");

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id
        });

        console.log("8. Food saved successfully");

        return res.status(201).json({
            message: "Food created successfully",
            food: foodItem
        });

    } catch (error) {
        console.error("CREATE FOOD ERROR:", error);

        return res.status(500).json({
            message: "Failed to create food",
            error: error.message
        });
    }
}

async function getFoodItems(req, res) {
    const foodItems = await foodModel.find({}).populate('foodPartner', 'name').lean()
    const [likes, saves, commentCounts] = await Promise.all([
        likeModel.find({ user: req.user._id }).select('food').lean(),
        saveModel.find({ user: req.user._id }).select('food').lean(),
        commentModel.aggregate([{ $group: { _id: '$food', count: { $sum: 1 } } }])
    ])
    const liked = new Set(likes.map(item => String(item.food)))
    const saved = new Set(saves.map(item => String(item.food)))
    const commentsByFood = new Map(commentCounts.map(item => [String(item._id), item.count]))
    foodItems.forEach(item => { item.liked = liked.has(String(item._id)); item.saved = saved.has(String(item._id)); item.commentsCount = commentsByFood.get(String(item._id)) || 0 })
    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems
    })
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully", like: false
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like: true
    })

}

async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        })

        return res.status(200).json({
            message: "Food unsaved successfully", save: false
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save: true
    })

}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate({ path: 'food', populate: { path: 'foodPartner', select: 'name' } });
    const foodIds = savedFoods.map(item => item.food?._id).filter(Boolean)
    const [likes, commentCounts] = await Promise.all([
        likeModel.find({ user: user._id, food: { $in: foodIds } }).select('food').lean(),
        commentModel.aggregate([{ $match: { food: { $in: foodIds } } }, { $group: { _id: '$food', count: { $sum: 1 } } }])
    ])
    const liked = new Set(likes.map(item => String(item.food)))
    const counts = new Map(commentCounts.map(item => [String(item._id), item.count]))
    const savedFoodsWithState = savedFoods.filter(item => item.food).map(item => {
        const saved = item.toObject()
        saved.food.liked = liked.has(String(saved.food._id))
        saved.food.saved = true
        saved.food.commentsCount = counts.get(String(saved.food._id)) || 0
        return saved
    })

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods: savedFoodsWithState
    });

}


async function getComments(req, res) {
    const comments = await commentModel.find({ food: req.params.foodId }).populate("user", "fullName").sort({ createdAt: -1 }).lean();
    res.json({ comments });
}

async function addComment(req, res) {
    const text = String(req.body.text || "").trim();
    if (!text || text.length > 500) return res.status(400).json({ message: "Comment must be between 1 and 500 characters" });
    const food = await foodModel.findById(req.params.foodId);
    if (!food) return res.status(404).json({ message: "Food video not found" });
    const comment = await commentModel.create({ food: food._id, user: req.user._id, text });
    res.status(201).json({ comment: await comment.populate("user", "fullName") });
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood,
    getComments,
    addComment
}
