(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ============================================================
     Scroll progress bar
  ============================================================ */
  var progress = document.getElementById("scrollProgress");
  function updateProgress() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });

  /* ============================================================
     Navbar: background on scroll + active link
  ============================================================ */
  var navbar = document.getElementById("navbar");
  function onScrollNav() {
    if (window.scrollY > 30) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });

  var navLinks = document.querySelectorAll(".nav-links a[href^='#'], .mobile-menu a[href^='#']");
  var navSections = document.querySelectorAll("main section[id]");
  function onScrollActive() {
    var pos = window.scrollY + 140;
    navSections.forEach(function (sec) {
      if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(function (a) { a.classList.remove("active"); });
        document.querySelectorAll('a[href="#' + sec.id + '"]').forEach(function (a) {
          a.classList.add("active");
        });
      }
    });
  }
  window.addEventListener("scroll", onScrollActive, { passive: true });

  /* ============================================================
     Mobile menu
  ============================================================ */
  var hamburger = document.getElementById("hamburger");
  var mobileMenu = document.getElementById("mobileMenu");
  var mobileClose = document.getElementById("mobileClose");

  hamburger.addEventListener("click", function () { mobileMenu.classList.add("open"); });
  mobileClose.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
  mobileMenu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
  });

  /* ============================================================
     Scroll reveal
  ============================================================ */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ============================================================
     Hero role cycling text
  ============================================================ */
  var roles = [
    "Backend & Full-Stack Developer",
    "Node.js · React · PostgreSQL",
    "REST API Design & Automation",
    "Troubleshooting & Root Cause Analysis"
  ];
  var roleEl = document.getElementById("roleText");
  if (roleEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ri = 0, ci = 0, deleting = false;

    function typeLoop() {
      var current = roles[ri];
      if (!deleting) {
        ci++;
        roleEl.textContent = current.slice(0, ci);
        if (ci === current.length) {
          deleting = true;
          setTimeout(typeLoop, 1600);
          return;
        }
      } else {
        ci--;
        roleEl.textContent = current.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          ri = (ri + 1) % roles.length;
        }
      }
      setTimeout(typeLoop, deleting ? 28 : 45);
    }
    typeLoop();
  } else if (roleEl) {
    roleEl.textContent = roles[0];
  }

  /* ============================================================
     ADMIN-ONLY SECTIONS
     ------------------------------------------------------------
     - Custom sections live in THIS browser's localStorage only.
       Visitors on another device/browser never see your drafts.
     - Change ADMIN_PASSWORD below before you deploy this site.
     - Type "admin" anywhere on the page (with no input focused)
       to open the login prompt — there's no visible button.
  ============================================================ */

  var ADMIN_PASSWORD = "Hari@change1027"; // <-- change this before deploying
  var STORAGE_KEY = "portfolio_custom_sections";
  var AUTH_KEY = "portfolio_admin_authed";

  var isAdmin = localStorage.getItem(AUTH_KEY) === "true";
  var previewingAsVisitor = false;

  function getSections() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveSections(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderSections() {
    var container = document.getElementById("customSections");
    var sections = getSections();
    var showAdminView = isAdmin && !previewingAsVisitor;
    container.innerHTML = "";

    sections.forEach(function (sec) {
      if (!sec.published && !showAdminView) return;

      var wrap = document.createElement("section");
      wrap.className = "custom-section" + (!sec.published ? " is-draft" : "");
      wrap.id = "custom-" + sec.id;

      var head = document.createElement("div");
      head.className = "section-head";
      head.innerHTML =
        '<h2>' + escapeHtml(sec.title) +
        (!sec.published ? '<span class="draft-badge">DRAFT — hidden from visitors</span>' : '') +
        '</h2>' +
        (sec.subtitle ? '<p>' + escapeHtml(sec.subtitle) + '</p>' : '');
      wrap.appendChild(head);

      var body = document.createElement("div");
      body.className = "custom-body";
      body.textContent = sec.content || "";
      wrap.appendChild(body);

      if (showAdminView) {
        var tools = document.createElement("div");
        tools.className = "cs-tools";

        var editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = function () { openSectionModal(sec); };

        var toggleBtn = document.createElement("button");
        toggleBtn.textContent = sec.published ? "Unpublish" : "Publish";
        toggleBtn.onclick = function () {
          sec.published = !sec.published;
          saveSections(sections);
          renderSections();
        };

        var delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = function () {
          if (confirm("Delete this section? This cannot be undone.")) {
            var idx = sections.findIndex(function (s) { return s.id === sec.id; });
            if (idx > -1) { sections.splice(idx, 1); saveSections(sections); renderSections(); }
          }
        };

        tools.appendChild(editBtn);
        tools.appendChild(toggleBtn);
        tools.appendChild(delBtn);
        wrap.appendChild(tools);
      }

      container.appendChild(wrap);
      if ("IntersectionObserver" in window) {
        wrap.classList.add("in-view");
      }
    });
  }

  /* ---------------- Secret trigger + login ---------------- */
  var typedBuffer = "";
  document.addEventListener("keydown", function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key.length === 1) {
      typedBuffer = (typedBuffer + e.key).slice(-5).toLowerCase();
      if (typedBuffer === "admin" && !isAdmin) {
        openLoginModal();
        typedBuffer = "";
      }
    }
  });

  function openLoginModal() {
    document.getElementById("loginError").style.display = "none";
    document.getElementById("pwInput").value = "";
    document.getElementById("loginOverlay").classList.add("open");
    document.getElementById("pwInput").focus();
  }
  function closeLoginModal() {
    document.getElementById("loginOverlay").classList.remove("open");
  }

  document.getElementById("btnCancelLogin").onclick = closeLoginModal;
  document.getElementById("btnSubmitLogin").onclick = attemptLogin;
  document.getElementById("pwInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") attemptLogin();
  });

  function attemptLogin() {
    var val = document.getElementById("pwInput").value;
    if (val === ADMIN_PASSWORD) {
      isAdmin = true;
      localStorage.setItem(AUTH_KEY, "true");
      closeLoginModal();
      applyAdminState();
    } else {
      document.getElementById("loginError").style.display = "block";
    }
  }

  document.getElementById("btnLogout").onclick = function () {
    isAdmin = false;
    previewingAsVisitor = false;
    localStorage.removeItem(AUTH_KEY);
    applyAdminState();
  };

  document.getElementById("btnPreview").onclick = function () {
    previewingAsVisitor = !previewingAsVisitor;
    document.getElementById("btnPreview").textContent = previewingAsVisitor ? "Back to admin view" : "Preview as visitor";
    renderSections();
  };

  function applyAdminState() {
    document.getElementById("adminFab").style.display = isAdmin ? "flex" : "none";
    document.getElementById("adminPill").style.display = isAdmin ? "block" : "none";
    renderSections();
  }

  /* ---------------- Add / edit section ---------------- */
  document.getElementById("btnAddSection").onclick = function () { openSectionModal(null); };
  document.getElementById("btnCancelSection").onclick = closeSectionModal;

  function openSectionModal(sec) {
    document.getElementById("sectionModalTitle").textContent = sec ? "Edit section" : "Add a section";
    document.getElementById("editingId").value = sec ? sec.id : "";
    document.getElementById("secTitle").value = sec ? sec.title : "";
    document.getElementById("secSubtitle").value = sec ? (sec.subtitle || "") : "";
    document.getElementById("secBody").value = sec ? (sec.content || "") : "";
    document.getElementById("secPublished").checked = sec ? !!sec.published : false;
    document.getElementById("sectionOverlay").classList.add("open");
  }
  function closeSectionModal() {
    document.getElementById("sectionOverlay").classList.remove("open");
  }

  document.getElementById("btnSaveSection").onclick = function () {
    var title = document.getElementById("secTitle").value.trim();
    if (!title) { alert("Give the section a title."); return; }

    var sections = getSections();
    var id = document.getElementById("editingId").value;
    var data = {
      title: title,
      subtitle: document.getElementById("secSubtitle").value.trim(),
      content: document.getElementById("secBody").value,
      published: document.getElementById("secPublished").checked
    };

    if (id) {
      var idx = sections.findIndex(function (s) { return s.id === id; });
      if (idx > -1) sections[idx] = Object.assign(sections[idx], data);
    } else {
      data.id = "sec_" + Date.now();
      sections.push(data);
    }

    saveSections(sections);
    closeSectionModal();
    renderSections();
  };

  document.querySelectorAll(".modal-overlay").forEach(function (ov) {
    ov.addEventListener("click", function (e) {
      if (e.target === ov) ov.classList.remove("open");
    });
  });

  /* ---------------- Init ---------------- */
  applyAdminState();
  renderSections();
  updateProgress();
  onScrollNav();
})();
