import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carRental';
const mongodb = new MongoClient(MONGO_URI);

let db;
mongodb.connect()
  .then(() => {
    db = mongodb.db('carRental');
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('MongoDB connection error:', err));

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware for verifying JWT tokens
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Car Rental API!');
});

// /register: Registers a new user
app.post('/register', async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { fullName, email, username, password: hashedPassword };
    await usersCollection.insertOne(newUser);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// /login: Authenticates a user and returns a JWT token
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Sign a JWT token (expires in 1 hour)
    const token = jwt.sign({ id: user._id, username: user.username }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// /my-profile: Returns the current user's profile (protected route)
app.get('/my-profile', authenticateToken, async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { fullName, email, username } = user;
    res.json({ fullName, email, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// /rental-cars: Returns a list of rental cars, with optional filters
app.get('/rental-cars', async (req, res) => {
  try {
    const { year, color, steering_type, number_of_seats } = req.query;
    const query = {};
    if (year) query.year = parseInt(year);
    if (color) query.color = color;
    if (steering_type) query.steering_type = steering_type;
    if (number_of_seats) query.number_of_seats = parseInt(number_of_seats);

    const carsCollection = db.collection('cars');
    const cars = await carsCollection.find(query).sort({ price_per_day: 1 }).toArray();
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// /cars: Adds a new car to the database
app.post('/cars', async (req, res) => {
  try {
    const { name, price_per_day, year, color, steering_type, number_of_seats } = req.body;
    if (!name || !price_per_day || !year || !color || !steering_type || !number_of_seats) {
      return res.status(400).json({ error: 'All car fields are required' });
    }
    
    const newCar = {
      name,
      price_per_day: parseFloat(price_per_day),
      year: parseInt(year),
      color,
      steering_type,
      number_of_seats: parseInt(number_of_seats)
    };

    const carsCollection = db.collection('cars');
    const result = await carsCollection.insertOne(newCar);
    res.status(201).json({ message: 'Car added successfully', carId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
