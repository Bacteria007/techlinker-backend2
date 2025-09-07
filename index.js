const express = require("express");
const logger = require("./src/middlewares/logger");
const errorHandler = require("./src/middlewares/errorhandler");
const studentRoutes = require("./src/routes/studentRoutes");
const instituteRoutes = require("./src/routes/instituteRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const internshipRoutes = require("./src/routes/internshipRoutes");
const messageRoutes = require("./src/routes/messages");
const connectDB = require("./src/config/db");
// const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// app.use(bodyParser.json());
// dotenv.config();
app.use(logger);
app.use(errorHandler);
connectDB();
app.use(express.json());
app.use("/uploads", express.static("uploads"));


app.use("/api/student", studentRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/messages", messageRoutes);

app.get("/health", (req, res) => {
  console.log('healthy=====')
  res.send("API is running...");
});

app.listen(PORT, () => {

console.log(`🚀 Server running on port ${PORT}`);
});

app.use((req, res) => {
  res.status(404).json({ message: "Techlinker Api Route not found" });
});