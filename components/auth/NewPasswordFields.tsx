import { Check, Circle } from "lucide-react";
import Field from "@/components/ui/Field";
import { PASSWORD_MIN_LENGTH, passwordRules } from "@/lib/passwordRules";

// Password + "confirm password" for sign-up and reset, with the rules ticking off as you type.
// The form checks passwordProblem() before sending.
export default function NewPasswordFields({
  label,
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
}: {
  label: string;
  password: string;
  confirm: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
}) {
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <>
      <div className="flex flex-col gap-2">
        <Field
          label={label}
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          aria-describedby="password-rules"
          required
        />
        <ul id="password-rules" className="flex flex-col gap-1 text-sm">
          {passwordRules.map((rule) => {
            const met = rule.test(password);
            return (
              <li
                key={rule.label}
                className={`flex items-center gap-2 ${met ? "text-ok" : "text-ink-muted"}`}
              >
                {met ? <Check size={16} aria-hidden /> : <Circle size={16} aria-hidden />}
                {rule.label}
                <span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-1">
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => onConfirmChange(e.target.value)}
          autoComplete="new-password"
          aria-invalid={mismatch}
          required
        />
        {mismatch && <p className="text-sm text-danger">The two passwords don&apos;t match.</p>}
      </div>
    </>
  );
}
