import {
  clusterApiUrl,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import {
  DataV2,
  createCreateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { createMint } from "@solana/spl-token";
import * as fs from "fs";
import path from "path";

import { initializeKeypair } from "../../utils";

const TOKEN_NAME = "BERSERK";
const TOKEN_SYMBOL = "BRSK";
const TOKEN_DESCRIPTION = "A token for real berserkers";
const TOKEN_IMAGE_NAME = "brsk.png"; // Replace unicorn.png with your image name
// const TOKEN_IMAGE_PATH = path.join(__dirname, `./assets/brsk.png`);
const TOKEN_IMAGE_PATH = `src/tokens/brsk/assets/${TOKEN_IMAGE_NAME}`;

async function createBrskToken(connection: Connection, payer: Keypair) {
  // This will create a token with all the necessary inputs
  const tokenMint = await createMint(
    connection, // Connection
    payer, // Payer
    payer.publicKey, // Your wallet public key
    payer.publicKey, // Freeze authority
    2 // Decimals
  );

  // Create a metaplex object so that we can create a metaplex metadata
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  // Read image file
  const imageBuffer = fs.readFileSync(TOKEN_IMAGE_PATH);
  const file = toMetaplexFile(imageBuffer, TOKEN_IMAGE_NAME);
  const imageUri = await metaplex.storage().upload(file);

  // Upload the rest of offchain metadata
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: TOKEN_NAME,
    description: TOKEN_DESCRIPTION,
    image: imageUri,
  });

  // Finding out the address where the metadata is stored
  const metadataPda = metaplex.nfts().pdas().metadata({ mint: tokenMint });
  const tokenMetadata = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  const instruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPda,
      mint: tokenMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true,
      },
    }
  );

  const transaction = new Transaction();
  transaction.add(instruction);

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  fs.writeFileSync(
    // path.join(__dirname, "../brsk"),
    "src/tokens/brsk/cache.json",
    JSON.stringify({
      mint: tokenMint.toBase58(),
      imageUri: imageUri,
      metadataUri: uri,
      tokenMetadata: metadataPda.toBase58(),
      metadataTransaction: transactionSignature,
    })
  );
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const payer = await initializeKeypair(connection);

  // await createBrskToken(connection, payer);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
