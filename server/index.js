const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require('ethereum-cryptography/secp256k1');
const {keccak256} = require('ethereum-cryptography/keccak');

app.use(cors());
app.use(express.json());

const balances = {
  // public keys balances
  "03e39a7dcc6f7cd9ea10fc24a16640214a3446dc36ebad07d53e9f854a1c92df75": 100,
  "02386857125ece0e78bd6a39455047e6d27e3fc25139187b1ecea740edbae107fc": 50,
  "02a361f057229ee17910ffdf239717aa4e61e5137c7dde3399fdc2e3d25107d4c7": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // get the signature from the client
  const { sender, sig:sigStringed, msg } = req.body;
  const { recipient, amount } = msg;

   // convert back to bigints
   const sig = {
    ...sigStringed,
    r: BigInt(sigStringed.r),
    s: BigInt(sigStringed.s)
  }

  // generate a signed transaction
  const hashMessage = (message) => keccak256(Uint8Array.from(message));

  // validate
  const isValid = secp.secp256k1.verify(sig, hashMessage(msg), sender) === true;
  
  if(!isValid) res.status(400).send({ message: "Bad signature!"});

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
