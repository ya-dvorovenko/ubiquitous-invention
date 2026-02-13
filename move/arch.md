## Scope
### Main
Search bar (name or address)
List of creators from Registry
"Sign in with Google" (Enoki) or "Connect Wallet"

### Creator Profile

Name, bio, subscriber count
Post list: title + preview visible to all
"Subscribe (X SUI)" button
If already subscribed: badge showing status

### Post View

Subscribed? -> fetch blob from Walrus, Seal decrypt, show content
Not subscribed? -> show preview + paywall CTA

### Creator Dashboard (simplest possible)

Text input: title, content, preview
"Publish" button -> encrypt with Seal, upload to Walrus, call publish_post()