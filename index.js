import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose"; 
import userRouter from './routes/userRoutes.js';
import visarouter from "./routes/visaRoutes.js";
import buyVisaRouter from "./routes/buyvisaRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(express.json());

// Connect to the database
mongoose.connect(process.env.MONGODB_URI || "your_database_uri", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
});

// API Routes
// Add your API routes here
app.use('/api/users', userRouter);
app.use('/api/visa', visarouter);
app.use('/api/buyvisa', buyVisaRouter);


// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Serve the React build
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
