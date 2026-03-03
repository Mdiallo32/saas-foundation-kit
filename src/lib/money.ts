/** Shared currency formatter – USD, compact. */
export const fmtCurrency = (n: number, decimals: 0 | 2 = 0) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: decimals,
  }).format(n);
