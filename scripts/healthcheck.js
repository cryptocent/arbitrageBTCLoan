// scripts/healthcheck.js
const fs = require('fs');

try {
    // Simple healthcheck: verify SearcherBot exists
    fs.accessSync('./scripts/searcherBot.js');
    console.log("SearcherBot is present.");
    process.exit(0);
} catch (err) {
    console.error("SearcherBot missing or inaccessible.");
    process.exit(1);
}
