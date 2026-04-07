const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const categoryRoutes = require("./routes/cat");

app.use("/api", categoryRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});