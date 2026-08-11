require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.get("/", (req, res) => {
  res.json({
    message: "Ragheed Backend Server",
    status: "running",
  });
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: "name and email are required",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO users (name, email)
      VALUES ($1, $2)
      RETURNING *
      `,
      [name, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    res.status(500).json({
      error: "Database error",
    });
  }
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running on port ${PORT}`);
});
