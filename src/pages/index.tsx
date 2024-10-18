import React, { useEffect, useState } from 'react'; // Import React and hooks
import Image from 'next/legacy/image'; // Import Image component from Next.js
import { ConnectButton } from '@rainbow-me/rainbowkit'; // Import ConnectButton from RainbowKit
import type { NextPage } from 'next'; // Import NextPage type from Next.js
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'; // Import hooks from wagmi
import { abi } from '../../contract-abi'; // Import contract ABI
import FlipCard, { BackCard, FrontCard } from '../components/FlipCard'; // Import FlipCard component and its subcomponents

// Define contract configuration
const contractConfig = {
  address: '0x86fbbb1254c39602a7b067d5ae7e5c2bdfd61a30',
  abi,
} as const;

// Define Home component
const Home: NextPage = () => {
  const [mounted, setMounted] = useState(false); // State to track if component is mounted
  useEffect(() => setMounted(true), []); // Set mounted to true after component mounts

  const [totalMinted, setTotalMinted] = useState(0n); // State to track total minted NFTs
  const { isConnected } = useAccount(); // Get account connection status

  // Destructure values from useWriteContract hook
  const {
    data: hash,
    writeContract: mint,
    isPending: isMintLoading,
    isSuccess: isMintStarted,
    error: mintError,
  } = useWriteContract();

  // Destructure values from useReadContract hook
  const { data: totalSupplyData } = useReadContract({
    ...contractConfig,
    functionName: 'totalSupply',
  });

  // Destructure values from useWaitForTransactionReceipt hook
  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  // Update totalMinted state when totalSupplyData changes
  useEffect(() => {
    if (totalSupplyData) {
      setTotalMinted(totalSupplyData);
    }
  }, [totalSupplyData]);

  const isMinted = txSuccess; // Check if minting transaction was successful

  return (
      <div className="page">
        <div className="container">
          <div style={{ flex: '1 1 auto' }}>
            <div style={{ padding: '24px 24px 24px 0' }}>
              <h1>NFT Demo Mint</h1>
              <p style={{ margin: '12px 0 24px' }}>
                {Number(totalMinted)} minted so far!
              </p>
              <ConnectButton /> {/* Render ConnectButton */}

              {mintError && (
                  <p style={{ marginTop: 24, color: '#FF6257' }}>
                    Error: {mintError.message}
                  </p>
              )}
              {txError && (
                  <p style={{ marginTop: 24, color: '#FF6257' }}>
                    Error: {txError.message}
                  </p>
              )}

              {mounted && isConnected && !isMinted && (
                  <button
                      style={{ marginTop: 24 }}
                      disabled={!mint || isMintLoading || isMintStarted}
                      className="button"
                      data-mint-loading={isMintLoading}
                      data-mint-started={isMintStarted}
                      onClick={() =>
                          mint?.({
                            ...contractConfig,
                            functionName: 'mint',
                          })
                      }
                  >
                    {isMintLoading && 'Waiting for approval'}
                    {isMintStarted && 'Minting...'}
                    {!isMintLoading && !isMintStarted && 'Mint'}
                  </button>
              )}
            </div>
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <FlipCard>
              <FrontCard isCardFlipped={isMinted}>
                <Image
                    layout="responsive"
                    src="/nft.png"
                    width="500"
                    height="500"
                    alt="RainbowKit Demo NFT"
                    priority
                />
                <h1 style={{ marginTop: 24 }}>Rainbow NFT</h1>
                <ConnectButton /> {/* Render ConnectButton */}
              </FrontCard>
              <BackCard isCardFlipped={isMinted}>
                <div style={{ padding: 24 }}>
                  <Image
                      src="/nft.png"
                      width="80"
                      height="80"
                      alt="RainbowKit Demo NFT"
                      style={{ borderRadius: 8 }}
                      priority
                  />
                  <h2 style={{ marginTop: 24, marginBottom: 6 }}>NFT Minted!</h2>
                  <p style={{ marginBottom: 24 }}>
                    Your NFT will show up in your wallet in the next few minutes.
                  </p>
                  <p style={{ marginBottom: 6 }}>
                    View on{' '}
                    <a href={`https://rinkeby.etherscan.io/tx/${hash}`}>
                      Etherscan
                    </a>
                  </p>
                  <p>
                    View on{' '}
                    <a
                        href={`https://testnets.opensea.io/assets/rinkeby/${txData?.to}/1`}
                    >
                      Opensea
                    </a>
                  </p>
                </div>
              </BackCard>
            </FlipCard>
          </div>
        </div>
      </div>
  );
};

export default Home; // Export Home component as default
