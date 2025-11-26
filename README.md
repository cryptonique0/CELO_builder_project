# CELO_builder_project

Minimal Celo dApp scaffold (SimplePayments).

## Overview

This repository contains a minimal scaffold to build on Celo (EVM-compatible):

- `contracts/SimplePayments.sol` — simple contract that accepts native payments and allows owner withdrawals.
- `scripts/deploy.js` — Hardhat deployment script (use `npx hardhat run scripts/deploy.js --network alfajores`).
- `frontend/` — a tiny UI stub for manual testing.
- `test/` — contains a basic Mocha/Chai test that validates payments and withdrawals.
- `.github/workflows/ci.yml` — CI to compile and run tests on push/PR.
- `.github/workflows/pages.yml` — (if enabled) deploys `frontend/` to GitHub Pages.

## Links & resources

- Celo docs: https://docs.celo.org/build-on-celo/

## CI and Secrets

The repository includes a CI workflow that runs on push and pull requests and compiles & tests the contract using Hardhat.

To allow secure deployments (and for optional Alfajores deploys via CI), set the following repository secret in GitHub:

- `PRIVATE_KEY` — the deployer account private key (testnet only). Never use a mainnet private key in CI. Store as a repository secret at: Settings → Secrets and variables → Actions → New repository secret.

Example: add a test account private key (prefixed with `0x`) to `PRIVATE_KEY`. The CI/test workflows read this secret when deploying via Hardhat.

## GitHub Pages (frontend demo)

I added a GitHub Actions workflow that can publish the `frontend/` folder to GitHub Pages (using `gh-pages` branch). The workflow triggers on successful push to `main` and will publish the content automatically.

Note: After pushing, you may need to enable GitHub Pages in the repository settings (Settings → Pages) or allow the workflow access. If Pages is blocked by organization policy, enable it or ask your org admin.

## How I'll proceed once you provide the repo URL

1. I'll add the remote `origin` you provide and push both `main` and `celo-dapp-initial` branches.
2. I'll open a pull request from `celo-dapp-initial` → `main` and post the PR URL here so judges can review incremental progress.
3. The CI will run automatically. If you want the frontend demo live, the Pages workflow will publish the `frontend/` folder to `gh-pages`.

## Local usage

Install dependencies and run tests locally:

```bash
cd /home/web3joker/CELO_builder_project_repo
npm install
npx hardhat compile
npx hardhat test
```

Deploy to Alfajores locally (requires `PRIVATE_KEY` locally set):

```bash
CELO_RPC=https://alfajores-forno.celo-testnet.org PRIVATE_KEY=0x... npx hardhat run scripts/deploy.js --network alfajores
```

If you want me to push and open the PR now, paste the new GitHub repo URL here (HTTPS or SSH) and I will push and open the PR.
