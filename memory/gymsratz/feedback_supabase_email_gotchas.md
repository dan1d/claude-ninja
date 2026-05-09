---
name: Supabase email gotchas — free tier SMTP blocked, NULL columns crash GoTrue
description: Supabase free tier blocks outgoing SMTP. Dashboard-created users have NULL columns that crash auth. Use admin.generateLink() + Resend instead.
type: feedback
---

## Supabase Free Tier SMTP is Blocked

Custom SMTP configuration exists in config.toml and the dashboard, but the free tier firewalls outbound SMTP connections. Both ports 465 (SSL) and 587 (STARTTLS) timeout with 504. The setting is a UI lie on the free plan.

**Default emails come from `noreply@mail.app.supabase.io`** and get flagged as spam by Gmail.

## The Fix: admin.generateLink() + Your Own Email Service

```typescript
// Generate the recovery link WITHOUT sending email (requires service_role key)
const { data } = await supabase.auth.admin.generateLink({
  type: 'recovery',
  email,
  options: { redirectTo: 'https://yourapp.com/reset-password' }
});
// data.properties.action_link = verification URL

// Send via Resend (or any transactional email provider)
await resend.emails.send({
  from: 'YourApp <no-reply@yourdomain.com>',
  to: email,
  subject: 'Reset your password',
  html: recoveryTemplate({ url: data.properties.action_link }),
});
```

The `action_link` goes through Supabase's `/auth/v1/verify?token=...` for token verification, then redirects to your `redirectTo` URL with access/refresh tokens.

## NULL Column Gotcha

Users created via the Supabase dashboard (not via `signUp()`) have NULL values in:
- `confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change_token_current`, `reauthentication_token`
- `phone`, `email_change`

GoTrue is written in Go. `sql.Scan` crashes: `converting NULL to string is unsupported` → 500 on any auth operation touching these columns.

**Fix:**
```sql
UPDATE auth.users SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  email_change = COALESCE(email_change, ''),
  phone = COALESCE(phone, id::text)  -- phone has UNIQUE constraint
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change IS NULL
   OR phone IS NULL;
```

## Key Learnings

1. **Don't trust Supabase UI settings on the free tier** — test outbound connections before relying on them
2. **Always create users via the SDK**, not the dashboard, to avoid NULL column issues
3. **Use `admin.generateLink()` for any auth email you want to customize** — it's the clean separation between token management and email delivery
4. **Fire-and-forget for email**: `.catch(() => {})` — email failure must NOT fail the primary operation
5. **CWE-204 symmetric response**: password reset always returns `ok: true` regardless of whether email exists
