import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import QueryProvider from "../src/providers/QueryProvider";
import { AuthProvider } from "../src/context/AuthContext";
import { LoginModalProvider } from "../src/context/LoginModalContext";

// The scan page is what someone reaches by pointing a camera at a dynamic
// code, so it is driven here the way the router drives it — through the
// /s/:slug route with the API stubbed, rather than by reaching for the card
// component directly.
vi.mock("../src/api/qrcode/publicQr", () => ({
  getPublicQr: vi.fn(),
  vcardFileUrl: (slug) => `/api/v1/public/qrs/${slug}/vcard`,
}));

import { getPublicQr } from "../src/api/qrcode/publicQr";
import ScanLanding from "../src/pages/ScanLanding";

// The query cache is keyed by slug and outlives a single test, so each case
// gets its own — otherwise the second render of "evt123" is served the first
// test's event and never calls the mock.
const renderScan = (slug) =>
  render(
    <QueryProvider>
      <GoogleOAuthProvider clientId="test-client-id">
        <MemoryRouter initialEntries={[`/s/${slug}`]}>
          <AuthProvider>
            <LoginModalProvider>
              <Routes>
                <Route path="/s/:slug" element={<ScanLanding />} />
              </Routes>
            </LoginModalProvider>
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>
    </QueryProvider>,
  );

const eventQr = (content) => ({
  typeKey: "event",
  type: "Event",
  name: content.title || "Event",
  content,
});

// Relative to today, never a fixed date. These were pinned to 2026-08-15, which
// was comfortably ahead when they were written and quietly became the past —
// so once the card learned to notice a finished event, two tests that meant to
// describe an invitation were describing an expired one instead.
const pad = (n) => String(n).padStart(2, "0");
const offsetDays = (days, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}`;
};
const WELL_AHEAD = 30;
const WELL_PAST = -30;

describe("Scanned event page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("offers an Add to Google Calendar link carrying the event", async () => {
    const SLUG = "evt-full";
    getPublicQr.mockResolvedValue(
      eventQr({
        title: "Team Offsite",
        start: offsetDays(WELL_AHEAD, 9),
        end: offsetDays(WELL_AHEAD, 17),
        location: "Chennai",
        description: "Bring a laptop",
      }),
    );
    renderScan(SLUG);

    const link = await screen.findByRole("link", {
      name: /add to google calendar/i,
    });
    const url = new URL(link.getAttribute("href"));
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("text")).toBe("Team Offsite");
    expect(url.searchParams.get("location")).toBe("Chennai");
    expect(url.searchParams.get("details")).toBe("Bring a laptop");
    expect(url.searchParams.get("dates")).toMatch(
      /^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/,
    );
  });

  it("opens in a new tab without handing Google the referrer window", async () => {
    const SLUG = "evt-newtab";
    getPublicQr.mockResolvedValue(
      eventQr({ title: "Launch", start: offsetDays(WELL_AHEAD, 9) }),
    );
    renderScan(SLUG);

    const link = await screen.findByRole("link", {
      name: /add to google calendar/i,
    });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("still shows the event details themselves", async () => {
    const SLUG = "evt-details";
    getPublicQr.mockResolvedValue(
      eventQr({
        title: "Team Offsite",
        start: offsetDays(WELL_AHEAD, 9),
        location: "Chennai",
      }),
    );
    renderScan(SLUG);
    expect(await screen.findByText("Team Offsite")).toBeInTheDocument();
    expect(screen.getByText("Chennai")).toBeInTheDocument();
  });

  it("says so when the event has already happened", async () => {
    const SLUG = "evt-past";
    getPublicQr.mockResolvedValue(
      eventQr({
        title: "Last Month's Meetup",
        start: offsetDays(WELL_PAST, 9),
        end: offsetDays(WELL_PAST, 17),
        location: "Chennai",
      }),
    );
    renderScan(SLUG);

    expect(await screen.findByText(/event ended/i)).toBeInTheDocument();
    expect(screen.getByText(/already taken place/i)).toBeInTheDocument();
  });

  it("stops offering to add a finished event to a calendar", async () => {
    const SLUG = "evt-past-nocta";
    getPublicQr.mockResolvedValue(
      eventQr({
        title: "Last Month's Meetup",
        start: offsetDays(WELL_PAST, 9),
        end: offsetDays(WELL_PAST, 17),
      }),
    );
    renderScan(SLUG);

    // Wait for the card, so the missing button below is a decision rather than
    // a page that has not loaded.
    expect(await screen.findByText("Last Month's Meetup")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: /add to google calendar/i }),
      ).not.toBeInTheDocument(),
    );
  });

  it("keeps showing the details of a finished event", async () => {
    // Someone scanning an old poster may still want to know what it was.
    const SLUG = "evt-past-details";
    getPublicQr.mockResolvedValue(
      eventQr({
        title: "Last Month's Meetup",
        start: offsetDays(WELL_PAST, 9),
        end: offsetDays(WELL_PAST, 17),
        location: "Chennai",
        description: "Bring a laptop",
      }),
    );
    renderScan(SLUG);

    expect(await screen.findByText("Last Month's Meetup")).toBeInTheDocument();
    expect(screen.getByText("Chennai")).toBeInTheDocument();
    expect(screen.getByText("Bring a laptop")).toBeInTheDocument();
  });

  it("marks an event that is under way right now", async () => {
    const SLUG = "evt-live";
    getPublicQr.mockResolvedValue(
      eventQr({
        title: "Happening Today",
        start: offsetDays(0, 0, 1),
        end: offsetDays(0, 23, 59),
      }),
    );
    renderScan(SLUG);

    expect(await screen.findByText(/happening now/i)).toBeInTheDocument();
    // Still worth adding — it is not over yet.
    expect(
      screen.getByRole("link", { name: /add to google calendar/i }),
    ).toBeInTheDocument();
  });

  it("hides the button when the event has no usable date", async () => {
    const SLUG = "evt-nodate";
    getPublicQr.mockResolvedValue(eventQr({ title: "Someday", start: "" }));
    renderScan(SLUG);

    // The card renders, so the absence below is a real decision, not a
    // still-loading page.
    expect(await screen.findByText("Someday")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: /add to google calendar/i }),
      ).not.toBeInTheDocument(),
    );
  });
});
