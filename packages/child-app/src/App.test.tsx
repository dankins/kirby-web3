import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

afterAll(() => {
  console.log("should do tear down now");
});

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
