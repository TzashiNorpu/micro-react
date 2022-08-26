const isProperty = (key) => key !== "children";
const isEvent = (key) => key.startsWith("on");

let nextUnitOfWork = null;
// work in progress
let wipRoot = null;

let deletions = null;

// 上次渲染
let currentRoot = null;

requestIdleCallback(workLoop);

// 递归渲染 -> 阻塞浏览器【js线程和浏览器GUI线程无法并行】
export const render = (element, container) => {
  // function  render  (element, container)  {
  // this is a fiber：渲染的一个单元
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    sibling: null,
    child: null,
    parent: null,
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];
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
  // 更新结束时进行同步提交
  if (!nextUnitOfWork && wipRoot) commitRoot();
}

function performUnitOfWork(fiber) {
  // 异步创建和渲染 dom 节点，会被打断[单个fiber的创建和和append不会被打断，但是不同fiber之间的
  // append 会被打断，导致视图bug，所以createDom防止这里没有问题]
  if (!fiber.dom) fiber.dom = createDom(fiber);
  // if (fiber.parent) fiber.parent.dom.append(fiber.dom);
  reconcileChildren(fiber, fiber.props.children);
  /* const elements = fiber.props.children;
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
  } */
  // 节点的多个自己点以 sibling 节点链在一起
  // 渲染时先往下挨个渲染到最底层的 fiber ，之后再渲染 sibling ，最后往上挨个渲染当前层的 sibling
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // 如果有alternate，就返回它的child，没有，就返回undefined
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  let prevSibling = null;

  // 注意这里是或
  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = oldFiber && element && oldFiber.type === element.type;

    let newFiber = null;

    if (sameType) {
      // 更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        // 继承dom
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      // 新建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }
    // 按层 diff

    // 下一个oldFiber
    if (oldFiber) oldFiber = oldFiber.sibling;
    // 构建 fiber tree
    // 第一个child才可以作为child，其他的就是sibling
    if (index === 0) wipFiber.child = newFiber;
    else prevSibling.sibling = newFiber;
    prevSibling = newFiber;
    index++;
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

function commitRoot() {
  deletions.forEach((item) => commitWork(item));
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

// 递归提交
function commitWork(fiber) {
  if (!fiber) return;
  // if (!fiber.dom) fiber.dom = createDom(fiber);
  const domParent = fiber.parent.dom;
  // domParent.appendChild(fiber.dom);
  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION" && fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    // dom，之前的props，现在的props
    updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function updateDOM(dom, prevProps, nextPorps) {
  // 删除已经没有的props
  Object.keys(prevProps)
    .filter((key) => key != "children" && !isEvent(key))
    // 不在nextProps中
    .filter((key) => !key in nextPorps)
    .forEach((key) => {
      // 清空属性
      dom[key] = "";
    });

  // 添加新增的属性/修改变化的属性
  Object.keys(nextPorps)
    .filter((key) => key !== "children" && !isEvent(key))
    // 不再prevProps中
    .filter((key) => !key in prevProps || prevProps[key] !== nextPorps[key])
    .forEach((key) => {
      dom[key] = nextPorps[key];
    });

  // 删除事件处理函数
  Object.keys(prevProps)
    .filter(isEvent)
    // 新的属性没有，或者有变化
    .filter((key) => !key in nextPorps || prevProps[key] !== nextPorps[key])
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[key]);
    });

  // 添加新的事件处理函数
  Object.keys(nextPorps)
    .filter(isEvent)
    .filter((key) => prevProps[key] !== nextPorps[key])
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextPorps[key]);
    });
}
