// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "searcher-bot",
      script: "scripts/searcherBot.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "crosschain-bot",
      script: "scripts/crossChainBot.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
