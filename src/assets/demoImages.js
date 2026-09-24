import demoPortrait from './demo-portrait.jpg'

// Demo imagery for the landing page's scan mockups.
//
// PORTRAIT — photo by LinkedIn Sales Solutions on Unsplash
// (unsplash.com/photos/pAtA8xe_iVM). The Unsplash licence covers commercial
// use, and these are released portraits. Cropped square and resized to 192px,
// 2x the 80px it renders at; the original 640x960 was ~8x the bytes for no more
// pixels on screen.
//
// A file rather than a data URI. The first version of this inlined it, on the
// reasoning that the landing page is prerendered and a URL costs a round-trip —
// but the mockups sit below the fold behind LazyMount and Suspense, so they are
// not in the prerendered HTML at all. All inlining actually did was put 13KB of
// base64 in the entry bundle, which every route pays for and only this section
// uses. As a file it is fetched when the section mounts, cached on its own
// hash, and absent from the JS.
//
// An illustrated avatar used to sit here and read as a placeholder. The point
// of the mockup is that you can upload a real photo, so it has to show one.
export const DEMO_PORTRAIT = demoPortrait

// COMPANY MARK — an invented company, drawn here rather than taken from anyone.
// A real brand's mark in this slot would read as a claim that they are a
// customer. Not the Liffto mark either: on a sample scan page that read as a
// watermark we stamp onto everyone's pages, which is the opposite of the
// promise three sections up. This slot belongs to whoever is looking at it.
//
// Inline, because at 300 bytes the request would cost more than the bytes.
export const DEMO_COMPANY_MARK =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMTEiIGZpbGw9IiMxMzRFNEEiLz48cGF0aCBkPSJNMjAgMTAuNSAzMCAyOEgxMHoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMjAgMTkuNSAyNC44IDI4aC05LjZ6IiBmaWxsPSIjMTM0RTRBIi8+PC9zdmc+Cg=='
