import { CONFIG } from "./config.js";
import { fetchTrending, filterMovers } from "./birdeye.js";
import { sendTelegram } from "./notify.js";

const fmtUsd = (n?: number) =>
  typeof n === "number"
    ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : "-";

async function runOnce() {
  const all: Array<{ chain: string } & any> = [];

  for (const chain of CONFIG.chains) {
    try {
      const rows = await fetchTrending(chain);
      // 1sec delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const movers = filterMovers(rows).map((t) => ({ ...t, chain }));
      all.push(...movers);
    } catch (e: any) {
      // await sendTelegram(
      //   `⚠️ <b>${chain}</b> fetch error: <code>${e.message}</code>`,
      // );
    }
  }

  if (all.length === 0) {
    console.log("No movers matched the filters.");
    return;
  }

  all.sort((a, b) => (b.priceChange24h ?? 0) - (a.priceChange24h ?? 0));

  const top = all.slice(0, 10);
  const lines = top.map(
    (x) =>
      `• <b>${x.chain}</b> / <b>${x.symbol ?? "-"}</b>  <code>+${(x.priceChange24h ?? 0).toFixed(1)}%</code>  ` +
      `Liq:${fmtUsd(x.liquidityUSD)}  Vol24h:${fmtUsd(x.v24hUSD)}`,
  );

  const msg =
    `🚀 <b>Birdeye Trending Movers</b>\n` +
    `Filter: 24h ≥ ${CONFIG.filter.minPct24h}%, Liquidity ≥ ${fmtUsd(CONFIG.filter.minLiqUsd)}\n\n` +
    lines.join("\n");

  // await sendTelegram(msg);
}

runOnce()
  .then((data) => {
    console.log("Run completed successfully.");
    console.log(data);
  })
  .catch(async (e) => {
    console.error(e.message);
    // await sendTelegram(`❌ Fatal error: <code>${e.message}</code>`);
    process.exit(1);
  });
