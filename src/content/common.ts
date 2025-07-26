const CreateElementClassName = <K extends keyof HTMLElementTagNameMap>(
  element: K,
  className: string
) => {
  const createdElement = document.createElement(element);

  createdElement.classList = className;

  return createdElement;
};

const CreateElementId = <K extends keyof HTMLElementTagNameMap>(
  element: K,
  id: string
) => {
  const createdElement = document.createElement(element);

  createdElement.id = id;

  return createdElement;
};

const CreateElement = <K extends keyof HTMLElementTagNameMap>(element: K) => {
  return document.createElement(element);
};

const PushElements = (parent: Element, children: Element[]) => {
  children.forEach((child) => {
    parent.appendChild(child);
  });
};

const GetBody = () => {
  return document.body;
};

export {
  CreateElementClassName,
  CreateElementId,
  CreateElement,
  PushElements,
  GetBody,
};
