const CreateElement = (element: string, className: string) => {
  const createdElement = document.createElement(element);

  createdElement.classList = className;

  return createdElement;
};

const PushElements = (parent: Element, children: Element[]) => {
  children.forEach((child) => {
    parent.appendChild(child);
  });
};

const GetBody = () => {
  return document.body;
};

export { CreateElement, PushElements, GetBody };
