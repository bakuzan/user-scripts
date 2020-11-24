/**
 *
 * @param {string} querySelector selector for target element
 * @param {string} parentQuerySelector selector to get parent element to observe
 */
function waitForElement(querySelector, parentQuerySelector) {
  return new Promise((resolve) => {
    const targetNode = document.querySelector(parentQuerySelector);
    const observer = new MutationObserver((mutationsList, observer) => {
      const item = mutationsList.find((x) => x.addedNodes.length);
      const hasAdded = item && item.addedNodes.length;
      const element = hasAdded ? targetNode.querySelector(querySelector) : null;

      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(targetNode, {
      attributes: false,
      childList: true,
      subtree: true
    });
  });
}
