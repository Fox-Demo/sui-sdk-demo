import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as dotenv from "dotenv";
dotenv.config();

const RECEIVER =
  "0x80198061308a8c4d1fe7aa00ed081bc38074c287c1ec4268c811af51cc7694fe";

async function transfer() {
  const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
  const txb = new TransactionBlock();
  const { secretKey } = decodeSuiPrivateKey(process.env.PK!);
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  console.log(keypair.toSuiAddress());

  //Main

  //Build Tx
  const TARGET_OBJECT =
    "0x6542105dc2f457687b60f49d43dbbc811aa4d5c183de7bca2685f48161b281e4";

  txb.transferObjects([txb.gas], RECEIVER);

  //Sign
  const buildTxb = await txb.build({ client: suiClient });

  const sig = await keypair.signTransactionBlock(buildTxb);

  const result = await suiClient.executeTransactionBlock({
    signature: sig.signature,
    transactionBlock: buildTxb,
  });

  // console.log(result);
}

async function transferForge() {
  const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
  const txb = new TransactionBlock();
  const { secretKey } = decodeSuiPrivateKey(process.env.PK!);
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  console.log(keypair.toSuiAddress());

  //Main

  //Build Tx
  const TARGET_OBJECT =
    "0xeb018eae5e7ae0adffeadb93d55753398cbf17c2fa7aa4c40e1062eab7f66cfb";

  txb.transferObjects([TARGET_OBJECT], RECEIVER);
  txb.setSender(keypair.toSuiAddress());

  //Sign
  const buildTxb = await txb.build({ client: suiClient });

  const result = await suiClient.dryRunTransactionBlock({
    transactionBlock: buildTxb,
  });

  console.log(result);
}

transferForge();
