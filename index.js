import fetch from "node-fetch";

const BOT_TOKEN = "8028942186:AAHbloJnS0H4LhmVA3Q1hpoyJ5VtETvthqY";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const YT_API = "https://api.vidfly.ai/api/media/youtube/download?url=";

const REQUIRED_CHANNELS = [
  "@freefirelkies",
  "https://t.me/+KIFczlOSbYc5OWE9",
  "https://t.me/+kYroGKs753I4Njc1"
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("✅ YouTube Downloader Bot is Live on Vercel!");
  }

  const update = req.body;
  if (!update.message) return res.status(200).end();

  const chatId = update.message.chat.id;
  const userId = update.message.from.id;
  const text = (update.message.text || "").trim();

  // Check if user joined all required channels
  for (const channel of REQUIRED_CHANNELS) {
    if (channel.startsWith("https://")) continue;
    const resCheck = await fetch(`${API_URL}/getChatMember?chat_id=${channel}&user_id=${userId}`);
    const data = await resCheck.json();
    const status = data?.result?.status || "";
    if (!["member", "administrator", "creator"].includes(status)) {
      await sendMessage(
        chatId,
        `⚠️ Please join all these channels first to use the bot:\n\n${REQUIRED_CHANNELS.join("\n")}`
      );
      return res.status(200).end();
    }
  }

  // Handle commands
  if (text === "/start") {
    await sendMessage(chatId, "🎬 Send any YouTube video link to download it instantly!");
  } else if (text.startsWith("http") && text.includes("youtube.com")) {
    const videoUrl = text;
    await sendMessage(chatId, "⏳ Fetching your download link...");
    try {
      const apiRes = await fetch(`${YT_API}${encodeURIComponent(videoUrl)}`);
      const data = await apiRes.json();
      if (data && data.url) {
        await sendMessage(chatId, `✅ Download Link:\n${data.url}`);
      } else {
        await sendMessage(chatId, "❌ Unable to fetch download link. Try again later.");
      }
    } catch (err) {
      await sendMessage(chatId, "⚠️ Error fetching video link. Please try again later.");
    }
  } else {
    await sendMessage(chatId, "📩 Send a valid YouTube video link!");
  }

  res.status(200).end();
}

async function sendMessage(chatId, text) {
  await fetch(`${API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}