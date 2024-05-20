import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { Inputs } from "@mysten/sui.js/transactions";
import { bcs } from "@mysten/sui.js/bcs";

import * as dotenv from "dotenv";
dotenv.config();

const TREASURY_CAP_ID =
  "0x598287d9e2b7e46fa40cd4f94663e86b27b188e178b23a68dd6ef1a3a966a779";
const TREASURY_TYPE =
  "0x27a2d5cee8041512725e80a21d03de8030d12a343ef45028d52030cfd8c6f8df::cart::CART";

export async function mint() {
  const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
  const txb = new TransactionBlock();
  const { secretKey } = decodeSuiPrivateKey(process.env.PK!);
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  console.log(keypair.toSuiAddress());

  //Main

  //Get treasury object
  const { data } = await suiClient.getOwnedObjects({
    owner: keypair.toSuiAddress(),
  });
  const [treasuryCapRes] = data.filter(
    (object) => object.data?.objectId === TREASURY_CAP_ID
  );
  const { data: treasuryCap } = treasuryCapRes;

  //Build transaction block
  const treasuryCapRef = Inputs.ObjectRef(treasuryCap!);
  const mintObject = txb.moveCall({
    arguments: [txb.object(treasuryCapRef), txb.pure.u64(MIST_PER_SUI)],
    typeArguments: [TREASURY_TYPE],
    target: `0x2::coin::mint`,
  });
  txb.transferObjects([mintObject], keypair.toSuiAddress());

  //Sign and execute
  const result = await suiClient.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: txb,
  });
  console.log(result);
}

//Get total supply by sui::coin::total_supply
async function totalSupply() {
  const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
  const txb = new TransactionBlock();
  const { secretKey } = decodeSuiPrivateKey(process.env.PK!);
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  console.log(keypair.toSuiAddress());

  //Main

  //Get treasury object
  const { data } = await suiClient.getOwnedObjects({
    owner: keypair.toSuiAddress(),
  });
  const [treasuryCapRes] = data.filter(
    (object) => object.data?.objectId === TREASURY_CAP_ID
  );
  const { data: treasuryCap } = treasuryCapRes;

  //Build txb
  const treasuryCapRef = Inputs.ObjectRef(treasuryCap!);
  txb.moveCall({
    arguments: [txb.object(treasuryCapRef)],
    typeArguments: [TREASURY_TYPE],
    target: `0x2::coin::total_supply`,
  });

  //Dev inspect
  const result = await suiClient.devInspectTransactionBlock({
    sender: keypair.toSuiAddress(),
    transactionBlock: txb,
  });

  const { results } = result;
  if (results && results[0].returnValues) {
    const [value] = results[0].returnValues[0];
    console.log(bcs["u64"]().parse(new Uint8Array(value)));
  }
}

totalSupply();
