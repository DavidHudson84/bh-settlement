# Settlement Board

Shared checklist for the acquisition of the Steamatic business from the Pandamich
Trust into **BH Restoration Pty Ltd**, owned equally by Paul, Chris and David Hudson.

Live at **https://davidhudson84.github.io/bh-settlement/**

## What it is

385 items across 24 workstreams and 7 phases. Three people tick them off, assign
them to each other, set due dates and leave notes. Every change is attributed and
logged.

Phases run Foundations → Due diligence → Conditions precedent → Build the entity →
Transition → Cutover → First 90 days. **Phase 2 is the gate:** those items must
clear or the deal does not complete.

## How it is put together

Two files and a database.

- `index.html` — the whole app, no build step, no framework.
- `assets/config.js` — API URL, publishable key, cache-busting `BUILD` string.
- Supabase project `bh-settlement` (`fpfedspxtupffntienqr`, ap-southeast-2).

**No deal content lives in this repo.** Every item, note, price and name sits in
the database behind the access code. The repository is only the shell.

## Security model

There is no Supabase Auth in this app, and no email delivery to depend on.

Every table has row level security enabled with **no policies at all**, and all
privileges are revoked from the `anon` role. A direct read of `/rest/v1/items`
returns `permission denied`. The only way in is through the `board_*` functions,
which are `security definer` and each take a session token as their first argument.

`board_login(passcode, person)` checks a bcrypt hash held in a private schema,
then mints a 24-byte random token stored server-side and valid for 90 days.
Twenty-five failed attempts in an hour locks the door.

This means the publishable key in `assets/config.js` grants nothing on its own —
which is why the repository can be public without exposing the deal.

`board_set` only accepts the four columns a person is allowed to change (status,
owner, due date, note). Title, detail, phase and the critical flag cannot be
edited from the browser, so the checklist itself cannot be quietly rewritten.
`board_delete` refuses anything that was not added by hand.

## Rules for anyone changing this

1. **Bump `BUILD` in `assets/config.js` on every deploy.** GitHub Pages caches
   hard and the brothers will otherwise sit on a stale shell.
2. **Never commit the service role key or the access code.** The access code is
   shared verbally; only its bcrypt hash exists in the database.
3. **Never grant table privileges to `anon`.** Add a `board_*` function instead.
   The moment a table is readable directly, the passcode stops meaning anything.
4. **Content changes go through `board_seed`**, which upserts by item id and
   preserves everyone's status, owner, due dates and notes. Re-running it is safe.
5. **Item ids are permanent.** They appear in exports, notes and conversation.
   Never renumber them.

## Reseeding after a content change

Rebuild `seed.json` from the AIOS workspace, then:

```bash
curl -X POST "https://fpfedspxtupffntienqr.supabase.co/rest/v1/rpc/board_seed" \
  -H "apikey: <publishable key>" -H "Content-Type: application/json" \
  --data-binary @seedbody.json
```

where `seedbody.json` is `{"p_passcode":"<code>","p_payload":<seed.json>}`.
