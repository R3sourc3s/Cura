import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard/prn" }));
vi.mock("@/lib/auth", () => ({ logout: vi.fn() }));
vi.mock("@/context/UserContext", () => ({
  useUser: () => ({ can: () => true, user: { is_group_admin: false } }),
}));

import Sidebar from "./Sidebar";

describe("Sidebar", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens Residents and the active page's section by default, collapses the rest", () => {
    render(<Sidebar open onClose={() => {}} />);
    expect(screen.getByRole("link", { name: "Care Plans" })).toBeInTheDocument();       // Residents
    expect(screen.getByRole("link", { name: "PRN Medications" })).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Billing" })).not.toBeInTheDocument();    // Home & Admin
    expect(screen.getByRole("button", { name: /Home & Admin/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("remembers a toggled section", async () => {
    const { unmount } = render(<Sidebar open onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Home & Admin/ }));
    expect(screen.getByRole("link", { name: "Billing" })).toBeInTheDocument();
    unmount();
    render(<Sidebar open onClose={() => {}} />);
    expect(screen.getByRole("link", { name: "Billing" })).toBeInTheDocument();
  });

  it("opens the command palette from the search button", async () => {
    const handler = vi.fn();
    window.addEventListener("cura:open-command-palette", handler);
    render(<Sidebar open onClose={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /Search/ }));
    expect(handler).toHaveBeenCalled();
  });
});
