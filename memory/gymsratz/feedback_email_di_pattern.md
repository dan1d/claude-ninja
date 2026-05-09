---
name: Transactional email DI pattern — EmailGateway interface
description: DI pattern for transactional emails. Interface + prod adapter + test fake. Fire-and-forget, CWE-204, optional gateway.
type: feedback
---

## Pattern: EmailGateway Interface with DI

Define a narrow interface. Prod wires a real adapter (Resend, SendGrid, etc.). Tests omit it or inject a spy.

```typescript
// gateway.ts — the interface
export interface EmailGateway {
  sendGymInvite(input: { to: string; gymName: string; inviteUrl: string; expiresAt: Date }): Promise<{ ok: boolean }>;
  sendPasswordRecovery(input: { to: string; recoveryUrl: string }): Promise<{ ok: boolean }>;
}

// deps.ts — optional in the composite deps
export interface AppDeps {
  email?: EmailGateway;  // absent = no emails sent, tests omit
}

// resend-gateway.ts — prod adapter
export function makeResendEmailGateway(apiKey: string): EmailGateway {
  const resend = new Resend(apiKey);
  return {
    async sendPasswordRecovery({ to, recoveryUrl }) {
      const { error } = await resend.emails.send({
        from: 'App <no-reply@yourdomain.com>',
        to,
        subject: 'Reset your password',
        html: recoveryTemplate({ recoveryUrl }),
      });
      return { ok: !error };
    },
  };
}
```

## Three Rules

1. **Fire-and-forget**: `deps.email?.send(...).catch(() => {})` — email failure must NEVER fail the primary operation (invite creation, account update, etc.)
2. **CWE-204 symmetric response**: Password reset always returns `ok: true` regardless of whether email exists or email was sent successfully. Never leak email existence.
3. **Optional gateway**: `if (deps.email) { ... }` — the system works without an email provider. Graceful degradation for dev/test environments without `RESEND_API_KEY`.

## Test Pattern

```typescript
// Test: email is sent on success
const sendPasswordRecovery = vi.fn().mockResolvedValue({ ok: true });
deps.email = { sendGymInvite: vi.fn(), sendPasswordRecovery };
// ... call procedure ...
expect(sendPasswordRecovery).toHaveBeenCalledWith({ to: 'user@test.com', recoveryUrl: '...' });

// Test: still succeeds when email rejects
deps.email = { sendPasswordRecovery: vi.fn().mockRejectedValue(new Error('SMTP down')) };
const result = await caller.requestPasswordReset({ email: 'user@test.com' });
expect(result).toEqual({ ok: true }); // fire-and-forget

// Test: works without email gateway
delete deps.email;
const result = await caller.requestPasswordReset({ email: 'user@test.com' });
expect(result).toEqual({ ok: true }); // graceful degradation
```
