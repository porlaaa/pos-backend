const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { seedTables } = require("./controllers/tableController");

const app = express();
const PORT = config.PORT;

connectDB();
seedTables();

// 🔥 CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://pos-frontend-eosin-rho.vercel.app',
    'https://posproject.site',
    'https://www.posproject.site'
  ],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from POS Server2!" });
});

app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/item", require("./routes/itemRoutes"));

// Error handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`☑️ POS Server is listening on port ${PORT}`);
});