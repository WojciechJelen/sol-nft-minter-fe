import { FC, MouseEventHandler, useEffect, useMemo, useState } from "react";
import {
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
  Image,
} from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import {
  CandyMachine,
  CandyMachineV2,
  DefaultCandyGuardSettings,
  Metaplex,
  PublicKey,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

const Connected: FC = () => {
  const { connection } = useConnection();
  const walletAdapter = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachineV2>();

  const metaplex = useMemo(() => {
    return Metaplex.make(connection).use(walletAdapterIdentity(walletAdapter));
  }, [connection, walletAdapter]);

  const [isMinting, setIsMinting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!metaplex) return;

    metaplex
      .candyMachinesV2()
      .findByAddress({
        address: new PublicKey("2MjBcH4ZFBtFqb4pYrK2UTpDTYPZq15x2jKhppVFR9gY"),
      })
      .then((candyMachine) => {
        console.log(candyMachine);
        setCandyMachine(candyMachine);
      })
      .catch((error) => {
        alert(error);
      });
  }, [metaplex]);

  const handleClick: MouseEventHandler<HTMLButtonElement> = async (event) => {
    if (event.defaultPrevented) {
      console.log("### here 1");
      return;
    }

    if (!walletAdapter.connected || !candyMachine) {
      console.log("### here 2", {
        adapter: walletAdapter.connected,
        machine: candyMachine,
      });
      return;
    }

    try {
      console.log(candyMachine);
      setIsMinting(true);
      const nft = await metaplex.candyMachinesV2().mint({ candyMachine });

      console.log("@@@NFT", nft);
      router.push(`/newMint?mint=${nft.nft.address.toBase58()}`);
    } catch (error) {
      alert(error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <VStack spacing={20}>
      <Container>
        <VStack spacing={8}>
          <Heading
            color="white"
            as="h1"
            size="2xl"
            noOfLines={1}
            textAlign="center"
          >
            Welcome Buildoor.
          </Heading>

          <Text color="bodyText" fontSize="xl" textAlign="center">
            Each buildoor is randomly generated and can be staked to receive
            <Text as="b"> $BLD</Text> Use your <Text as="b"> $BLD</Text> to
            upgrade your buildoor and receive perks within the community!
          </Text>
        </VStack>
      </Container>

      <HStack spacing={10}>
        <Image src="avatar1.png" alt="" />
        <Image src="avatar2.png" alt="" />
        <Image src="avatar3.png" alt="" />
        <Image src="avatar4.png" alt="" />
        <Image src="avatar5.png" alt="" />
      </HStack>

      <Button
        bgColor="accent"
        color="white"
        maxW="380px"
        onClick={handleClick}
        isLoading={isMinting}
      >
        <HStack>
          <Text>mint buildoor</Text>
          <ArrowForwardIcon />
        </HStack>
      </Button>
    </VStack>
  );
};

export default Connected;
