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

describe("Scanned event page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("offers an Add to Google Calendar link carrying the event", async () => {
    const SLUG = "evt-full";
    getPublicQr.mockResolvedValue(
      eventQr({
        title: "Team Offsite",
        start: "2026-08-15T09:00",
        end: "2026-08-15T17:00",
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
      eventQr({ title: "Launch", start: "2026-08-15T09:00" }),
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
        start: "2026-08-15T09:00",
        location: "Chennai",
      }),
    );
    renderScan(SLUG);
    expect(await screen.findByText("Team Offsite")).toBeInTheDocument();
    expect(screen.getByText("Chennai")).toBeInTheDocument();
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
