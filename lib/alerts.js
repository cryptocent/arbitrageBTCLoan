// lib/alerts.js
const axios = require("axios");

async function sendAlert(message) {
    if (!process.env.WEBHOOK_URL) {
        console.warn("[ALERT] WEBHOOK_URL is not configured");
        return;
    }

    try {
        await axios.post(process.env.WEBHOOK_URL, {
            content: `[BOT ALERT] ${message}`
        });
        console.log("[ALERT] Notification sent");
    } catch (err) {
        console.error("[ALERT] Failed to send notification:", err.message);
    }
}

module.exports = { sendAlert };
