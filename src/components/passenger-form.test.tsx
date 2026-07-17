import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import { api } from "@/lib/api-client";
import type { TripDto } from "@/lib/types";
import { PassengerForm } from "./passenger-form";

jest.mock("@/lib/api-client", () => ({
  api: {
    createReservation: jest.fn(),
  },
}));

const trip: TripDto = {
  id: "trip-1",
  routeId: "route-1",
  departureAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  basePrice: 200,
  totalSeats: 40,
  route: {
    id: "route-1",
    origin: "São Paulo",
    destination: "Rio de Janeiro",
    durationMinutes: 360,
  },
};

describe("PassengerForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation errors and blocks submission with empty fields", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <PassengerForm trip={trip} seatNumber={5} onSuccess={jest.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(await screen.findByText("Informe seu nome completo.")).toBeInTheDocument();
    expect(screen.getByText("CPF inválido.")).toBeInTheDocument();
    expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
    expect(api.createReservation).not.toHaveBeenCalled();
  });

  it("rejects an invalid CPF even when other fields are valid", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(
      <PassengerForm trip={trip} seatNumber={5} onSuccess={jest.fn()} />,
    );

    await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
    await user.type(screen.getByLabelText("CPF"), "111.111.111-11");
    await user.type(screen.getByLabelText("E-mail"), "maria@example.com");
    await user.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(await screen.findByText("CPF inválido.")).toBeInTheDocument();
    expect(api.createReservation).not.toHaveBeenCalled();
  });

  it("submits the reservation with valid data and calls onSuccess with the code", async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    (api.createReservation as jest.Mock).mockResolvedValue({ code: "ABC-12345" });

    renderWithQueryClient(
      <PassengerForm trip={trip} seatNumber={5} onSuccess={onSuccess} />,
    );

    await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
    await user.type(screen.getByLabelText("CPF"), "529.982.247-25");
    await user.type(screen.getByLabelText("E-mail"), "maria@example.com");
    await user.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("ABC-12345"));
    expect(api.createReservation).toHaveBeenCalledWith({
      tripId: "trip-1",
      seatNumber: 5,
      passengerName: "Maria Silva",
      passengerCpf: "529.982.247-25",
      passengerEmail: "maria@example.com",
    });
  });
});
