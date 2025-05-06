const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// Import controllers
const userController = require('../controllers/userController');
const recipeController = require('../controllers/recipeController');

// Auth routes
// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/auth/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  userController.register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/auth/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  userController.login
);

// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/auth/user', auth, userController.getCurrentUser);

// User routes
// @route   GET /api/users
// @desc    Get all users
// @access  Public
router.get('/users', userController.getUsers);

// Recipe routes
// @route   GET /api/recipes
// @desc    Get all recipes
// @access  Public
router.get('/recipes', recipeController.getRecipes);

// @route   GET /api/recipes/user/:userId
// @desc    Get recipes by user
// @access  Public
router.get('/recipes/user/:userId', recipeController.getUserRecipes);

// @route   GET /api/recipes/:id
// @desc    Get recipe by ID
// @access  Public
router.get('/recipes/:id', recipeController.getRecipeById);

// @route   POST /api/recipes
// @desc    Create a recipe
// @access  Private
router.post(
  '/recipes',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('ingredients', 'At least one ingredient is required').isArray({ min: 1 }),
    check('instructions', 'Instructions are required').not().isEmpty(),
    check('image', 'Image URL is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty()
  ],
  recipeController.createRecipe
);

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private
router.put(
  '/recipes/:id',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('ingredients', 'At least one ingredient is required').isArray({ min: 1 }),
    check('instructions', 'Instructions are required').not().isEmpty(),
    check('image', 'Image URL is required').not().isEmpty(),
    check('country', 'Country is required').not().isEmpty()
  ],
  recipeController.updateRecipe
);

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/recipes/:id', auth, recipeController.deleteRecipe);

// @route   PUT /api/recipes/like/:id
// @desc    Like a recipe
// @access  Private
router.put('/recipes/like/:id', auth, recipeController.likeRecipe);

// @route   PUT /api/recipes/unlike/:id
// @desc    Unlike a recipe
// @access  Private
router.put('/recipes/unlike/:id', auth, recipeController.unlikeRecipe);

// @route   POST /api/recipes/comment/:id
// @desc    Add comment to a recipe
// @access  Private
router.post(
  '/recipes/comment/:id',
  [
    auth,
    check('text', 'Text is required').not().isEmpty()
  ],
  recipeController.addComment
);

// @route   GET /api/recipes/country/:country
// @desc    Get recipes by country
// @access  Public
router.get('/recipes/country/:country', recipeController.getRecipesByCountry);

module.exports = router;
