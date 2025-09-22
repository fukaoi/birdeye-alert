import fetch from "node-fetch";
import { CONFIG } from "./config.js";

export type TrendingToken = {
  symbol?: string;
  address?: string;
  priceChange24h?: number;
  liquidityUSD?: number;
  v24hUSD?: number;
};

export async function fetchTrending(chain: string): Promise<TrendingToken[]> {
  const url = new URL(CONFIG.api.url);
  url.searchParams.set("limit", String(CONFIG.api.limit));
  url.searchParams.set("sort_by", "rank");
  url.searchParams.set("sort_type", "asc");

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "X-API-KEY": CONFIG.api.key,
      "x-chain": chain,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Birdeye(${chain}) HTTP ${res.status}: ${text}`);
  }
  const json = (await res.json()) as any;
  const rows: TrendingToken[] = json?.data ?? [];
  return rows;
}

export function filterMovers(rows: TrendingToken[]) {
  const { minPct24h, minLiqUsd } = CONFIG.filter;
  return rows.filter(
    (t) =>
      (t.priceChange24h ?? 0) >= minPct24h &&
      (t.liquidityUSD ?? 0) >= minLiqUsd,
  );
}
