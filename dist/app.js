"use strict";

(() => {
  const articles = [...window.GXJ_ARTICLES].sort((first, second) => second.date.localeCompare(first.date));
  const grid = document.getElementById("article-grid");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("main-nav");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function dateLabel(date) {
    return date.replaceAll("-", ".");
  }

  function articleUrl(article) {
    return `posts/${article.slug}.html`;
  }

  function visualMarkup(article) {
    if (article.visual === "graph") return '<div class="visual-graph"><i></i><b></b><i></i><b></b><i></i></div>';
    if (article.visual === "trace") return '<div class="visual-trace"><span></span><span></span><span></span><span></span></div>';
    if (article.visual === "grid") return `<div class="visual-grid"><b>${escapeHtml(article.word)}</b></div>`;
    if (article.visual === "brackets") return '<div class="visual-brackets">{ }</div>';
    if (article.visual === "target") return '<div class="visual-target"><span></span></div>';
    return `<div class="visual-type">${escapeHtml(article.word)}<span>${escapeHtml(article.subline)}</span></div>`;
  }

  function cardMarkup(article, index) {
    const title = escapeHtml(article.title);
    const href = articleUrl(article);
    return `<article class="article-card">
      <a class="article-cover cover-${article.color}" href="${href}" tabindex="-1" aria-hidden="true">
        <div class="cover-caption"><span>${escapeHtml(article.label)}</span><span>${String(index + 1).padStart(2, "0")}</span></div>
        <div class="cover-art">${visualMarkup(article)}</div>
        <span class="cover-bottom">GXJ / FIELD NOTES</span><span class="cover-arrow"><svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg></span>
      </a>
      <div class="article-info"><span class="article-category">${escapeHtml(article.category)}</span><time class="article-date" datetime="${article.date}">${dateLabel(article.date)}</time></div>
      <h3><a href="${href}">${title}</a></h3>
      <p class="article-excerpt">${escapeHtml(article.summary)}</p>
      <div class="article-bottom"><a href="${href}" aria-label="阅读全文：${title}">阅读全文 <span aria-hidden="true">→</span></a><span class="mono">GXJ / 全文</span></div>
    </article>`;
  }

  function renderArticles() {
    if (!grid) return;
    grid.innerHTML = articles.map(cardMarkup).join("");
    document.getElementById("results-count").textContent = `共 ${articles.length} 篇文章`;
  }

  function syncRoute() {
    const legacyPages = { "#journal": "blog.html", "#projects": "projects.html" };
    if (document.body.classList.contains("home-page") && legacyPages[location.hash]) {
      location.replace(legacyPages[location.hash]);
      return;
    }
    const prefix = "#article/";
    if (!location.hash.startsWith(prefix)) return;
    const slug = location.hash.slice(prefix.length);
    const article = articles.find(item => item.slug === slug);
    if (article) {
      location.replace(articleUrl(article));
      return;
    }
    location.replace("blog.html");
  }

  function setMenu(open) {
    navigation.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
  }

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
  let scrollPending = false;
  function updateHomeViewport() {
    if (document.body.classList.contains("home-page") && !CSS.supports("height", "100dvh")) {
      document.body.style.setProperty("--home-viewport-height", `${innerHeight}px`);
    }
  }

  function updateScroll() {
    const available = document.documentElement.scrollHeight - innerHeight;
    document.getElementById("reading-progress").style.width = `${available > 0 ? Math.min(100, scrollY / available * 100) : 0}%`;
    scrollPending = false;
  }
  addEventListener("scroll", () => {
    if (!scrollPending) {
      requestAnimationFrame(updateScroll);
      scrollPending = true;
    }
  }, { passive: true });
  addEventListener("resize", () => {
    if (innerWidth > 640) setMenu(false);
    updateHomeViewport();
    updateScroll();
  });
  addEventListener("hashchange", syncRoute);
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  document.querySelector(".nav-count").textContent = articles.length;
  renderArticles();
  syncRoute();
  updateHomeViewport();
  updateScroll();
})();
