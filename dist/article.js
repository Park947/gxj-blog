"use strict";

(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("main-nav");
  const article = document.getElementById("article-content");
  let toastTimer;

  function setMenu(open) {
    navigation.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
  }

  function toast(message) {
    const element = document.getElementById("toast");
    clearTimeout(toastTimer);
    element.textContent = message;
    element.classList.add("visible");
    toastTimer = setTimeout(() => element.classList.remove("visible"), 3000);
  }

  async function copyText(text, button, message) {
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "已复制 ✓";
      setTimeout(() => { button.textContent = original; }, 1800);
      toast(message);
    } catch {
      toast("无法自动复制，请手动选择并复制。");
    }
  }

  document.getElementById("share-article").addEventListener("click", event => copyText(location.href, event.currentTarget, "文章链接已复制"));
  article.querySelectorAll("pre").forEach(block => {
    const content = block.querySelector("code")?.textContent || block.textContent;
    block.tabIndex = 0;
    block.setAttribute("aria-label", "代码示例，可横向滚动");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-copy";
    button.textContent = "复制代码";
    button.addEventListener("click", () => copyText(content, button, "代码已复制"));
    block.append(button);
  });
  article.querySelectorAll("table").forEach(table => {
    let wrapper = table.parentElement;
    if (!wrapper.classList.contains("table-wrap")) {
      wrapper = document.createElement("div");
      wrapper.className = "table-wrap";
      table.before(wrapper);
      wrapper.append(table);
    }
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-label", "数据表格，可横向滚动");
  });

  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  navigation.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", event => {
    if (!event.target.closest(".site-header")) setMenu(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuToggle.focus();
    }
  });

  const headings = [...article.querySelectorAll("h2[id]")];
  const tocLinks = [...document.querySelectorAll(".article-toc nav a")];
  let scrollPending = false;
  function updateReading() {
    const available = document.documentElement.scrollHeight - innerHeight;
    document.getElementById("reading-progress").style.width = `${available > 0 ? Math.min(100, scrollY / available * 100) : 0}%`;
    let active = headings[0]?.id;
    headings.forEach(heading => {
      if (heading.getBoundingClientRect().top <= 120) active = heading.id;
    });
    tocLinks.forEach(link => {
      if (link.hash === `#${active}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scrollPending = false;
  }
  addEventListener("scroll", () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateReading);
    }
  }, { passive: true });
  addEventListener("resize", () => {
    if (innerWidth > 640) setMenu(false);
    updateReading();
  });
  updateReading();

  document.getElementById("footer-year").textContent = new Date().getFullYear();

  async function renderDiagrams() {
    const diagrams = [...article.querySelectorAll(".mermaid")];
    if (!diagrams.length || !window.mermaid) return;
    window.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "base", fontFamily: 'Arial, "PingFang SC", sans-serif', themeVariables: { primaryColor: "#e9e5db", primaryTextColor: "#111111", primaryBorderColor: "#6c6c67", lineColor: "#6c6c67", secondaryColor: "#4ed4ea", tertiaryColor: "#ffd3e5", background: "#f5f3ee" }, flowchart: { htmlLabels: true, useMaxWidth: true } });
    for (const diagram of diagrams) {
      const original = diagram.textContent;
      try {
        await window.mermaid.run({ nodes: [diagram] });
        diagram.dataset.rendered = "true";
        diagram.tabIndex = 0;
        diagram.setAttribute("role", "region");
        diagram.setAttribute("aria-label", "架构流程图，可横向滚动");
        const svg = diagram.querySelector("svg");
        const originalWidth = svg?.viewBox.baseVal.width;
        if (svg && originalWidth > diagram.clientWidth) {
          const tools = document.createElement("div");
          tools.className = "diagram-tools";
          const label = document.createElement("span");
          label.textContent = "架构图 / 可放大查看细节";
          const toggle = document.createElement("button");
          toggle.type = "button";
          toggle.textContent = "放大查看 ↗";
          toggle.setAttribute("aria-pressed", "false");
          toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-pressed") !== "true";
            toggle.setAttribute("aria-pressed", String(expanded));
            toggle.textContent = expanded ? "适应宽度 ↙" : "放大查看 ↗";
            diagram.dataset.expanded = String(expanded);
            svg.style.width = expanded ? `${Math.ceil(originalWidth)}px` : "";
            if (!expanded) diagram.scrollTo({ top: 0, left: 0 });
            updateReading();
          });
          tools.append(label, toggle);
          diagram.before(tools);
        }
      } catch {
        diagram.textContent = original;
        diagram.removeAttribute("data-processed");
        diagram.dataset.rendered = "fallback";
        const message = document.createElement("p");
        message.className = "diagram-fallback";
        message.textContent = "此图暂以原始流程图定义展示，内容完整保留。";
        diagram.after(message);
      }
    }
    updateReading();
  }
  renderDiagrams();
})();
