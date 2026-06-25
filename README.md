# HelviNav Content Studio

This repository contains the standalone Sanity Studio for HelviNav editorial posts.

Sanity project:

- Project ID: `kltpvgen`
- Dataset: `production`

This studio is for public editorial content only.
Do not store private data, emails, users, billing data, secrets, or contact messages here.

## Run locally

```bash
npm install
npm run dev
```

If you prefer the Sanity CLI directly:

```bash
npx sanity dev
```

## Build

```bash
npm run build
```

Or:

```bash
npx sanity build
```

## Deploy to Sanity hosting

```bash
npm run deploy
```

Or:

```bash
npx sanity deploy
```

If Sanity asks for a hostname during deployment, use the studio hostname you configure in Sanity, for example `helvinav.sanity.studio`.

## Create an article

1. Open the Studio.
2. Create a new `Article`.
3. Fill in `title`, `slug`, `language`, and at least the body content.
4. Add `excerpt`, `coverImage`, `seoTitle`, and `seoDescription` if needed.
5. Set `published` to `true`.
6. Set `publishedAt` to the publication date.

## Publish

Set `published` to `true`, fill `publishedAt`, then publish the document from the Studio UI.

## Notes

- Sanity is the editorial CMS only.
- The public HelviNav site stays separate.
- No API tokens are required for normal Studio use.
- The Studio uses the logged-in Sanity user.
