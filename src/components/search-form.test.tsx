import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "./search-form";

describe("SearchForm", () => {
  it("submits the filled origin, destination and date", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<SearchForm onSearch={onSearch} />);

    await user.type(screen.getByLabelText("Origem"), "São Paulo");
    await user.type(screen.getByLabelText("Destino"), "Rio de Janeiro");
    await user.type(screen.getByLabelText("Data de ida"), "01082026");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).toHaveBeenCalledWith({
      origin: "São Paulo",
      destination: "Rio de Janeiro",
      date: "2026-08-01",
    });
  });

  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    const onSearch = jest.fn();

    render(<SearchForm onSearch={onSearch} />);
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("disables the search button while loading", () => {
    render(<SearchForm onSearch={jest.fn()} isLoading />);

    expect(screen.getByRole("button", { name: "Carregando..." })).toBeDisabled();
  });
});
