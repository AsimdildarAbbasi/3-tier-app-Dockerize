const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World"); });

// Test database connection endpoint
app.get("/db-test", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({
            status: "success",
            message: "Connected to Database!",
            time: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Could not connect to Database",
            error: err.message
        });
    }
});

// Get all todos
app.get("/api/todos", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM todos ORDER BY id ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("GET /api/todos error:", err.message);
        res.status(500).json({ error: "Failed to fetch todos" });
    }
});

// Create a new todo
app.post("/api/todos", async (req, res) => {
    const { title } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
    }
    try {
        const result = await db.query(
            "INSERT INTO todos (title) VALUES ($1) RETURNING *",
            [title.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("POST /api/todos error:", err.message);
        res.status(500).json({ error: "Failed to create todo" });
    }
});

// Update a todo (both title and completed status supported)
app.put("/api/todos/:id", async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    
    try {
        const fields = [];
        const values = [];
        let index = 1;

        if (title !== undefined) {
            fields.push(`title = $${index++}`);
            values.push(title.trim());
        }
        if (completed !== undefined) {
            fields.push(`completed = $${index++}`);
            values.push(completed);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        values.push(id);
        const queryText = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;
        const result = await db.query(queryText, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(`PUT /api/todos/${id} error:`, err.message);
        res.status(500).json({ error: "Failed to update todo" });
    }
});

// Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("DELETE FROM todos WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Todo not found" });
        }
        res.json({ message: "Todo deleted successfully", deleted: result.rows[0] });
    } catch (err) {
        console.error(`DELETE /api/todos/${id} error:`, err.message);
        res.status(500).json({ error: "Failed to delete todo" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

