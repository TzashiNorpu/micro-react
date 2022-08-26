import { render, useState } from "./micro_react";
import { createElement } from "./micro_react";

const container = document.querySelector("#app");

/* const element = createElement(
  'h1',
  {style: 'background-color:skyblue;color:red', id: 'title'},
  'Hello world',
  createElement(
    'a',
    {href: 'https://www.bilibili.com', style: 'color:yellow'},
    'Bilibili')
);
console.log(element);
render(element, container); */

/* const handleChange = (e) => {
  renderx(e.target.value);
};

const renderx = (value) => {
  console.log(1);
  const element = createElement(
    "div",
    null,
    createElement("input", {
      value: value,
      oninput: (e) => {
        handleChange(e);
      },
    }),
    createElement("h2", null, value)
  );

  render(element, container);
};

renderx("Hello"); */

/* const App = (props) => {
  return createElement("h1", null, "Hixxx", props.name);
};
const element = createElement(App, { name: "kelvin" });
render(element, container); */

const Counter = () => {
  const [state, setState] = useState(0);
  return createElement(
    "h1",
    { onclick: () => setState((prev) => prev + 1) },
    state
  );
};

const element = createElement(Counter);
render(element, container);
