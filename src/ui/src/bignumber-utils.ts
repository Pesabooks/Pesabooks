import { BigNumber, ethers } from 'ethers';

export const formatBigNumber = (
  amount: string | BigNumber | undefined,
  decimals: number,
  digits = 4,
) => {
  if (!amount) return;
  const rawFormattedAmount = ethers.utils.formatUnits(amount, decimals);

  if (!rawFormattedAmount) {
    return;
  }

  const amountN = Number(rawFormattedAmount);

  if (isNaN(amountN)) return;

  if (Number.isInteger(amountN)) return amountN;

  const formatted = amountN.toFixed(digits);

  // if amout is 0.00002391, to fixed(4) will be 0.000. use instead toPrecision
  return Number(formatted.endsWith('0') ? amountN.toPrecision(digits) : formatted);
};

export const formatCurrency = (amount: number | string, digits = 2) => {
  const numericAmount = +amount;
  if (isNaN(numericAmount)) return null;
  return numericAmount.toFixed(digits);
};
