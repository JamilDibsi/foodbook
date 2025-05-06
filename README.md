# Foodbook

A social platform for food lovers.

## Project Structure

```
foodbook/
├── client/               # React frontend
│   ├── public/           # Static files
│   └── src/              # React source code
└── server/               # Node.js backend
    ├── controllers/      # Route controllers
    ├── models/           # Mongoose models
    └── routes/           # API routes
```

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the server directory with your MongoDB connection URI:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React development server:
   ```
   npm start
   ```

## Technologies Used

- **Frontend**: React, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Other**: Axios for API requests
