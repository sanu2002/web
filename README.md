This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Notes

- app/lib/definitions.ts contains interfaces

## Mobile prototype (Vanna v7)

A self-contained click-through of the v7 mobile app lives in `public/prototype/`.

```bash
npm run prototype        # no install needed
```

- `http://localhost:4173/` compares Android devices side by side: Compact 360×640, Galaxy A15, Galaxy S24, Pixel 8, Pixel 8 Pro, Z Fold (open), and Galaxy Tab S9 in portrait and landscape. Every frame runs the live prototype at its real dp size, with an Android status bar and gesture bar. Taps sync across devices, and theme, approval outcome and zoom apply to every frame.
- `http://localhost:4173/vanna-v7.html` is the single-device prototype, with a device picker in the side panel.

The prototype is also served by the Next app at `/prototype/` (the access middleware skips that path).

What was added on top of the exported prototype:
- Screens size to the device instead of a fixed 412×915.
- At 600dp and wider (foldables and tablets), content sits in a centred column, the bottom nav and docked CTAs line up with it, and bottom sheets become floating dialogs.
- Android back works three ways: swipe in from the left edge, the browser or hardware back button, or Esc/Backspace.
- Taps show pressed feedback. Small links and chips get at least a 44dp touch area. Sheets never run past the top of short screens.
- Toasts sit above the bottom nav, like an Android snackbar, instead of covering the status bar.
