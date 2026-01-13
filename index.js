import  express from "express";
import  cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.disable("e-tag")

app.use(express.json());
app.use(cookieParser())

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}))

app.get("/users", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.send([
        {id:1,name: "John Doe"},
        {id:2,name: "Tesztelek"},
        {id:3,name: "Nem tudom"},
    ])
})

app.options("/register", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "content-type");

    res.sendStatus(204)
})

app.post("/register", (req, res) => {
    console.log("reg:", req.body);
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.send({ok:true});
})

app.options("/login", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(204)
})


app.post("/login", (req, res) => {
    console.log("login:", req.body);
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.cookie("token", "asd");
    res.send({ok:true});
})

app.options("/me", (req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(204)
})

app.get("/me",(req, res) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    if(req.cookies.token){
        res.send({user: "Teszt Elek"})
    } else {
        res.status(401).send({err:"Missing token"});
    }
})


app.get("/lorem", (req, res) => {
    console.log("lorem")
    console.log(req.headers["if-modified-since"]);
    res.header("Cache-Control", "public, max-age=10, no-cache")
    //res.header("Last-Modified",new Date().toGMTString())
    res.send({txt:"LoremIpsum"})
})

app.listen(3000, () => console.log("Server started on port 3000"));