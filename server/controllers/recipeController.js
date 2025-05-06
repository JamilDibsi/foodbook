const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Get all recipes
exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .sort({ createdAt: -1 })
      .populate('user', ['username'])
      .populate('likes.user', ['username'])
      .populate('comments.user', ['username']);
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('user', ['username'])
      .populate('likes.user', ['username'])
      .populate('comments.user', ['username']);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Create recipe
exports.createRecipe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, ingredients, instructions, image, country } = req.body;

  try {
    // Create new recipe
    const newRecipe = new Recipe({
      title,
      ingredients,
      instructions,
      image,
      country,
      user: req.user.id
    });

    const recipe = await newRecipe.save();

    res.json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update recipe
exports.updateRecipe = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, ingredients, instructions, image, country } = req.body;

  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if recipe belongs to user
    if (recipe.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this recipe' });
    }

    // Update fields
    recipe.title = title;
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.image = image;
    recipe.country = country;

    await recipe.save();

    res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if recipe belongs to user
    if (recipe.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this recipe' });
    }

    await recipe.remove();

    res.json({ message: 'Recipe removed' });
  } catch (error) {
    console.error('Error deleting recipe:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recipes by user
exports.getUserRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.params.userId })
      .sort({ date: -1 })
      .populate('user', ['username']);
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like a recipe
exports.likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe has already been liked by this user
    if (recipe.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Recipe already liked' });
    }

    // Add the user to likes array
    recipe.likes.unshift({ user: req.user.id });

    await recipe.save();
    
    // Get the fully populated recipe to return
    const populatedRecipe = await Recipe.findById(req.params.id)
      .populate('user', ['username'])
      .populate('likes.user', ['username'])
      .populate('comments.user', ['username']);

    res.json(populatedRecipe);
  } catch (error) {
    console.error('Error liking recipe:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Unlike a recipe
exports.unlikeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Check if the recipe has not yet been liked by this user
    if (!recipe.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Recipe has not yet been liked' });
    }

    // Remove the like
    recipe.likes = recipe.likes.filter(like => like.user.toString() !== req.user.id);

    await recipe.save();
    
    // Get the fully populated recipe to return
    const populatedRecipe = await Recipe.findById(req.params.id)
      .populate('user', ['username'])
      .populate('likes.user', ['username'])
      .populate('comments.user', ['username']);

    res.json(populatedRecipe);
  } catch (error) {
    console.error('Error unliking recipe:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Add comment to recipe
exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const newComment = {
      text: req.body.text,
      user: req.user.id
    };

    // Add to comments array
    recipe.comments.unshift(newComment);

    await recipe.save();

    // Return fully populated recipe with user info populated for all references
    const populatedRecipe = await Recipe.findById(req.params.id)
      .populate('user', ['username'])
      .populate('likes.user', ['username'])
      .populate('comments.user', ['username']);

    res.json(populatedRecipe);
  } catch (error) {
    console.error('Error adding comment:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recipes by country
exports.getRecipesByCountry = async (req, res) => {
  try {
    const country = req.params.country;
    
    // Case-insensitive search for country
    const recipes = await Recipe.find({ 
      country: { $regex: new RegExp(country, 'i') } 
    })
      .sort({ createdAt: -1 })
      .populate('user', ['username']);
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes by country:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
