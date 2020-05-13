/**
 *
 * @param {RegExp} regex expression that urls will be checked against.
 * @param {(() => (() => void) | void)} onMatch function called when a match is found. Optional return parameter of an onUnmatch function.
 */
function monitorUrlChanges(regex, onMatch) {
  let prevUrl = '';
  let onUnmatch = null;

  const obs = new MutationObserver(() => {
    const hasUrlChange = prevUrl !== window.location.href;
    const currMatches = regex.test(window.location.href);

    if (hasUrlChange && currMatches) {
      console.log(`BKZ: Url match ${window.location.href}`);
      if (onUnmatch) {
        onUnmatch();
        onUnmatch = null;
      }

      onUnmatch = onMatch();
    } else if (hasUrlChange && !currMatches && onUnmatch) {
      console.log(`BKZ: Url unmatch ${window.location.href}`);
      onUnmatch();
      onUnmatch = null;
    }

    if (hasUrlChange) {
      console.log(`BKZ: Url change ${prevUrl} -> ${window.location.href}`);
      prevUrl = window.location.href;
    }
  });

  obs.observe(document.documentElement, {
    attributes: false,
    childList: true,
    subtree: true
  });

  console.log(`BKZ: Monitoring url changes with ${regex}`);
  return obs.disconnect;
}
