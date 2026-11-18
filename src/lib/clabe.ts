/**
 * Whether an 18-digit Mexican CLABE passes its check digit.
 *
 * The last digit is computed from the first 17 with weights 3, 7, 1 (repeating):
 * each product mod 10, the sum mod 10, then (10 - that) mod 10. One mistyped
 * digit fails it, so the form catches what the bank would otherwise reject
 * after the money was sent. Same rule as the API (`isValidClabe` in @offerhub/shared).
 */
export function isValidClabe(clabe: string): boolean {
  if (!/^\d{18}$/.test(clabe)) return false;
  const weights = [3, 7, 1];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += (Number(clabe[i]) * weights[i % 3]) % 10;
  }
  return (10 - (sum % 10)) % 10 === Number(clabe[17]);
}
