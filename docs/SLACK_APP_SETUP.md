# Slack app setup (Builders.to)

If notifications and the `/builders` command are not working, or you see **"Sending messages to this app has been turned off"**, complete these steps in your Slack app configuration.

## 1. OAuth & Permissions – Bot Token Scopes only

In [api.slack.com/apps](https://api.slack.com/apps) → your app → **OAuth & Permissions**:

Add these scopes under **Bot Token Scopes** (the top section). Do **not** add anything under User Token Scopes — we don’t use user tokens, and `commands` is only available as a Bot Token Scope.

**Bot Token Scopes** (add all three):

- `chat:write` – post messages (notifications, reminders)
- `im:write` – open and post to DMs (required for notifications to users)
- `commands` – slash command `/builders` (only appears under Bot Token Scopes)

If you add or change scopes, **reinstall the app** to your workspace (Install App → Reinstall to Workspace). Then copy the new **Bot User OAuth Token** into `.env` as `SLACK_BOT_TOKEN`.

## 2. App Home – allow messages

In your app → **App Home**:

1. Under **Show Tabs**, turn **on** the **Messages** tab (if it exists).
2. Enable: **"Allow users to send Slash commands and messages from the messages tab"** (or equivalent “allow messages” option).

This setting is what removes **"Sending messages to this app has been turned off"** and allows the app to send and receive as expected.

## 3. Slash command and Interactivity

- **Slash Commands**: Add command `/builders`, Request URL: `https://builders.to/api/slack/commands`.
- **Interactivity & Shortcuts**: Turn **On**, Request URL: `https://builders.to/api/slack/commands` (same as above, for modal submit).

Use your real domain (e.g. `https://builders.to`) in both URLs.

## 4. Environment variables

In `.env`:

- `SLACK_BOT_TOKEN` – Bot User OAuth Token from OAuth & Permissions (after installing the app).
- `SLACK_CLIENT_ID` – from Basic Information → App Credentials.
- `SLACK_CLIENT_SECRET` – from Basic Information → App Credentials.
- `SLACK_SIGNING_SECRET` – from Basic Information → App Credentials.

Redirect URL for OAuth: `https://builders.to/api/slack/callback` (add under OAuth & Permissions → Redirect URLs).

## Summary checklist

- [ ] Bot Token Scopes only (not User Token Scopes): `chat:write`, `im:write`, `commands`
- [ ] App reinstalled to workspace after adding scopes
- [ ] App Home: Messages tab / “Allow users to send Slash commands and messages” enabled
- [ ] Slash command `/builders` → Request URL `https://builders.to/api/slack/commands`
- [ ] Interactivity Request URL → `https://builders.to/api/slack/commands`
- [ ] All four Slack env vars set and server restarted
