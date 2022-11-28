// REST OF YOUR CODE
import { Button, Text, HStack } from "@chakra-ui/react";
import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { PublicKey } from "@solana/web3.js";
import { NextPage } from "next";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import Image from "next/image";
import { useRouter } from "next/router";

interface NewMintProps {
  mint: PublicKey;
}

const NewMint: NextPage<NewMintProps> = () => {
  const [metadata, setMetadata] = useState<any>();
  const router = useRouter();

  const mint = router.query.mint;
  console.log("@@@mint", mint);

  const { connection } = useConnection();
  const walletAdapter = useWallet();
  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter));
  }, [connection, walletAdapter]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {},
    []
  );

  useEffect(() => {
    if (!metaplex || !mint) {
      return;
    }
    // What this does is to allow us to find the NFT object
    // based on the given mint address
    metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mint) })
      .then((nft) => {
        // We then fetch the NFT uri to fetch the NFT metadata
        fetch(nft.uri)
          .then((res) => res.json())
          .then((metadata) => {
            console.log("@@@@METADATA", metadata);
            setMetadata(metadata);
          });
      });
  }, [mint, metaplex, walletAdapter]);

  return (
    <div>
      {/* REST OF YOUR CODE */}
      <img src={metadata?.image}></img>
      {/* <Image src={metadata?.image} alt="" fill /> */}
      <Button
        bgColor="accent"
        color="white"
        maxWidth="380px"
        onClick={handleClick}
      >
        <HStack>
          <Text>stake my buildoor</Text>
          <ArrowForwardIcon />
        </HStack>
      </Button>
    </div>
  );
};

export default NewMint;
