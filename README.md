# Indexing ERC-20 token balance using Subgraphs

## 

Introduction

[](https://docs.chainstack.com/docs/subgraphs-tutorial-indexing-erc-20-token-balance#introduction)

Before the Bored Apes and decentralized loans, there was a time when people were obsessed with creating tokens for everything that moved. This phase turned the Ethereum ecosystem into the Wild West of the cryptocurrency world—with new tokens popping up faster than you can say “to the moon.” The main ingredient of this frenzy was an implementation standard for creating fungible tokens, the ERC-20.

ERC-20 was designed to provide a consistent set of rules and standards for developers to follow when creating new tokens on the Ethereum blockchain. This made it easier for people to understand how to create new tokens and for users to understand how to interact with them. Since its introduction in 2015, the ERC-20 has become the most widely used standard for creating new tokens on the Ethereum blockchain. So, it means that if you have dabbled in Ethereum, chances are you have either used, created, or even hoarded tokens made using the ERC-20 standard, and this article is aimed at the hoarders… I mean HODLers of ERC-20 tokens.

In this article, you will use subgraphs to index Ethereum accounts and their ERC-20 token balances.

> ## 📘
> 
> Check out [A beginner’s guide to getting started with The Graph](https://docs.chainstack.com/docs/subgraphs-tutorial-a-beginners-guide-to-getting-started-with-the-graph) and [Indexing Uniswap data with Subgraphs](https://docs.chainstack.com/docs/subgraphs-tutorial-indexing-uniswap-data) to learn more about developing Subgraphs.

## 

The modus operandi

[](https://docs.chainstack.com/docs/subgraphs-tutorial-indexing-erc-20-token-balance#the-modus-operandi)

Indexing the ERC-20 token balances presents quite a bit of a challenge compared to other exercises using subgraphs. You see while trying to gather this data, you won’t be focusing on a particular account or a contract. Here, you are trying to get the details of all the accounts that house any and all ERC-20 tokens. So where do we start?

We know that every ERC-20 token is controlled by a smart contract that implements the ERC-20 standard on the Ethereum blockchain. The ERC-20 standard defines a set of mandatory and optional functions that a contract must implement in order to be considered an ERC-20 token. Of the many mandatory functions that should be implemented while creating an ERC-20 token, the `transfer()` function directly affects the token balance of an account.

> ## 📘
> 
> Here’s a complete overview of the ERC-20 token standard: [OpenZeppelin ERC-20 Doc](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20)

The `transfer()` function facilitates the transfer of tokens from one account to another. By mandate, the function must also emit a `Transfer` event that carries the details of the accounts involved in the transfer and the value of the tokens that were transferred.

By capturing and processing the `Transfer` events that were emitted, we could access all the above-mentioned transfer information plus the token's address (contract). With all data, I say we could create a nice index of token balances. So, let’s get to it.

## 

Prerequisites

[](https://docs.chainstack.com/docs/subgraphs-tutorial-indexing-erc-20-token-balance#prerequisites)

Before we start scanning the Ethereum network for token balances, make sure you have installed the following on your computer:

-   Node (version ≥ 16) and the corresponding npm
-   A reasonably useful code editor

To develop and deploy subgraphs, you also need the graph-cli package ([v0.51.2](https://www.npmjs.com/package/@graphprotocol/graph-cli/v/0.51.2) or greater). To install this package on your computer, open a terminal and use the following command:

```

```

That takes care of all the requirements; now, let’s set up a subgraph project.

## 

Setting up the project

[](https://docs.chainstack.com/docs/subgraphs-tutorial-indexing-erc-20-token-balance#setting-up-the-project)

> ## 📘
> 
> To write the code used in this article, the following Graph protocol repository was referred to:
> 
> [graphprotocol/erc20-subgraph](https://github.com/graphprotocol/erc20-subgraph).

To quickly spin up a subgraph project:

1.  Create a new directory.
2.  Open a terminal in the directory.
3.  Use the following command:

```

```

In this specific example, I used the [ApeCoin](https://etherscan.io/token/0x4d224452801aced8b2f0aebe155379bb5d594381) smart contract; this means we'll index all of the ApeCoin transfers that ever happened. You can use any Ethereum ERC-20 smart contract you want.

> ## 📘
> 
> Also note that the graph-cli will pick up the beginning block number automatically, but you can edit it to start indexing from the block you want.

The command will prompt you for the following information:

```
✔ Protocol · ethereum
✔ Product for which to initialize · subgraph-studio
✔ Subgraph slug · erc20-balance
✔ Directory to create the subgraph in · erc20-balance
? Ethereum network … 
✔ Ethereum network · mainnet
✔ Contract address · 0x4d224452801ACEd8B2F0aebE155379bb5D594381
✔ Fetching ABI from Etherscan
✔ Fetching Start Block
✔ Start Block · 14204533
✔ Contract Name · ERC20
✔ Index contract events as entities (Y/n) · true
  Generate subgraph
  Write subgraph to directory
✔ Create subgraph scaffold
✔ Initialize networks config
✔ Initialize subgraph repository
✔ Install dependencies with yarn
✔ Generate ABI and schema types with yarn codegen
Add another contract? (y/n): n
Subgraph erc20-balance created in erc20-balance

```

Here, as you can see, when it comes to providing the contract address for the project, you can use any given ERC-20 token contract address. This is due to the fact that the `transfer()` function and the associated event are mandatory, meaning that every ERC-20 token contract would have to implement them, and they would do so in a uniform format.

The graph-cli uses the contract address to fetch the contract ABI, which is required for accessing the contract functions. Since every ERC-20 token contract will have the `transfer()` function and the `Transfer` event, we can use the ABI of any given ERC-20 token contract for accessing them.

You can get the token contract address from Etherscan. To avoid confusion, you can set the contract name as `ERC20`, as a nod to the generic nature in which we will be using its ABI.

> ## 📘
> 
> Note
> 
> Here’s a list of ERC-20 tokens to choose from [Etherscan Token Tracker](https://etherscan.io/tokens).

Once you provide all the information, the CLI tool will set up a well-structured project with some template code.

```

```

Here, you can see that inside the `/abis` directory, the contract ABI is saved as `ERC20.json` (based on the contract name that we provided).

## 

Writing the schema

[](https://docs.chainstack.com/docs/subgraphs-tutorial-indexing-erc-20-token-balance#writing-the-schema)

Now that we have the base template for our project, we can start working on our [schema file](https://docs.chainstack.com/docs/subgraphs-tutorial-working-with-schemas), `schema.graphql`. Within this file, we will define the data objects or entities we need. When you analyze our use case, you can see that in order to access the token balance, we also need information regarding the account and the token involved. Based on this requirement, let’s model our schema file:

```

```

Here, apart from the `Token` and `Account` entities, we have also modeled the token balance as a separate entity, `TokenBalance`. Since the token balance is associated with an account, we have declared a `balances` field inside the `Account` entity and declared it as a list of token balances; `[TokenBalance!]`. This represents the fact that a single account can have multiple token balances. The `@derivedFrom` directive in the field is used to declare it as a reverse lookup. By doing so, we have created a virtual field on the `Account` entity (`Balances`) that is derived from the relationship defined on the `TokenBalance` entity (`account`). Thus, the `Balances` field need not be set manually using the mapping file.

