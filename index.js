import express from "express";
import fetch from "node-fetch";
import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = "8028942186:AAHbloJnS0H4LhmVA3Q1hpoyJ5VtETvthqY";
const bot = new TelegramBot(BOT_TOKEN);
const app = express();

const REQUIRED_CHANNELS = [
  "@freefirelkies",
  "@KIFczlOSbYc5OWE9",
  "@kYroGKs753I4Njc1"
];

const WEBHOOK_URL = "https://YOUR_APP_NAME.vercel.app/api"; // change later

bot.setWebHook(`${WEBHOOK_URL}/bot${BOT_TOKEN}`);
app.use(express.json());

async function checkUserJoinedAll(userId) {
  for (let ch of REQUIRED_CHANNELS) {
    try {
      const res = await bot.getChatMember(ch, userId);
      if (
        res.status !== "member" &&
        res.status !== "administrator" &&
        res.status !== "creator"
      ) {
        return false;
      }
    } catch {
      return false;
    }
  }
  return true;
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  const joined = await checkUserJoinedAll(chatId);
  if (!joined) {
    bot.sendMessage(
      chatId,
      "🚫 You must join all the channels below before using the bot:\n\n" +
        "👉 [Join 1](https://t.me/freefirelkies)\n" +
        "👉 [Join 2](https://t.me/+KIFczlOSbYc5OWE9)\n" +
        "👉 [Join 3](https://t.me/+kYroGKs753I4Njc1)",
      { parse_mode: "Markdown" }
    );
    return;
  }

  if (text.startsWith("https://")) {
    bot.sendMessage(chatId, "⏳ Downloading video, please wait...");

    try {
      const apiUrl = `https://api.vidfly.ai/api/media/youtube/download?url=${encodeURIComponent(
        text
      )}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.status && data.data?.medias?.length) {
        const videoUrl = data.data.medias[0].url;
        bot.sendMessage(chatId, `✅ Download Link: ${videoUrl}`);
      } else {
        bot.sendMessage(chatId, "❌ Unable to fetch download link.");
      }
    } catch {
      bot.sendMessage(chatId, "⚠️ Error fetching video link.");
    }
  } else {
    bot.sendMessage(chatId, "🎥 Send a YouTube video link to download.");
  }
});

app.post(`/api/bot${BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("✅ Bot is running via webhook!");
});

export default app;