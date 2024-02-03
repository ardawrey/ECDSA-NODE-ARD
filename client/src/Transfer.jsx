import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {secp256k1} from 'ethereum-cryptography/secp256k1';
import { toHex,utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from "ethereum-cryptography/keccak";

//Private Key 1: ce0e768329e558722ab47fd1c29c4718533c64e6998717723d5bdf5aecb40221
//Public Key 1: 03e39a7dcc6f7cd9ea10fc24a16640214a3446dc36ebad07d53e9f854a1c92df75

//Private Key 2: 22d51c7e35285db36e1ed24009dcb5a5389ed9f005762d5d7bcd02af4fc1667a
//Public Key 2: 02386857125ece0e78bd6a39455047e6d27e3fc25139187b1ecea740edbae107fc

//Private Key 3: 09ad8ec6025d74378859a65bbe9d23306aad16e87cebf7060ac9da7189539ab5
//Public Key 3: 02a361f057229ee17910ffdf239717aa4e61e5137c7dde3399fdc2e3d25107d4c7

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const hashMessage = message => keccak256(Uint8Array.from(message));
  const signMessage = msg => secp256k1.sign(hashMessage(msg),privateKey);

  async function transfer(evt) {
    evt.preventDefault();

    const msg = { amount: parseInt(sendAmount), recipient };
    const sig = signMessage(msg);

    const stringifyBigInts = obj =>{
      for(let prop in obj){
        let value = obj[prop];
        if(typeof value === 'bigint'){
          obj[prop] = value.toString();
        }else if(typeof value === 'object' && value !== null){
          obj[prop] = stringifyBigInts(value);
        }
      }
      return obj;
    }

    // stringify bigints before sending to server
    const sigStringed = stringifyBigInts(sig);
  
    const tx = {
      sig:sigStringed, msg, sender: address
    }

    try {
      const {
        data: { balance },
      } = await server.post(`send`, tx);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;