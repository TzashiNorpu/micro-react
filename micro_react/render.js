export const render = (element, container) => {
  const dom = element.type == 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(element.type);

  const isProperty = key => key !== 'children';

  Object.keys(element.props).
    filter(isProperty).
    forEach(name => {
      console.log('name=', name, ',value=', element.props[name]);
      const value = element.props[name];
      dom[name] = value;
    });
  element.props.children.forEach(child => render(child, dom));
  container.appendChild(dom);
}
