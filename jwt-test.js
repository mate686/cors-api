import jwt from "jsonwebtoken"

let payload ={
    name: "Teszt Elek",
    iat: Date.now(),
    sub: 1
}

let token = jwt.sign(payload,"titkos123")


console.log(token)

let verifytoken =  token

let res = jwt.verify(token,"titkos123")

console.log(res)