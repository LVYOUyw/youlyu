/* ============================================================
 * editor.js — edit.html「主页内容编辑器」的逻辑
 * ------------------------------------------------------------
 * 纯函数（可在 Node 中单独测试）：
 *   buildDataFile(data)   → 生成完整 site-data.js 文件文本
 *   parseAuthors(text)    → 把「一行一个 姓名 | 链接」解析为数组
 *   formatAuthors(arr)    → 把作者数组转回多行文本
 * DOM 绑定：
 *   SiteEditor.init()     → 由 edit.html 在加载 data/site-data.js 后调用
 * ============================================================ */
(function (global) {
  "use strict";

  /* ---------------- 纯函数 ---------------- */

  /* 生成文件头部注释（与仓库中 data/site-data.js 保持一致） */
  var FILE_HEADER = [
    "/* ============================================================",
    " * site-data.js — 站点内容数据（唯一需要维护的文件）",
    " * ------------------------------------------------------------",
    " * 发表新论文：在 publications 数组开头（或合适位置）添加一项即可：",
    " *",
    " *   {",
    ' *     type: "conference",              // "conference" 或 "journal"',
    ' *     venue: "EUROCRYPT",              // 会议/期刊简称（徽章文字）',
    " *     year: 2026,",
    ' *     title: "Paper Title",',
    ' *     link: "https://doi.org/...",     // 论文链接（DOI / OpenReview / ...）',
    " *     authors: [                       // 作者按顺序；link 可省略",
    ' *       { name: "You Lyu" },',
    ' *       { name: "Shengli Liu", link: "http://english.seiee.sjtu.edu.cn/english/detail/841_671.htm" }',
    " *     ],",
    ' *     note: ""                         // 可选，标题下方小字（如期刊全名）',
    " *   }",
    " *",
    " * 说明：",
    " *  - linkLabel 可不填，会根据链接自动生成（doi.org→DOI，openreview→OpenReview，ieee→IEEE Xplore）",
    " *  - research / service 的文字、education 的 note 字段允许使用简单 HTML（如 <a>、<em>）",
    " *  - updated 会显示在页脚；用编辑器（edit.html）导出时会自动更新",
    " * ============================================================ */"
  ].join("\n");

  /* 生成完整 site-data.js 文件文本（JSON 即合法 JS） */
  function buildDataFile(data) {
    return FILE_HEADER + "\nconst SITE_DATA = " + JSON.stringify(data, null, 2) + ";\n";
  }

  /* 把「一行一个：姓名 | 主页链接(可选)」的文本解析为 [{ name, link? }]。
   * 容忍全角竖线「｜」与多余空格；链接里如含 | 会按原样拼回。 */
  function parseAuthors(text) {
    return String(text == null ? "" : text)
      .split(/\r?\n/)
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line !== ""; })
      .map(function (line) {
        var parts = line.split(/[|｜]/);
        var name = String(parts.shift() || "").trim();
        var link = parts.join("|").trim();
        var author = { name: name };
        if (link) author.link = link;
        return author;
      });
  }

  /* 把 [{ name, link? }] 转回「一行一个：姓名 | 链接」的多行文本。 */
  function formatAuthors(arr) {
    if (!Array.isArray(arr)) return "";
    return arr
      .map(function (a) {
        if (!a) return "";
        var name = String(a.name == null ? "" : a.name).trim();
        var link = String(a.link == null ? "" : a.link).trim();
        if (!name) return "";
        return link ? name + " | " + link : name;
      })
      .filter(function (line) { return line !== ""; })
      .join("\n");
  }

  /* ---------------- 以下仅在浏览器中使用 ---------------- */

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function currentMonthString() {
    var d = new Date();
    return MONTHS[d.getMonth()] + " " + d.getFullYear();
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function byteSize(s) {
    if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(s).length;
    return unescape(encodeURIComponent(s)).length;
  }

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ---------------- 编辑器初始化（DOM 绑定） ---------------- */

  function initEditor() {
    /* 注意：必须用裸标识符 SITE_DATA——data/site-data.js 用 const 声明，
     * const 产生全局词法绑定但不挂在 window 上，window.SITE_DATA 是 undefined */
    if (typeof SITE_DATA === "undefined") {
      document.body.insertAdjacentHTML(
        "afterbegin",
        '<div style="max-width:980px;margin:20px auto;padding:16px 24px;' +
        'border:1px solid #c05757;border-radius:12px;color:#f0a0a0;' +
        'font-family:monospace">未能加载 data/site-data.js（SITE_DATA 未定义），' +
        '请确认通过本地服务器（npm run dev）访问本页面。</div>'
      );
      return;
    }

    /* 工作副本：所有修改先写入 data，导出时再序列化 */
    var data = JSON.parse(JSON.stringify(SITE_DATA));
    var dirty = false;

    var $ = function (sel) { return document.querySelector(sel); };

    function markDirty() {
      dirty = true;
      schedulePreview();
    }

    window.addEventListener("beforeunload", function (e) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    });

    /* ---------- 通用绑定小工具 ---------- */

    /* 文本类输入 → data 字段；empty 时删除字段以保持数据干净 */
    function bindText(input, obj, key, opts) {
      opts = opts || {};
      input.addEventListener("input", function () {
        var v = input.value;
        if (opts.number) {
          var n = parseInt(v, 10);
          if (v.trim() === "") delete obj[key];
          else obj[key] = isNaN(n) ? v : n; // 非数字暂存原文，校验会标红
        } else if (opts.omitEmpty && v.trim() === "") {
          delete obj[key];
        } else {
          obj[key] = v;
        }
        markDirty();
      });
    }

    function moveItem(arr, i, delta, rerender) {
      var j = i + delta;
      if (j < 0 || j >= arr.length) return;
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      markDirty();
      rerender();
    }

    function bindOps(card, arr, i, rerender, label) {
      card.querySelector('[data-op="up"]').addEventListener("click", function () {
        moveItem(arr, i, -1, rerender);
      });
      card.querySelector('[data-op="down"]').addEventListener("click", function () {
        moveItem(arr, i, +1, rerender);
      });
      card.querySelector('[data-op="del"]').addEventListener("click", function () {
        if (confirm("确定删除这" + label + "吗？")) {
          arr.splice(i, 1);
          markDirty();
          rerender();
        }
      });
    }

    function bindToggle(card) {
      var head = card.querySelector(".item-card-head");
      head.addEventListener("click", function (e) {
        if (e.target.closest(".card-ops")) return; // 操作按钮不触发折叠
        card.classList.toggle("open");
      });
    }

    /* ---------- 静态字段：研究方向 / 学术服务 / 更新时间 ---------- */

    var leadEl = $("#research-lead");
    leadEl.value = data.research.lead || "";
    bindText(leadEl, data.research, "lead");

    var subEl = $("#research-sub");
    subEl.value = data.research.sub || "";
    bindText(subEl, data.research, "sub");

    var chipsEl = $("#research-chips");
    chipsEl.value = (data.research.chips || []).join("\n");
    chipsEl.addEventListener("input", function () {
      data.research.chips = chipsEl.value.split(/\r?\n/)
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s !== ""; });
      markDirty();
    });

    var svcTextEl = $("#service-text");
    svcTextEl.value = data.service.text || "";
    bindText(svcTextEl, data.service, "text");

    var svcItemsEl = $("#service-items");
    svcItemsEl.value = (data.service.items || []).join("\n");
    svcItemsEl.addEventListener("input", function () {
      data.service.items = svcItemsEl.value.split(/\r?\n/)
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s !== ""; });
      markDirty();
    });

    var updatedEl = $("#site-updated");
    updatedEl.value = data.updated || "";
    bindText(updatedEl, data, "updated", { omitEmpty: true });

    $("#btn-current-month").addEventListener("click", function () {
      updatedEl.value = currentMonthString();
      data.updated = updatedEl.value;
      markDirty();
    });

    /* ---------- 论文列表 ---------- */

    var pubsContainer = $("#pubs-container");

    function pubCardHTML(p, i) {
      return (
        '<div class="item-card pub-card open" data-index="' + i + '">' +
          '<div class="item-card-head">' +
            '<span class="collapse-arrow">▸</span>' +
            '<span class="head-badge">' + esc(p.venue || "未命名") + "</span>" +
            '<span class="head-year mono">' + esc(p.year == null ? "—" : p.year) + "</span>" +
            '<span class="head-title">' + esc(p.title || "（无标题）") + "</span>" +
            '<span class="card-ops">' +
              '<button type="button" data-op="up" title="上移">↑</button>' +
              '<button type="button" data-op="down" title="下移">↓</button>' +
              '<button type="button" data-op="del" class="op-del" title="删除">删除</button>' +
            "</span>" +
          "</div>" +
          '<div class="item-card-body">' +
            '<div class="grid-2">' +
              '<label class="field"><span class="field-label">类型 *</span>' +
                '<select class="f-type">' +
                  '<option value="conference"' + (p.type === "conference" ? " selected" : "") + ">conference（会议）</option>" +
                  '<option value="journal"' + (p.type === "journal" ? " selected" : "") + ">journal（期刊）</option>" +
                "</select></label>" +
              '<label class="field"><span class="field-label">年份 *</span>' +
                '<input type="number" class="f-year" value="' + esc(p.year == null ? "" : p.year) + '" placeholder="2026"></label>' +
            "</div>" +
            '<label class="field"><span class="field-label">会议 / 期刊简称（徽章文字）*</span>' +
              '<input class="f-venue" list="venue-list" value="' + esc(p.venue || "") + '" placeholder="EUROCRYPT"></label>' +
            '<label class="field"><span class="field-label">论文标题 *</span>' +
              '<input class="f-title" value="' + esc(p.title || "") + '"></label>' +
            '<label class="field"><span class="field-label">论文链接 *</span>' +
              '<input class="f-link" value="' + esc(p.link || "") + '" placeholder="https://doi.org/..."></label>' +
            '<div class="grid-2">' +
              '<label class="field"><span class="field-label">链接标签（可选）</span>' +
                '<input class="f-linkLabel" value="' + esc(p.linkLabel || "") + '" placeholder="自动：DOI / OpenReview / IEEE Xplore"></label>' +
              '<label class="field"><span class="field-label">备注小字（可选）</span>' +
                '<input class="f-note" value="' + esc(p.note || "") + '" placeholder="如期刊全名"></label>' +
            "</div>" +
            '<label class="field"><span class="field-label">作者（一行一个，格式：姓名 | 主页链接，链接可省略）</span>' +
              '<textarea class="f-authors" rows="3" placeholder="You Lyu&#10;Shuai Han | https://dalenhan.github.io">' +
              esc(formatAuthors(p.authors)) + "</textarea></label>" +
          "</div>" +
        "</div>"
      );
    }

    function renderPubs() {
      pubsContainer.innerHTML = "";
      data.publications.forEach(function (p, i) {
        var card = el(pubCardHTML(p, i));
        pubsContainer.appendChild(card);

        bindToggle(card);
        bindOps(card, data.publications, i, renderPubs, "篇论文");

        var headBadge = card.querySelector(".head-badge");
        var headYear = card.querySelector(".head-year");
        var headTitle = card.querySelector(".head-title");

        card.querySelector(".f-type").addEventListener("change", function (e) {
          p.type = e.target.value;
          markDirty();
        });

        var yearInput = card.querySelector(".f-year");
        bindText(yearInput, p, "year", { number: true });
        yearInput.addEventListener("input", function () {
          headYear.textContent = yearInput.value || "—";
        });

        var venueInput = card.querySelector(".f-venue");
        bindText(venueInput, p, "venue", { omitEmpty: true });
        venueInput.addEventListener("input", function () {
          headBadge.textContent = venueInput.value || "未命名";
        });

        var titleInput = card.querySelector(".f-title");
        bindText(titleInput, p, "title", { omitEmpty: true });
        titleInput.addEventListener("input", function () {
          headTitle.textContent = titleInput.value || "（无标题）";
        });

        bindText(card.querySelector(".f-link"), p, "link", { omitEmpty: true });
        bindText(card.querySelector(".f-linkLabel"), p, "linkLabel", { omitEmpty: true });
        bindText(card.querySelector(".f-note"), p, "note", { omitEmpty: true });

        var authorsEl = card.querySelector(".f-authors");
        authorsEl.addEventListener("input", function () {
          p.authors = parseAuthors(authorsEl.value);
          markDirty();
        });
      });
      refreshCounts();
    }

    $("#btn-add-pub").addEventListener("click", function () {
      data.publications.unshift({
        type: "conference",
        venue: "",
        year: new Date().getFullYear(),
        title: "",
        link: "",
        authors: [{ name: "You Lyu" }]
      });
      markDirty();
      renderPubs();
      var first = pubsContainer.firstElementChild;
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    /* ---------- 教育经历 ---------- */

    var eduContainer = $("#edu-container");

    function eduCardHTML(e2, i) {
      return (
        '<div class="item-card open" data-index="' + i + '">' +
          '<div class="item-card-head">' +
            '<span class="collapse-arrow">▸</span>' +
            '<span class="head-title">' + esc(e2.degree || "（未填写学位）") + "</span>" +
            '<span class="card-ops">' +
              '<button type="button" data-op="up" title="上移">↑</button>' +
              '<button type="button" data-op="down" title="下移">↓</button>' +
              '<button type="button" data-op="del" class="op-del" title="删除">删除</button>' +
            "</span>" +
          "</div>" +
          '<div class="item-card-body">' +
            '<div class="grid-2">' +
              '<label class="field"><span class="field-label">时间段</span>' +
                '<input class="f-time" value="' + esc(e2.time || "") + '" placeholder="Sep 2022 — Present"></label>' +
              '<label class="field"><span class="field-label">学位</span>' +
                '<input class="f-degree" value="' + esc(e2.degree || "") + '" placeholder="Ph.D. in Computer Science"></label>' +
            "</div>" +
            '<div class="grid-2">' +
              '<label class="field"><span class="field-label">标签（可选，如 ACM Class）</span>' +
                '<input class="f-tag" value="' + esc(e2.tag || "") + '"></label>' +
              '<label class="field"><span class="field-label">标签链接（可选）</span>' +
                '<input class="f-tagLink" value="' + esc(e2.tagLink || "") + '" placeholder="https://..."></label>' +
            "</div>" +
            '<div class="grid-2">' +
              '<label class="field"><span class="field-label">学校 / 机构</span>' +
                '<input class="f-org" value="' + esc(e2.org || "") + '"></label>' +
              '<label class="field"><span class="field-label">机构链接</span>' +
                '<input class="f-orgLink" value="' + esc(e2.orgLink || "") + '" placeholder="https://..."></label>' +
            "</div>" +
            '<label class="field"><span class="field-label">备注（允许 HTML，如导师信息）</span>' +
              '<textarea class="f-note" rows="2">' + esc(e2.note || "") + "</textarea></label>" +
          "</div>" +
        "</div>"
      );
    }

    function renderEdu() {
      eduContainer.innerHTML = "";
      data.education.forEach(function (e2, i) {
        var card = el(eduCardHTML(e2, i));
        eduContainer.appendChild(card);

        bindToggle(card);
        bindOps(card, data.education, i, renderEdu, "条教育经历");

        var headTitle = card.querySelector(".head-title");
        var degreeInput = card.querySelector(".f-degree");
        bindText(degreeInput, e2, "degree", { omitEmpty: true });
        degreeInput.addEventListener("input", function () {
          headTitle.textContent = degreeInput.value || "（未填写学位）";
        });

        bindText(card.querySelector(".f-time"), e2, "time", { omitEmpty: true });
        bindText(card.querySelector(".f-tag"), e2, "tag", { omitEmpty: true });
        bindText(card.querySelector(".f-tagLink"), e2, "tagLink", { omitEmpty: true });
        bindText(card.querySelector(".f-org"), e2, "org", { omitEmpty: true });
        bindText(card.querySelector(".f-orgLink"), e2, "orgLink", { omitEmpty: true });
        bindText(card.querySelector(".f-note"), e2, "note", { omitEmpty: true });
      });
    }

    $("#btn-add-edu").addEventListener("click", function () {
      data.education.push({ time: "", degree: "", org: "", orgLink: "", note: "" });
      markDirty();
      renderEdu();
    });

    /* ---------- 教学经历 ---------- */

    var teachContainer = $("#teach-container");

    function teachCardHTML(t, i) {
      return (
        '<div class="item-card open" data-index="' + i + '">' +
          '<div class="item-card-head">' +
            '<span class="collapse-arrow">▸</span>' +
            '<span class="head-code mono">' + esc(t.code || "——") + "</span>" +
            '<span class="head-title">' + esc(t.name || "（未填写课程名）") + "</span>" +
            '<span class="card-ops">' +
              '<button type="button" data-op="up" title="上移">↑</button>' +
              '<button type="button" data-op="down" title="下移">↓</button>' +
              '<button type="button" data-op="del" class="op-del" title="删除">删除</button>' +
            "</span>" +
          "</div>" +
          '<div class="item-card-body">' +
            '<div class="grid-2">' +
              '<label class="field"><span class="field-label">课程代码</span>' +
                '<input class="f-code" value="' + esc(t.code || "") + '" placeholder="CS7301"></label>' +
              '<label class="field"><span class="field-label">课程名称</span>' +
                '<input class="f-name" value="' + esc(t.name || "") + '"></label>' +
            "</div>" +
            '<label class="field"><span class="field-label">说明（角色 · 层次 · 学期）</span>' +
              '<input class="f-meta" value="' + esc(t.meta || "") + '" placeholder="Teaching Assistant · Graduate · Spring 2024"></label>' +
          "</div>" +
        "</div>"
      );
    }

    function renderTeach() {
      teachContainer.innerHTML = "";
      data.teaching.forEach(function (t, i) {
        var card = el(teachCardHTML(t, i));
        teachContainer.appendChild(card);

        bindToggle(card);
        bindOps(card, data.teaching, i, renderTeach, "条教学经历");

        var headCode = card.querySelector(".head-code");
        var headTitle = card.querySelector(".head-title");

        var codeInput = card.querySelector(".f-code");
        bindText(codeInput, t, "code", { omitEmpty: true });
        codeInput.addEventListener("input", function () {
          headCode.textContent = codeInput.value || "——";
        });

        var nameInput = card.querySelector(".f-name");
        bindText(nameInput, t, "name", { omitEmpty: true });
        nameInput.addEventListener("input", function () {
          headTitle.textContent = nameInput.value || "（未填写课程名）";
        });

        bindText(card.querySelector(".f-meta"), t, "meta", { omitEmpty: true });
      });
      refreshCounts();
    }

    $("#btn-add-teach").addEventListener("click", function () {
      data.teaching.push({ code: "", name: "", meta: "" });
      markDirty();
      renderTeach();
    });

    /* ---------- 校验 + 生成 + 统计 ---------- */

    var warningsEl = $("#export-warnings");
    var statsEl = $("#export-stats");
    var previewEl = $("#export-preview");
    var autoUpdateEl = $("#chk-auto-update");

    function validatePubs() {
      var warnings = [];
      var cards = pubsContainer.querySelectorAll(".pub-card");
      data.publications.forEach(function (p, i) {
        var missing = [];
        if (!p.title || !String(p.title).trim()) missing.push("标题");
        if (!p.venue || !String(p.venue).trim()) missing.push("会议/期刊");
        if (p.year == null || String(p.year).trim() === "" || isNaN(parseInt(p.year, 10))) missing.push("年份");
        if (!p.link || !String(p.link).trim()) missing.push("链接");
        if (cards[i]) cards[i].classList.toggle("invalid", missing.length > 0);
        if (missing.length > 0) {
          warnings.push("第 " + (i + 1) + " 篇论文（" + (p.title || "未命名") + "）：缺少 " + missing.join("、"));
        }
      });
      return warnings;
    }

    /* 生成导出文本；auto-update 勾选时覆盖 updated */
    function generateText() {
      var out = JSON.parse(JSON.stringify(data));
      if (autoUpdateEl.checked) out.updated = currentMonthString();
      return buildDataFile(out);
    }

    function refreshPreview() {
      var warnings = validatePubs();
      var text = generateText();
      previewEl.value = text;

      if (warnings.length) {
        warningsEl.innerHTML =
          '<p class="warn-title">⚠ 以下内容不完整（仍可导出，但请尽快补全）：</p><ul>' +
          warnings.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") +
          "</ul>";
        warningsEl.style.display = "";
      } else {
        warningsEl.innerHTML = "";
        warningsEl.style.display = "none";
      }

      statsEl.textContent =
        "论文 " + data.publications.length + " 篇 · 教学 " + data.teaching.length +
        " 条 · 文件大小 " + (byteSize(text) / 1024).toFixed(1) + " KB";
    }

    function refreshCounts() {
      /* 结构变化后立即刷新统计（文件大小随预览更新） */
      if (previewEl.value) refreshPreview();
    }

    var previewTimer = null;
    function schedulePreview() {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(refreshPreview, 300);
    }

    autoUpdateEl.addEventListener("change", schedulePreview);

    /* ---------- 导出 / 复制 / 重置 ---------- */

    var btnExport = $("#btn-export");
    var btnCopy = $("#btn-copy");
    var btnReset = $("#btn-reset");

    btnExport.addEventListener("click", function () {
      refreshPreview();
      var text = previewEl.value;
      var blob = new Blob([text], { type: "text/javascript;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "site-data.js";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 0);
      dirty = false;
      flashButton(btnExport, "✓ 已导出");
    });

    btnCopy.addEventListener("click", function () {
      refreshPreview();
      var text = previewEl.value;
      function done() {
        dirty = false;
        flashButton(btnCopy, "✓ 已复制");
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
      } else {
        fallbackCopy(text, done);
      }
    });

    function fallbackCopy(text, done) {
      previewEl.focus();
      previewEl.select();
      try { document.execCommand("copy"); } catch (e) {}
      previewEl.setSelectionRange(0, 0);
      done();
    }

    function flashButton(btn, label) {
      var old = btn.textContent;
      btn.textContent = label;
      btn.classList.add("flash");
      setTimeout(function () {
        btn.textContent = old;
        btn.classList.remove("flash");
      }, 1800);
    }

    btnReset.addEventListener("click", function () {
      if (confirm("确定放弃所有未导出的修改，重新从 data/site-data.js 加载吗？")) {
        dirty = false;
        location.reload();
      }
    });

    /* ---------- 初始渲染 ---------- */

    renderPubs();
    renderEdu();
    renderTeach();
    refreshPreview();
    dirty = false; // 初始渲染不算修改
  }

  /* ---------------- 导出 ---------------- */

  global.SiteEditor = {
    init: initEditor,
    buildDataFile: buildDataFile,
    parseAuthors: parseAuthors,
    formatAuthors: formatAuthors
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { buildDataFile: buildDataFile, parseAuthors: parseAuthors, formatAuthors: formatAuthors };
  }
})(typeof window !== "undefined" ? window : globalThis);
