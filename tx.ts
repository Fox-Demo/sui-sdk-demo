import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { decodeSuiPrivateKey } from "@mysten/sui.js/cryptography";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { MIST_PER_SUI } from "@mysten/sui.js/utils";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as dotenv from "dotenv";
dotenv.config();

export async function transfer() {
  const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });

  const txb = new TransactionBlock();

  const { schema, secretKey } = decodeSuiPrivateKey(process.env.PK!);

  const keypair = Ed25519Keypair.fromSecretKey(secretKey);
  const receiver =
    "0x80198061308a8c4d1fe7aa00ed081bc38074c287c1ec4268c811af51cc7694fe";

  const [coin] = txb.splitCoins(txb.gas, [MIST_PER_SUI]);
  txb.transferObjects([coin], receiver);
  console.log(coin);
}

export async function mergeCoin() {
  const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });
  const txb = new TransactionBlock();
  const { secretKey } = decodeSuiPrivateKey(process.env.PK!);
  const keypair = Ed25519Keypair.fromSecretKey(secretKey);

  const { data } = await suiClient.getOwnedObjects({
    owner: keypair.toSuiAddress(),
  });
  const [coin1, coin2] = data;

  if (coin1.data && coin2.data) {
    txb.mergeCoins(txb.gas, [
      "0x08e8fbafcff80465374957ac34e63ede9a09252b35df2ea7559c730994d09983",
    ]);

    await suiClient.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: txb,
    });
  }
}
