import {render} from "./micro_react"
import {createElement} from "./micro_react"

const element = createElement(
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
render(element, node);