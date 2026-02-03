import express from "express"
import jwt from "jsonwebtoken"
import sqlite3 from "sqlite3"
import {createHash} from "node:crypto";
import cookieParser from "cookie-parser";
import cors from "cors";

const JWT_SECRET = process.env.JWT_SECRET || "titkos123"
const app = express()
const db = new sqlite3.Database("users.sqlite")
await db.run("create table if not exists user (id integer primary key autoincrement, username text, password blob)")
let regUser = db.prepare("insert into user (username, password) values (?,?) returning id, username")
app.use(express.json())
app.use(cookieParser())

let dynamicCorsOptions = function(req, callback) {
    let corsOptions;
    if (req.path.startsWith('/login') || req.path.startsWith("/me") ||req.path.startsWith("/register")) {
        // Access-Control-Allow-Origin: http://mydomain.com, Access-Control-Allow-Credentials: true, Vary: Origin
        corsOptions = {
            origin: "http://localhost:5173",
            credentials: true
        };
    } else {
        // Access-Control-Allow-Origin: *
        corsOptions = { origin: '*' };
    }
    callback(null, corsOptions);
};

app.use(cors(dynamicCorsOptions));

const auth = (req, res, next) => {
    let token = req.cookies.token

    if (!token) {
        return res.status(401).send({err: "no token"})
    }

    try {
        let payload = jwt.verify(token, JWT_SECRET)
        req.user = {
            id: payload.sub
        }
        next()
    } catch (e) {
        res.status(401).send({err: e.message})
    }
}

app.post("/login", async (req, res) => {
    db.get("select * from user where username = ?", req.body.username, (err, row) => {
        if (!row) {
            return res.status(404).send({err: "User not found"})
        }

        let hash = createHash("sha256")
        hash.update(req.body.password)

        if (Buffer.compare(hash.digest(), row.password) !== 0) {
            return res.status(401).send({err: "Passwords don't match"})
        }

        let token = jwt.sign({
            iat: (Date.now() / 1000) << 0,
            sub: row.id
        }, JWT_SECRET, {
            expiresIn: "1h"
        })

        res.cookie("token", token)
        res.send({username: row.username})
    })
})

app.get("/me", auth, (req, res) => {
    db.get("select username from user where id = ?", req.user.id, (err, row) => {
        res.send(row)
    })
})

app.get("/test", auth, (req, res) => {
    res.send("Helló világ! " + req.user.id)
})

app.post("/register", async (req, res) => {
    const {username, password} = req.body;

    if (typeof username !== "string") {
        return res.status(400).send({err: "Invalid username"})
    }

    if (typeof password !== "string") {
        return res.status(400).send({err: "Invalid password"})
    }

    const hash = createHash("sha256")
    hash.update(password)

    regUser.get(username, hash.digest(), (err, row) => res.send(row))
})


app.listen(3000, () => console.log("Listening on 3000"))
