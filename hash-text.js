import {createHash} from  "node:crypto"

const hash = createHash("sha256")

hash.update("jelszó")

let buff = hash.digest()

console.log(buff)