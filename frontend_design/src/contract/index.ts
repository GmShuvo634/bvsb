import { Config } from "@/config";
export const TREASURY_CONFIG = {
	address: "0x7840F01d71ee2F46b96B71232570BED03f644Ab7",
	abi: [
		{
			"inputs": [],
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "_key",
					"type": "address"
				},
				{
					"internalType": "address[]",
					"name": "_targets",
					"type": "address[]"
				},
				{
					"internalType": "uint256[]",
					"name": "_values",
					"type": "uint256[]"
				},
				{
					"internalType": "uint256",
					"name": "_fee",
					"type": "uint256"
				}
			],
			"name": "withdraw2users",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "to",
					"type": "address"
				},
				{
					"internalType": "uint256",
					"name": "amount",
					"type": "uint256"
				}
			],
			"name": "withdrawETH",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"stateMutability": "payable",
			"type": "receive"
		}
	],
} as const