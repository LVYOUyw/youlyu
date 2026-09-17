/* site-render.js — 根据 data/site-data.js 渲染 §01–§05 与页脚更新时间。
 * 依赖全局 SITE_DATA；在页面主脚本之前加载。 */
(function () {
  "use strict";
  if (typeof SITE_DATA === "undefined") return;

  var ME = "You Lyu"; // 作者列表中加粗显示的名字

  /* 会议/期刊 → 徽章配色 class；未识别的用通用金色徽章 */
  var VENUE_CLASS = {
    "eurocrypt": "b-euro",
    "asiacrypt": "b-asia",
    "esorics": "b-esorics",
    "iclr": "b-iclr",
    "ieee tmc": "b-tmc",
    "tmc": "b-tmc"
  };

  function badgeClass(venue) {
    return VENUE_CLASS[String(venue).trim().toLowerCase()] || "b-generic";
  }

  /* 根据链接自动生成链接标签 */
  function linkLabel(link) {
    try {
      var host = new URL(link).hostname.replace(/^www\./, "");
      if (host === "doi.org") return "DOI";
      if (host === "openreview.net") return "OpenReview";
      if (host === "ieeexplore.ieee.org") return "IEEE Xplore";
      if (host === "eprint.iacr.org") return "ePrint";
    } catch (e) {}
    return "Link";
  }

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function ext(url) { // 外链属性
    return ' href="' + esc(url) + '" target="_blank" rel="noopener"';
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>';

  function renderAuthors(authors) {
    return authors.map(function (a) {
      var name = esc(a.name);
      var inner = (a.name === ME) ? "<strong>" + name + "</strong>" : name;
      if (a.link && a.name !== ME) return "<a" + ext(a.link) + ">" + inner + "</a>";
      return inner;
    }).join(", ");
  }

  function renderPub(p) {
    var label = p.linkLabel || linkLabel(p.link);
    return (
      '<li class="pub reveal">' +
        '<div class="pub-top">' +
          '<span class="badge ' + badgeClass(p.venue) + '">' + esc(p.venue) + "</span>" +
          '<span class="pub-year">' + esc(p.year) + "</span>" +
          '<a class="pub-link"' + ext(p.link) + ">" + esc(label) + " " + ARROW + "</a>" +
        "</div>" +
        '<h3 class="pub-title"><a' + ext(p.link) + ">" + esc(p.title) + "</a></h3>" +
        '<p class="pub-authors">' + renderAuthors(p.authors) + "</p>" +
        (p.note ? '<p class="pub-venue-note">' + esc(p.note) + "</p>" : "") +
      "</li>"
    );
  }

  /* ---------- §01 Research ---------- */
  var rc = document.getElementById("research-content");
  if (rc && SITE_DATA.research) {
    var r = SITE_DATA.research;
    rc.appendChild(el('<p class="research-lead reveal">' + r.lead + "</p>"));
    rc.appendChild(el('<p class="research-sub reveal">' + r.sub + "</p>"));
    var chips = el('<div class="chips reveal"></div>');
    r.chips.forEach(function (c) { chips.appendChild(el('<span class="chip">' + esc(c) + "</span>")); });
    rc.appendChild(chips);
  }

  /* ---------- §02 Publications ---------- */
  var pc = document.getElementById("publications-content");
  if (pc && SITE_DATA.publications) {
    var groups = [
      { type: "conference", title: "Conference Papers" },
      { type: "journal", title: "Journal Papers" }
    ];
    groups.forEach(function (g) {
      var pubs = SITE_DATA.publications.filter(function (p) { return p.type === g.type; });
      if (!pubs.length) return;
      var grp = el('<div class="pub-group"></div>');
      grp.appendChild(el('<p class="pub-group-title reveal">' + g.title + "</p>"));
      var ul = el('<ul class="pub-list"></ul>');
      pubs.forEach(function (p) { ul.appendChild(el(renderPub(p))); });
      grp.appendChild(ul);
      pc.appendChild(grp);
    });
  }

  /* ---------- §03 Education ---------- */
  var ec = document.getElementById("education-content");
  if (ec && SITE_DATA.education) {
    var ol = el('<ol class="timeline"></ol>');
    SITE_DATA.education.forEach(function (e) {
      var li = el(
        '<li class="reveal"><span class="t-dot"></span>' +
        '<p class="t-time">' + esc(e.time) + "</p>" +
        '<h3 class="t-degree">' + esc(e.degree) +
          (e.tag ? '<span class="t-tag">' + (e.tagLink ? "<a" + ext(e.tagLink) + ">" + esc(e.tag) + "</a>" : esc(e.tag)) + "</span>" : "") +
        "</h3>" +
        '<p class="t-org">' + (e.orgLink ? "<a" + ext(e.orgLink) + ">" + esc(e.org) + "</a>" : esc(e.org)) + (e.orgSuffix || ", China") + "</p>" +
        (e.note ? '<p class="t-note">' + e.note + "</p>" : "") +
        "</li>"
      );
      ol.appendChild(li);
    });
    ec.appendChild(ol);
  }

  /* ---------- §04 Teaching ---------- */
  var tc = document.getElementById("teaching-content");
  if (tc && SITE_DATA.teaching) {
    var ul2 = el('<ul class="teach-list"></ul>');
    SITE_DATA.teaching.forEach(function (t) {
      ul2.appendChild(el(
        '<li class="teach reveal">' +
        '<span class="teach-code">' + esc(t.code) + "</span>" +
        '<span class="teach-name">' + esc(t.name) + "</span>" +
        '<span class="teach-meta">' + esc(t.meta) + "</span>" +
        "</li>"
      ));
    });
    tc.appendChild(ul2);
  }

  /* ---------- §05 Service ---------- */
  var sc = document.getElementById("service-content");
  if (sc && SITE_DATA.service) {
    sc.appendChild(el('<p class="service-text reveal">' + SITE_DATA.service.text + "</p>"));
    var chips2 = el('<div class="chips reveal"></div>');
    SITE_DATA.service.items.forEach(function (c) { chips2.appendChild(el('<span class="chip">' + esc(c) + "</span>")); });
    sc.appendChild(chips2);
  }

  /* ---------- Footer last updated ---------- */
  var lu = document.getElementById("last-updated");
  if (lu && SITE_DATA.updated) lu.textContent = SITE_DATA.updated;
})();
