const express = require("express");
const router = express.Router();

const controller = require("../controllers/categoryController");

router.post("/categories", controller.createCategory);
router.get("/categories", controller.getCategories);
router.put("/categories/:id", controller.updateCategory);
router.delete("/categories/:id", controller.deleteCategory);

module.exports = router;