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


let nextUnitOfWork = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    // 执行渲染 并返回下一次渲染的工作
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 没有足够的时间，请求下一次浏览器空闲时执行
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(nextUnitOfWork) {
  // TODO
}