import { ethers } from "ethers";

// Connect to Metamask using Ethers.js
export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    throw new Error("Metamask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

// Create a campaign
export async function createCampaign(contractAddress, abi, goal, duration) {
  const { provider, signer } = await connectWallet();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.createCampaign(
    ethers.parseEther(goal.toString()),
    duration
  );
  await tx.wait();
  return tx.hash;
}

// Fund a campaign
export async function fundCampaign(contractAddress, abi, campaignId, amount) {
  const { provider, signer } = await connectWallet();
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.fundCampaign(campaignId, {
    value: ethers.parseEther(amount.toString()),
  });
  await tx.wait();
  return tx.hash;
}

// Check wallet balance
export async function getBalance(address) {
  const provider = new ethers.JsonRpcProvider("https://arbitrum-sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID");
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}