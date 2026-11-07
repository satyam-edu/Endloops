<p align="center">
  <img src="src/assets/endloops-logo.png" alt="Endloops" width="280" />
</p>

# Endloops website

A multi-page marketing site for Endloops, a company that builds automation for accountants, auditors, finance teams and property management companies.

**Live:** https://endloops-sepia.vercel.app/

The idea behind it: the software prepares the work, and a person reviews, decides and signs off. The home page tells that as a scroll story. Documents travel along a conveyor and are read, compared, checked and drafted. Then the machine stops and waits for the visitor to sign off.

## Pages

- **Home:** the 3D scroll story, the two ways to work with Endloops, a reconciliation demo and the closing call to action.
- **Solutions:** end-to-end solutions that run a whole process.
- **Tools:** standalone tools, with a filter by capability.
- **About:** where Endloops comes from and where it is heading.
- **Contact:** a form with validation. It checks the fields and says plainly that this build does not send messages.

## Stack

React 19, TypeScript, Tailwind CSS v4, Vite and React Router. The 3D scene is plain three.js with no wrapper library, loaded separately so the first screen stays light. Fonts are self-hosted.

## Run it

```bash
npm install
npm run dev      # development server
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

## Where to change things

- Products and their one-line descriptions: `src/data/products.ts`
- Page copy: the matching file in `src/pages/`, and `src/home/HomeSections.tsx` for the lower half of the home page
- Colours, fonts and shared styles: `src/index.css`
- The 3D scene: `src/home/loopScene.ts`, driven by the scroll position from `src/pages/Home.tsx`
- Routing and the page title for each route: `src/main.tsx` and `src/components/Layout.tsx`

## Notes

- The 3D scene is skipped for visitors with reduced-motion settings, no WebGL or no graphics card. They get the same content as flowing text.
- Illustrative figures in the demo are labelled "Illustrative data".
- The site is marked `noindex`, so search engines will not list it.
- Routing relies on the rewrite in `vercel.json`, so every path serves the app.

The Endloops logo is used with permission for this assignment only.
