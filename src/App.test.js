import { render } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  test("Component renders", () => {
    const { container } = render(<App />);
    expect(container.getElementsByClassName("App").length).toBe(1);
  });
});
