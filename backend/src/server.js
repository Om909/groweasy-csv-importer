require("dotenv").config();
const express = require("express");
const cors = require("cors");

const importRoutes = require("./routes/import.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", importRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`GrowEasy CSV importer backend listening on port ${PORT}`);
});
