# Key Decisions

#meta #memory

Architectural decisions made — context for why, so future sessions don't second-guess them.

## Redis db/1
Use db/1 (not db/0). Daniel runs multiple projects on the same Redis instance.

## QBO OAuth: AJAX + window.top
`QboConnectionsController#new` returns JSON with `redirect_url`. React calls via `authenticatedFetch`, then `window.top.location.href` to escape the Shopify Admin iframe.
Why: Full-page nav from iframe → MissingJwtTokenError. SameSite=Lax blocks session cookies on cross-site AJAX.

## company_id via URL param
Passed as `/auth/quickbooks_oauth2?company_id=1`, forwarded by OmniAuth via `request.env["omniauth.params"]`.
Why: Rails session lost between AJAX and OAuth callback (SameSite=Lax).

## AfterAuthenticateJob as string
`config.after_authenticate_job = { job: "AfterAuthenticateJob", inline: false }` — string, not constant.
Why: Initializer runs before eager loading; constant reference causes NameError at boot.

## Shopify session stub pattern (RSpec)
