✅ Full Production Recommendations & Best Practices Document
🚀 Arbitrage Bot - Production Guidelines
Deploying a flashloan-based arbitrage bot requires careful attention to security, reliability, and risk management. This document outlines the most important best practices you should follow when operating in production.

✅ 1. Use a Private or Dedicated RPC
Never use public RPCs (Infura free-tier, Alchemy free-tier, etc.) for production.
Public RPCs are slow, unreliable, and expose your bot's actions.

Recommended:
 Alchemy Premium
 Infura Premium
 QuickNode
 Self-hosted full or archive node
 Update your .env:
 ```env
 RPC=https://your-private-rpc
```
✅ 2. Flashbots Protect (Mandatory)
Never send profitable transactions to the public mempool.
Use Flashbots Protect or another private relay.
Prevent frontrunning and sandwich attacks.

✅ 3. Slack or Discord Alerts Enabled
Configure WEBHOOK_URL in your .env.

Alerts should notify you when:
 A profitable opportunity is detected.
 A flashloan is executed.
 Any failure happens (Flashbots rejection, revert, etc.).
 Use the included alerts.js to integrate notifications easily.

✅ 4. Wallet Isolation (Hot vs. Cold Wallets)
Do not use your main trading wallet's private key.
Use a dedicated private key specifically for the bot.
Limit token approvals (allowance) to the bot only.

✅ 5. Gas Strategy (Dynamic)
Included gasBiddingStrategy.js automatically adapts to baseFee.
Recommended tweaks:
 Adjust priority fees during volatile periods.
 Adjust slippage buffer (SLIPPAGE_BPS in .env) based on liquidity and route length.

✅ 6. Log Rotation & Retention
Docker:
  Included docker-compose.override.yml handles log rotation.
PM2:
  Use PM2's built-in log rotation:
```bash
   pm2 install pm2-logrotate
```

✅ 7. PM2 Cluster Mode (Optional for Non-Docker)
For bots like cross-chain scanners or alert daemons:
  ```bash
   pm2 start ecosystem.config.js -i max
```
This will utilize all available CPU cores for auxiliary bots.

✅ 8. Grafana + Prometheus Monitoring
Already integrated via docker-compose.yml.

Grafana default access:
 URL:      http://localhost:3000
 User:     admin
 Password: admin

Set custom Grafana alerts for:
 Arbitrage Success Rate
 Flashloan Failures
 Bot Restarts
 Profits per execution


✅ 9. Fork Testing (Mandatory)
Before deployment:
  ```bash
   npx hardhat test
 ```  
Test for:
 Flashloan routing correctness
 Slippage impact
 Gas cost estimation
 Strategy profitability
 Bundle acceptance on Flashbots

✅ 10. Version Control & Backup
  Always use Git to track:
Strategy changes
 Gas strategy modifications
 Contract deployment addresses
Backup your environment:
 .env file (sensitive)
 Private keys (offline)
 Deployment notes

✅ 11. Optional: Profit Tracker
For a simple Prometheus-based profit tracker:
 Export profit metrics directly inside searcherBot.js
 Create a Prometheus collector endpoint in your bot
Display:
 Total profits
 Flashloan counts
 Average profit per transaction
 Visualize in Grafana

✅ 12. Optional: Risk Management Checklist
Before production:
 Use private RPC endpoint
 Run Flashbots-only transactions
 Fork-test all strategies
 Enable Slack/Discord alerts
 Use a dedicated private key
 Setup monitoring
 Adjust slippage according to route volatility
 Enable log rotation
 Limit allowances to bot's contracts only
 Document & version control all changes

Operator Advice:
If you aren't sure about a deployment — assume it's not ready.
Losses happen mostly due to poor pre-flight checks, not bad arbitrage logic.



DOCKER INSTALL

Prerequisites:
 Installed Docker
 Installed Docker Compose
 Git Installed

✅ Step 1 — Clone the Repository
```bash
git clone https://github.com/cryptocent/arbitrageBTCLoan.git
cd arbitrageBTCLoan
```
✅ Step 2 — Create Environment File
Copy the example:

```bash
cp .env.example .env
```
Then open .env in a text editor and configure:
Your Private Key
RPC endpoints
Engine address
Token addresses
Adapter addresses
Webhook URL (optional)

Example:

```ini
PRIVATE_KEY=your_wallet_private_key
RPC=https://your-mainnet-rpc
ENGINE_ADDRESS=0xYourArbitrageEngine
UNISWAP_ADAPTER=0xYourUniswapAdapter
BALANCER_ADAPTER=0xYourBalancerAdapter
CURVE_ADAPTER=0xYourCurveAdapter
UNISWAP_QUOTER=0xYourUniswapQuoter
CURVE_POOL=0xYourCurvePool
WEBHOOK_URL=https://your-discord-or-slack-webhook
FLASHLOAN_AMOUNT=1000
SLIPPAGE_BPS=50
```


✅ Step 3 — Verify Docker is Working
```bash
docker --version
docker-compose --version
```
✅ Step 4 — Build Docker Image

docker-compose build
If you get a yarn.lock error:

```bash
yarn install
```
If you don’t have yarn:

```bash
npm install -g yarn
yarn install
```
Then rebuild:

```bash
docker-compose build
```
✅ Step 5 — Start the Stack
```bash
docker-compose up -d
```
✅ Step 6 — Confirm Everything is Running
```bash
docker-compose ps
```
You should see:

```mathematica
searcher     Up
prometheus   Up
grafana      Up
```
✅ Step 7 — Access Monitoring Dashboard
Service	URL
 Grafana	http://localhost:3000 (default login: admin / admin)
 Prometheus	http://localhost:9090
✅ Step 8 — Logs (Optional)
```bash
docker-compose logs -f searcher
```
✅ Step 9 — Stopping the Bot
```bash
docker-compose down
```
✅ Notes
Profitable arbitrage will trigger Slack/Discord alerts if webhook configured.
Monitoring stack (Grafana + Prometheus) is included.
Docker Compose will relaunch the stack after a system reboot if you enable:

```yaml
restart: always
```
in your docker-compose.yml.


