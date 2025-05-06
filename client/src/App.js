import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Auth context
const AuthContext = React.createContext();

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          const res = await axios.get('/api/auth/user');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error loading user:', err.response?.data?.message || err.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Set auth token for axios
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      // Load user data
      setAuthToken(res.data.token);
      const userRes = await axios.get('/api/auth/user');
      setUser(userRes.data);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      
      // Set token in local storage
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      // Set user data
      setUser(res.data.user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        loading,
        authError,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Navbar Component
const Navbar = () => {
  const { isAuthenticated, user, logout } = React.useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1>Foodbook</h1>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/feed" className="nav-link">Recipe Feed</Link>
              </li>
              <li className="nav-item">
                <span className="user-greeting">Welcome, {user?.username}</span>
              </li>
              <li className="nav-item">
                <button onClick={logout} className="nav-button">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

// Home Component
const Home = () => {
  const { isAuthenticated } = React.useContext(AuthContext);
  
  return (
    <div className="home-page">
      {!isAuthenticated ? (
        <div className="welcome-teaser">
          <div className="welcome-content">
            <h1>Welcome to Foodbook</h1>
            <p className="tagline">Share your culinary creations with the world</p>
            
            <div className="welcome-description">
              <p>Foodbook is the social network for food enthusiasts. Share your favorite recipes, discover culinary masterpieces from around the world, and connect with a community of passionate food lovers.</p>
              
              <p>Whether you're a professional chef or a home cook, Foodbook provides the perfect platform to showcase your recipes and get inspired by others.</p>
            </div>
            
            <div className="welcome-actions">
              <Link to="/register" className="btn btn-primary welcome-btn">Sign Up</Link>
              <Link to="/login" className="btn btn-secondary welcome-btn">Log In</Link>
              <p className="welcome-note">Join our community to explore thousands of delicious recipes!</p>
            </div>
            
            <div className="features-preview">
              <div className="feature">
                <i className="feature-icon">🍽️</i>
                <h3>Share Recipes</h3>
                <p>Post your favorite dishes with step-by-step instructions</p>
              </div>
              <div className="feature">
                <i className="feature-icon">❤️</i>
                <h3>Like & Comment</h3>
                <p>Interact with recipes from cooks around the world</p>
              </div>
              <div className="feature">
                <i className="feature-icon">🌍</i>
                <h3>Discover Cuisines</h3>
                <p>Explore dishes from different countries and cultures</p>
              </div>
            </div>
          </div>
          
          <div className="welcome-image-container">
            <div className="welcome-image-grid">
              <img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352" alt="Cooking" className="welcome-image" />
              <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd" alt="Healthy food" className="welcome-image" />
              <img src="https://images.unsplash.com/photo-1473093226795-af9932fe5856" alt="Food preparation" className="welcome-image" />
              <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836" alt="Plated dish" className="welcome-image" />
            </div>
          </div>
        </div>
      ) : (
        <div className="feed-redirect">
          <h1>Welcome back to Foodbook!</h1>
          <p>Ready to explore some delicious recipes?</p>
          <Link to="/feed" className="btn btn-primary">Go to Recipe Feed</Link>
        </div>
      )}
    </div>
  );
};

// Login Component
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login, isAuthenticated } = React.useContext(AuthContext);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    const result = await login(formData);
    if (!result.success) {
      setError(result.error);
    }
  };

  // Redirect if logged in
  if (isAuthenticated) {
    return <Navigate to="/feed" />;
  }

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

