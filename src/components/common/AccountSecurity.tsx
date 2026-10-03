"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { PasswordInput } from "./PasswordInput";
import { Button } from "./Button";

export default function AccountSecurity() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    if (password !== confirmation) { setError("Passwords must match."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setConfirmation("");
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save your password. Please try again.");
    } finally { setSaving(false); }
  };

  return <section className="account-details__section" aria-label="Password settings">
    <h2 className="account-details__section-title">Password</h2>
    <p>Set or change your password for future sign-ins. You can still use an email code.</p>
    <form onSubmit={save}>
      <PasswordInput label="New password" aria-label="New password" autoComplete="new-password"
        required minLength={8} disabled={saving} value={password} onChange={(event) => { setPassword(event.target.value); setSaved(false); }} />
      <PasswordInput label="Confirm password" aria-label="Confirm password" autoComplete="new-password"
        required minLength={8} disabled={saving} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save password"}</Button>
      {error && <p role="alert">{error} If fresh authentication is required, sign in again with an email code.</p>}
      {saved && <p role="status">Password saved. You can now sign in with your email and password.</p>}
    </form>
  </section>;
}
