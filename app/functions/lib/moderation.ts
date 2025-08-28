const FORBIDDEN_PATTERNS = [
  /virement/i,
  /solde/i,
  /balance/i,
  /transfer/i,
  /carte de cr(é|e)dit/i,
  /credit card/i,
  /mot de passe/i,
  /password/i,
  /OTP/i,
  /selfie/i,
];

export function moderate(query: string): { isAllowed: boolean; reason?: string } {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(query)) {
      return {
        isAllowed: false,
        reason: 'La demande concerne une opération bancaire ou des données sensibles non autorisées.',
      };
    }
  }
  return { isAllowed: true };
}
