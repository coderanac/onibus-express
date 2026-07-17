import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SeatMap } from "./seat-map";

describe("SeatMap", () => {
  it("selects a free seat when clicked", async () => {
    const user = userEvent.setup();
    const onSelectSeat = jest.fn();

    render(
      <SeatMap
        totalSeats={10}
        occupiedSeats={[2]}
        selectedSeat={null}
        onSelectSeat={onSelectSeat}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Assento 5, livre/ }));

    expect(onSelectSeat).toHaveBeenCalledWith(5);
  });

  it("blocks clicks on an already occupied seat", async () => {
    const user = userEvent.setup();
    const onSelectSeat = jest.fn();

    render(
      <SeatMap
        totalSeats={10}
        occupiedSeats={[2]}
        selectedSeat={null}
        onSelectSeat={onSelectSeat}
      />,
    );

    const occupiedSeat = screen.getByRole("button", { name: /Assento 2, ocupado/ });
    expect(occupiedSeat).toBeDisabled();

    await user.click(occupiedSeat);
    expect(onSelectSeat).not.toHaveBeenCalled();
  });

  it("marks the selected seat as pressed", () => {
    render(
      <SeatMap
        totalSeats={10}
        occupiedSeats={[]}
        selectedSeat={4}
        onSelectSeat={jest.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: /Assento 4, selecionado/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
