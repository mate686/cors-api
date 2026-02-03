import express from "express";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import { createHash } from "crypto";
import cookieParser from "cookie-parser";
import cors from "cors";

const jwtsecret = process.env.JWT_SECRET || "titkos123";
const app = express();
const db = new sqlite3.Database("users.sqlite");

app.use(express.json());
app.use(cookieParser());
const corsoptions = {origin: "http://localhost:5173"}
app.use(cors(corsoptions));


db.run(`
  CREATE TABLE IF NOT EXISTS userNemJo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password BLOB
  )
`);

const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "No token" });
    }

    try {
        const payload = jwt.verify(token, jwtsecret);
        req.user = { id: payload.sub };
        next();
    } catch (e) {
        return res.status(401).json({ error: e.message });
    }
};

app.get("/test", auth, (req, res) => {
    res.send("Helló világ " + req.user.id);
});

app.post("/register", cors({...corsoptions, credentials:true}), (req, res) => {
    const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
        return res.status(400).json({ error: "Invalid input" });
    }

    const hash = createHash("sha256").update(password).digest();

    db.run(
        "INSERT INTO user (username, password) VALUES (?, ?)",
        [username, hash],
        function (err) {
            if (err) {
                return res.status(400).json({ error: "User already exists" });
            }
            res.status(201).json({ id: this.lastID, username });
        }
    );
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM user WHERE username = ?",
        username,
        (err, row) => {
            if (!row) {
                return res.status(404).json({ error: "User not found" });
            }

            const hash = createHash("sha256").update(password).digest();

            if (Buffer.compare(hash, row.password) !== 0) {
                return res.status(401).json({ error: "Passwords do not match" });
            }

            const token = jwt.sign(
                { sub: row.id },
                jwtsecret,
                { expiresIn: "1h" }
            );

            res.cookie("token", token, { httpOnly: true });
            res.json({ username: row.username });
        }
    );
});

app.get("/me", auth, (req, res) => {
    db.get("select username from users where username = ?",req.user.id, (err, row) => {
        res.send(row)
    })
})

app.listen(3000, () => console.log("Server started on port 3000"));