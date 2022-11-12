import { Suspense } from "react";
import { HStack, Spacer } from "@chakra-ui/react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import dynamic from "next/dynamic";

import styles from "./NavBar.module.css";

const DynamicConnectButton = dynamic(() => import("./ConnectButton"), {
  ssr: false,
});

export const NavBar = () => {
  return (
    <HStack width="full" padding={4}>
      <Spacer />

      {/* <WalletMultiButton className={styles.walletAdapterButtonTrigger} /> */}
      <DynamicConnectButton />
    </HStack>
  );
};
