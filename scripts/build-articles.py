import argparse
import html
import re
import urllib.request
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content" / "source"
OUTPUT = ROOT / "dist" / "posts"
SLUGS = [
    "ai-mv-agent-architecture",
    "langgraph-browser-use-test-agent",
    "agent-testing-blog",
    "langsmith-testing-experience",
    "langgraph-langchain-learning-notes",
]
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.parts = []
        self.metadata = {}
        self.headings = []
        self.depth = 0
        self.capture = None
        self.heading = None
        self.found = False

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        classes = attributes.get("class", "").split()
        if not self.depth and "post-content" in classes and not self.found:
            self.depth = 1
            self.found = True
            return
        if self.depth:
            markup = self.get_starttag_text()
            if tag in {"h1", "h2", "h3", "h4"}:
                identifier = attributes.get("id") or f"section-{len(self.headings) + 1:02d}"
                if "id" not in attributes:
                    markup = markup[:-1] + f' id="{identifier}">'
                self.heading = {"tag": tag, "id": identifier, "text": ""}
            self.parts.append(markup)
            if tag not in VOID_TAGS:
                self.depth += 1
        else:
            for key in ("post-title", "post-category", "post-date"):
                if key in classes:
                    self.capture = (key, tag)
                    self.metadata[key] = ""

    def handle_startendtag(self, tag, attributes):
        if self.depth:
            self.parts.append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if self.depth:
            if self.heading and self.heading["tag"] == tag:
                self.heading["text"] = html.unescape(self.heading["text"]).strip()
                self.headings.append(self.heading)
                self.heading = None
            if tag not in VOID_TAGS:
                self.depth -= 1
            if self.depth:
                self.parts.append(f"</{tag}>")
        if self.capture and self.capture[1] == tag:
            self.capture = None

    def handle_data(self, data):
        if self.depth:
            self.parts.append(data)
            if self.heading:
                self.heading["text"] += data
        elif self.capture:
            self.metadata[self.capture[0]] += data

    def handle_entityref(self, name):
        self.handle_data(f"&{name};")

    def handle_charref(self, name):
        self.handle_data(f"&#{name};")

    def handle_comment(self, data):
        if self.depth:
            self.parts.append(f"<!--{data}-->")


def load_article(slug):
    parser = ArticleParser()
    parser.feed((SOURCE / f"{slug}.html").read_text(encoding="utf-8"))
    if not parser.found or parser.depth or not parser.parts:
        raise ValueError(f"Could not extract the complete article: {slug}")
    title = html.unescape(parser.metadata["post-title"]).strip()
    category = html.unescape(parser.metadata["post-category"]).strip()
    date_parts = re.findall(r"\d+", parser.metadata["post-date"])
    if len(date_parts) != 3:
        raise ValueError(f"Invalid article date: {slug}")
    year, month, day = map(int, date_parts)
    return {"slug": slug, "title": title, "category": category, "date": f"{year:04d}-{month:02d}-{day:02d}", "body": "".join(parser.parts), "headings": parser.headings}


def article_link(article, label):
    return f'<a href="{article["slug"]}.html"><span class="section-kicker">{label}</span><strong>{html.escape(article["title"])}</strong><span aria-hidden="true">↗</span></a>'


def render_article(article, index, articles):
    title = html.escape(article["title"])
    category = html.escape(article["category"])
    date = article["date"]
    heading_links = "".join(f'<a href="#{heading["id"]}">{html.escape(heading["text"])}</a>' for heading in article["headings"] if heading["tag"] == "h2")
    adjacent = []
    if index > 0:
        adjacent.append(article_link(articles[index - 1], "← 上一篇"))
    if index + 1 < len(articles):
        adjacent.append(article_link(articles[index + 1], "下一篇 →"))
    return f'''<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#111111">
    <meta name="description" content="{title} · gxj 测试与工程手记">
    <title>{title} · gxj</title>
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="../article.css">
    <script src="../assets/vendor/mermaid-10.9.5.min.js" defer></script>
    <script src="../article.js" defer></script>
  </head>
  <body class="article-page" id="top">
    <a class="skip-link" href="#article-content">跳到文章正文</a>
    <div class="reading-progress" aria-hidden="true"><span id="reading-progress"></span></div>
    <header class="site-header">
      <a class="brand" href="../index.html" aria-label="gxj 首页">gxj<span>.</span></a>
      <button class="menu-toggle" type="button" aria-label="打开导航" aria-expanded="false" aria-controls="main-nav"><span></span><span></span></button>
      <nav id="main-nav" aria-label="主导航"><a href="../index.html">首页</a><a href="../blog.html" class="active" aria-current="location">博客 <span class="nav-count">{len(articles)}</span></a><a href="../projects.html">项目</a></nav>
      <a class="header-cta" href="../blog.html">阅读手记 <span aria-hidden="true">↗</span></a>
    </header>
    <main class="article-main">
      <div class="article-toolbar">
        <a class="article-back" href="../blog.html"><span aria-hidden="true">←</span> 返回博客列表</a>
        <nav class="article-breadcrumb" aria-label="面包屑导航"><a href="../blog.html">技术博客</a><span aria-hidden="true">/</span><span>{category}</span></nav>
      </div>
      <header class="article-masthead"><p class="section-kicker">GXJ / ENGINEERING NOTES <span class="article-index">{index + 1:02d} / {len(articles):02d}</span></p><h1>{title}<span class="pink">.</span></h1><div class="article-byline"><span class="article-category-label">{category}</span><time datetime="{date}">{date.replace("-", ".")}</time><span>作者 / gxj</span><button class="article-share" id="share-article" type="button">复制链接 <span aria-hidden="true">↗</span></button></div></header>
      <div class="article-layout">
        <article class="article-body" id="article-content">{article["body"]}</article>
        <aside class="article-sidebar" aria-label="文章目录"><div class="article-toc"><p class="section-kicker">ON THIS PAGE / 目录</p><nav aria-label="文章章节">{heading_links}</nav><a class="toc-back" href="#top">回到文章顶部 ↑</a></div></aside>
      </div>
      <div class="article-reading-end"><span class="mono">END OF ARTICLE</span><a href="../blog.html">← 返回博客列表</a></div>
      <nav class="article-adjacent" aria-label="其他文章">{"".join(adjacent)}</nav>
    </main>
    <footer class="site-footer site-footer-compact"><div class="footer-bottom"><span>© <span id="footer-year">2026</span> gxj · 测试与工程手记</span><span class="mono">BUILT WITH CURIOSITY.</span><a class="back-top" href="#top">回到顶部 <span aria-hidden="true">↑</span></a></div></footer>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  </body>
</html>
'''


def main():
    arguments = argparse.ArgumentParser()
    arguments.add_argument("--refresh", action="store_true", help="Refresh the five original article snapshots before building")
    options = arguments.parse_args()
    if options.refresh:
        SOURCE.mkdir(parents=True, exist_ok=True)
        for slug in SLUGS:
            url = f"https://pgh11.github.io/pgh-blog/posts/{slug}.html"
            with urllib.request.urlopen(url, timeout=30) as response:
                (SOURCE / f"{slug}.html").write_bytes(response.read())
    articles = [load_article(slug) for slug in SLUGS]
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for index, article in enumerate(articles):
        destination = OUTPUT / f"{article['slug']}.html"
        destination.write_text(render_article(article, index, articles), encoding="utf-8")
        print(f"Built {destination.name}: {len(article['body'])} characters, {len(article['headings'])} headings")


if __name__ == "__main__":
    main()
