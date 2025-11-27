# CELO_builder_project

Project starter template for a minimal Celo dApp (SimplePayments).

This repository contains a Hardhat-based Solidity contract, a small frontend demo, and CI/CD workflows to build, test, publish a demo site via GitHub Pages, and deploy to the Celo Alfajores testnet.

Quick summary
- Contract: `SimplePayments` — accepts native payments and allows owner withdrawal.
- Build: Hardhat (Solidity 0.8.x) with tests under `celo-dapp/test`.
- Frontend: minimal ethers.js demo under `celo-dapp/frontend` (published to GitHub Pages).
- CI: GitHub Actions compile & test; deploy-to-alfajores workflow uses a repo secret `PRIVATE_KEY`.

See `celo-dapp/` for source and `frontend/` for the demo.