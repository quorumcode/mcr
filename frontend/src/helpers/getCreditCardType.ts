type CardType = "visa" | "amex" | "mastercard";

export function getCreditCardType(number: string): CardType | undefined {
  if (
    /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(
      number
    )
  ) {
    return "mastercard";
  } else if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(number)) {
    return "visa";
  } else if (/^3[47][0-9]{13}$/.test(number)) {
    return "amex";
  }
  return undefined;
}
