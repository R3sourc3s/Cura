import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/lib/api";
import { useSafetyCheck } from "./SafetyCheck";

function blocked(overridable: boolean) {
  return new ApiError("Safety issue", 409, {
    safety_issues: [{ code: "prn_interval", message: "Last dose was 1h ago.", overridable }],
    overridable,
  });
}

function Harness({ fn, onDone }: { fn: (reason?: string) => Promise<string>; onDone: (r: string | null) => void }) {
  const { guard, dialog } = useSafetyCheck();
  return (
    <>
      <button onClick={() => guard(fn).then(onDone)}>Give</button>
      {dialog}
    </>
  );
}

describe("useSafetyCheck", () => {
  it("retries with the override reason when the issue is overridable", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(blocked(true))
      .mockResolvedValueOnce("saved");
    const onDone = vi.fn();
    render(<Harness fn={fn} onDone={onDone} />);

    await userEvent.click(screen.getByText("Give"));
    expect(await screen.findByText("Last dose was 1h ago.")).toBeInTheDocument();
    expect(screen.getByText("Override and record")).toBeDisabled();

    await userEvent.type(screen.getByRole("textbox"), "GP verbal order");
    await userEvent.click(screen.getByText("Override and record"));

    expect(fn).toHaveBeenLastCalledWith("GP verbal order");
    expect(onDone).toHaveBeenCalledWith("saved");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("offers no override when the issue is not overridable", async () => {
    const fn = vi.fn().mockRejectedValueOnce(blocked(false));
    const onDone = vi.fn();
    render(<Harness fn={fn} onDone={onDone} />);

    await userEvent.click(screen.getByText("Give"));
    expect(await screen.findByText("Dose blocked")).toBeInTheDocument();
    expect(screen.queryByText("Override and record")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("Close"));
    expect(onDone).toHaveBeenCalledWith(null);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
