const secp = require("ethereum-cryptography/secp256k1");
const {toHex} = require("ethereum-cryptography/utils");

// Alternate way to get the private key
//const {secp256k1} = require("ethereum-cryptography/secp256k1.js");
//const privateKey = secp256k1.utils.randomPrivateKey();

const privateKey = secp.secp256k1.utils.randomPrivateKey();
console.log('Private Key:', toHex(privateKey));

const publicKey = secp.secp256k1.getPublicKey(privateKey);
console.log('Public Key:', toHex(publicKey));