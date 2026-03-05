const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const categoryController = require('../controllers/category.controller');

// GET /api/categories/:orgId
router.get('/:orgId', authenticate, categoryController.getCategories);

// POST /api/categories/:orgId
router.post('/:orgId', authenticate, categoryController.createCategory);

// DELETE /api/categories/:orgId/:categoryId
router.delete('/:orgId/:categoryId', authenticate, categoryController.deleteCategory);

module.exports = router;
