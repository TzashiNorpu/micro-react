const isProperty = (key) => key !== "children";

let nextUnitOfWork = null;

requestIdleCallback(workLoop);

// 递归渲染 -> 阻塞浏览器【js线程和浏览器GUI线程无法并行】
export const render = (element, container) => {
  // this is a fiber：渲染的一个单元
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
    sibling: null,
    child: null,
    parent: null,
  };
};

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

function performUnitOfWork(fiber) {
  if (!fiber.dom) fiber.dom = createDom(fiber);
  if (fiber.parent) fiber.parent.dom.append(fiber.dom);
  const elements = fiber.props.children;
  let prevFiber = null;
  let index = 0;
  // fiber tree 构建
  while (index < elements.length) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      parent: fiber,
      props: element.props,
      dom: null,
      child: null,
      sibling: null,
    };
    if (index === 0) fiber.child = newFiber;
    else prevFiber.sibling = newFiber;
    prevFiber = newFiber;
    index++;
  }
  // 节点的多个自己点以 sibling 节点链在一起
  // 渲染时先往下挨个渲染到最底层的 fiber ，之后再渲染 sibling ，最后往上挨个渲染当前层的 sibling
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

function createDom(fiber) {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  return dom;
}
