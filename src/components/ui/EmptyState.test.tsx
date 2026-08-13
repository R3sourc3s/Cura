import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Inbox } from "lucide-react";
import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title and icon", () => {
    render(<EmptyState icon={Inbox} title="No residents yet" />);
    expect(screen.getByText("No residents yet")).toBeInTheDocument();
  });

  it("renders the description only when provided", () => {
    const { rerender } = render(<EmptyState icon={Inbox} title="Empty" description="Add your first one" />);
    expect(screen.getByText("Add your first one")).toBeInTheDocument();

    rerender(<EmptyState icon={Inbox} title="Empty" />);
    expect(screen.queryByText("Add your first one")).not.toBeInTheDocument();
  });

  it("does not render an action button when no action is given", () => {
    render(<EmptyState icon={Inbox} title="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("fires the action callback when its button is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<EmptyState icon={Inbox} title="Empty" action={{ label: "Add resident", onClick }} />);

    await user.click(screen.getByRole("button", { name: "Add resident" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
