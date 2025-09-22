import "dotenv/config";

function toNumber(val: string | undefined, def: number) {
  const n = Number(val);
  return Number.isFinite(n) ? n : def;
}

export const CONFIG = {
  api: {
    url: "https://public-api.birdeye.so/defi/token_trending?",
    key: process.env.BIRDEYE_KEY ?? "",
    limit: toNumber(process.env.LIMIT, 50),
  },
  chains: (process.env.CHAINS ?? "solana")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  filter: {
    minPct24h: toNumber(process.env.MIN_PCT_24H, 10),
    minLiqUsd: toNumber(process.env.MIN_LIQ_USD, 50000),
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN ?? "",
    chatId: process.env.TELEGRAM_CHAT_ID ?? "",
  },
};

if (!CONFIG.api.key) {
  throw new Error("BIRDEYE_KEY is required in .env");
}
if (!CONFIG.telegram.token || !CONFIG.telegram.chatId) {
  console.warn(
    "[warn] Telegram credentials not set. Messages will not be sent.",
  );
}
