(function () {
  function getTopCitations(topNumber = null) {
    const citePaths = ".reflist:not(.reflist-lower-alpha) .reference-text";
    const citations = Array.from(document.querySelectorAll(citePaths)).reduce(
      (p, c) => {
        const key = c.querySelector("a")?.href ?? c.innerText;
        return p.set(key, [...(p.get(key) ?? []), c.innerText]);
      },
      new Map([])
    );

    const mostReferenced = Array.from(citations.entries())
      .sort(([_, a], [__, b]) => b.length - a.length)
      .slice(0, topNumber ?? citations.length);

    return mostReferenced.map(([href, texts]) => {
      const ref = {
        text: texts.pop(),
        link: href,
        count: texts.length,
      };

      console.log(ref);
      return ref;
    });
  }

  const refs = getTopCitations(10);
  const newPageTitle = `Top Citations for ${document.title}`;
  const container = document.createElement("ol");
  container.style.cssText = "font-size:22px;";

  for (const r of refs) {
    const el = document.createElement("li");
    const content = `${r.text} (${r.count} references)`;

    if (r.link) {
      const anchor = document.createElement("a");
      anchor.href = r.link;
      anchor.innerText = content;
      el.append(anchor);
    } else {
      el.innerText = content;
    }

    container.append(el);
  }

  const w = window.open("about:blank", "_blank");
  w.document.title = newPageTitle;
  w.document.body.append(container);
})();
