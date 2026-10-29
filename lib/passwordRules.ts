// Password rules for sign-up and reset. Supabase checks the same (Auth → Providers → Email:
// minimum length 10, "letters and digits"), so a form that skips this still can't save a weak one.
export const PASSWORD_MIN_LENGTH = 10;

export const passwordRules = [
  {
    label: `${PASSWORD_MIN_LENGTH} characters or more`,
    test: (p: string) => p.length >= PASSWORD_MIN_LENGTH,
  },
  { label: "Letters and numbers", test: (p: string) => /\p{L}/u.test(p) && /\d/.test(p) },
];

// What's wrong, in plain words, or null when the password can be saved.
export function passwordProblem(password: string, confirm: string) {
  if (!passwordRules.every((rule) => rule.test(password))) {
    return `Please use at least ${PASSWORD_MIN_LENGTH} characters, with letters and numbers.`;
  }
  if (password !== confirm) return "The two passwords don't match.";
  return null;
}
