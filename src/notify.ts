import fetch from "node-fetch";
import { CONFIG } from "./config.js";

export async function sendTelegram(text: string) {
  const { token, chatId } = CONFIG.telegram;
  if (!token || !chatId) {
    console.log("[dry-run]", text);
    return;
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram send failed: ${err}`);
  }
}