// Register Component
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const { register, isAuthenticated } = React.useContext(AuthContext);

  const { username, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    
    const result = await register({
      username,
      email,
      password
    });
    
    if (!result.success) {
      setError(result.error);
    }
  };

  // Redirect if logged in
  if (isAuthenticated) {
    return <Navigate to="/feed" />;
  }

  return (
    <div className="form-container">
      <h2>Register</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            value={username}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password2">Confirm Password</label>
          <input
            type="password"
            name="password2"
            id="password2"
            value={password2}
            onChange={onChange}
            required
            minLength="6"
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

// Recipe Feed Component (Main Feed)
const RecipeFeed = () => {
  const { isAuthenticated, user } = React.useContext(AuthContext);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchCountry, setSearchCountry] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentSubmitId, setCommentSubmitId] = useState(null);
  
  // Fetch all recipes
  const fetchRecipes = async (country = '') => {
    setLoading(true);
    try {
      let url = '/api/recipes';
      if (country) {
        url = `/api/recipes/country/${country}`;
      }
      
      const res = await axios.get(url);
      setRecipes(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recipes:', err.message);
      setError('Failed to load recipes');
      setLoading(false);
    }
  };
  
  // Initial recipe load
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes(searchCountry);
  };
  
  // Clear search and show all recipes
  const clearSearch = () => {
    setSearchCountry('');
    fetchRecipes();
  };
  
  // Toggle expanded recipe view
  const toggleRecipeExpand = (recipeId) => {
    if (expandedRecipeId === recipeId) {
      setExpandedRecipeId(null);
    } else {
      setExpandedRecipeId(recipeId);
    }
  };
  
  // Handle like/unlike recipe
  const handleLike = async (recipeId, isLiked) => {
    if (!isAuthenticated) {
      return; // Don't attempt if not logged in
    }
    
    try {
      const endpoint = isLiked ? 'unlike' : 'like';
      const response = await axios.put(`/api/recipes/${endpoint}/${recipeId}`);
      
      // Update recipes state with the updated recipe data from the response
      setRecipes(recipes.map(recipe => {
        if (recipe._id === recipeId) {
          // Return the updated recipe from the API response
          return response.data;
        }
        return recipe;
      }));
    } catch (err) {
      console.error('Error liking/unliking recipe:', err.message);
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (recipeId) => {
    if (!isAuthenticated || !commentText.trim()) {
      return;
    }
    
    setCommentSubmitId(recipeId);
    
    try {
      const res = await axios.post(`/api/recipes/comment/${recipeId}`, {
        text: commentText
      });
      
      // Update recipes state with the entire updated recipe
      setRecipes(recipes.map(recipe => {
        if (recipe._id === recipeId) {
          // The API now returns the entire updated recipe
          return res.data;
        }
        return recipe;
      }));
      
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err.message);
    } finally {
      setCommentSubmitId(null);
    }
  };
  
  if (loading) return <div className="loader">Loading recipes...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>Recipe Feed</h1>
        <div className="feed-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              placeholder="Search by country..."
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
            {searchCountry && (
              <button type="button" onClick={clearSearch} className="clear-btn">
                Clear
              </button>
            )}
          </form>
          
          <Link to="/recipes/create" className="btn btn-primary create-btn">
            Add New Recipe
          </Link>
        </div>
      </div>
      
      {recipes.length === 0 ? (
        <p className="no-recipes">No recipes found. {!searchCountry && 'Be the first to add one!'}</p>
      ) : (
        <div className="recipe-list">
          {recipes.map(recipe => {
            const isExpanded = expandedRecipeId === recipe._id;
            const isLikedByUser = isAuthenticated && recipe.likes && 
              recipe.likes.some(like => like.user === user.id);
            
            return (
              <div key={recipe._id} className="recipe-card-full">
                <div className="recipe-card-header">
                  <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                  <div className="recipe-header-content">
                    <h2>{recipe.title}</h2>
                    <p className="recipe-country">Country: {recipe.country}</p>
                    <p className="recipe-author">By: {recipe.user.username}</p>
                    
                    <div className="recipe-actions">
                      <button 
                        onClick={() => toggleRecipeExpand(recipe._id)}
                        className="expand-btn"
                      >
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </button>
                      
                      {isAuthenticated && (
                        <button
                          onClick={() => handleLike(recipe._id, isLikedByUser)}
                          className={`like-btn ${isLikedByUser ? 'liked' : ''}`}
                        >
                          {isLikedByUser ? 'Unlike' : 'Like'} ({recipe.likes ? recipe.likes.length : 0})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="recipe-details">
                    <div className="recipe-ingredients">
                      <h3>Ingredients</h3>
                      <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="recipe-instructions">
                      <h3>Instructions</h3>
                      <p>{recipe.instructions}</p>
                    </div>
                    
                    <div className="recipe-comments">
                      <h3>Comments ({recipe.comments ? recipe.comments.length : 0})</h3>
                      
                      {isAuthenticated && (
                        <div className="comment-form">
                          <div className="comment-form-header">
                            <span className="comment-as">Commenting as <strong>{user.username}</strong></span>
                          </div>
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="What do you think about this recipe?"
                            className="comment-input"
                          />
                          <button
                            onClick={() => handleCommentSubmit(recipe._id)}
                            disabled={commentSubmitId === recipe._id || !commentText.trim()}
                            className="comment-btn"
                          >
                            {commentSubmitId === recipe._id ? 'Posting...' : 'Post Comment'}
                          </button>
                        </div>
                      )}
                      
                      <div className="comments-list">
                        {recipe.comments && recipe.comments.length > 0 ? (
                          recipe.comments.map((comment, index) => (
                            <div key={index} className="comment">
                              <div className="comment-header">
                                <p className="comment-user">{comment.user.username}</p>
                                <p className="comment-date">
                                  {new Date(comment.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <p className="comment-text">{comment.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="no-comments">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Recipe Detail Component
const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`/api/recipes/${id}`);
        setRecipe(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recipe:', err.message);
        setError('Failed to load recipe');
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id]);
  
  if (loading) return <div className="loader">Loading recipe...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!recipe) return <div className="error-message">Recipe not found</div>;
  
  return (
    <div className="recipe-detail">
      <div className="recipe-header">
        <img src={recipe.image} alt={recipe.title} className="recipe-detail-image" />
        <div className="recipe-info">
          <h1>{recipe.title}</h1>
          <p className="recipe-country">Country: {recipe.country}</p>
          <p className="recipe-author">By: {recipe.user.username}</p>
        </div>
      </div>
      
      <div className="recipe-body">
        <div className="ingredients-section">
          <h2>Ingredients</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="instructions-section">
          <h2>Instructions</h2>
          <div className="instructions-text">
            {recipe.instructions}
          </div>
        </div>
      </div>
      
      <Link to="/feed" className="btn btn-back">Back to Feed</Link>
    </div>
  );
};

// Create Recipe Component
const CreateRecipe = () => {
  const { isAuthenticated } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    ingredients: [''],
    instructions: '',
    image: '',
    country: ''
  });
  const [error, setError] = useState(null);
  
  const { title, ingredients, instructions, image, country } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onIngredientsChange = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setFormData({ ...formData, ingredients: updatedIngredients });
  };
  
  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...ingredients, ''] });
  };
  
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = ingredients.filter((_, i) => i !== index);
      setFormData({ ...formData, ingredients: updatedIngredients });
    }
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Remove empty ingredients
    const filteredIngredients = ingredients.filter(ing => ing.trim() !== '');
    
    if (filteredIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const recipeData = {
        ...formData,
        ingredients: filteredIngredients
      };
      
      await axios.post('/api/recipes', recipeData);
      navigate('/feed');
    } catch (err) {
      console.error('Error creating recipe:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create recipe');
    }
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="create-recipe-page">
      <h1>Create New Recipe</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={onSubmit} className="recipe-form">
        <div className="form-group">
          <label htmlFor="title">Recipe Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
            placeholder="Enter your recipe title"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={image}
            onChange={onChange}
            required
            placeholder="Enter image URL"
          />
          {image && (
            <img src={image} alt="Recipe preview" className="image-preview" />
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={country}
            onChange={onChange}
            required
            placeholder="Enter country of origin"
          />
        </div>
        
        <div className="form-group ingredients-group">
          <label>Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-input">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => onIngredientsChange(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                required
              />
              <button 
                type="button" 
                className="remove-btn"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredient} className="add-btn">
            Add Ingredient
          </button>
        </div>
        
        <div className="form-group">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={instructions}
            onChange={onChange}
            required
            placeholder="Provide step-by-step cooking instructions"
            rows="6"
          ></textarea>
        </div>
        
        <button type="submit" className="btn btn-primary submit-btn">
          Create Recipe
        </button>
        
        <Link to="/feed" className="btn btn-back">
          Cancel
        </Link>
      </form>
    </div>
  );
};

// Private Route Component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/feed" 
                element={
                  <PrivateRoute>
                    <RecipeFeed />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/recipes/create" 
                element={
                  <PrivateRoute>
                    <CreateRecipe />
                  </PrivateRoute>
                } 
              />
              <Route path="/recipes/:id" element={<RecipeDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
