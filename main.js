import { render } from "./micro_react";
import { createElement } from "./micro_react";

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

const node = document.querySelector("#app");
render(element, node); */

const handleChange = (e) => {
  renderx(e.target.value);
};

const container = document.querySelector("#app");

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

renderx("Hello");
