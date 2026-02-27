/** Shared currency formatter – USD, compact. */
export const fmtCurrency = (n: number, decimals: 0 | 2 = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
  }).format(n);
