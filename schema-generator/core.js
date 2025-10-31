// core.js — Final Stable Version (Popup Test Menu + Custom Selector + Button Actions)
(function () {
  const q = (sel, el = document) => el.querySelector(sel);
  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    children.forEach(c => n.appendChild(c));
    return n;
  };

  // DOM
  const formArea = q("#formArea");
  const jsonPreview = q("#jsonPreview");
  const errorCount = q("#errorCount");
  const hints = q("#hints");
  const copyBtn = q("#copyBtn");
  const copyMessage = q("#copyMessage");
  const downloadBtn = q("#downloadBtn");
  const resetBtn = q("#resetBtn");
  const testBtn = q("#testBtn");
  const testMenu = q("#testMenu");
  const testRichResults = q("#testRichResults");
  const testSDTT = q("#testSDTT");

  let currentType = "Article";
  let form = {};
  const schemaModules = {};

  /* ------------------------------------
     ✅ Custom Select
  ------------------------------------- */
  function createCustomSelect(opts, initial, onChange) {
    const wrapper = el("div", { class: "custom-select" });
    const display = el("div", { class: "custom-select-display", tabindex: 0 });
    const list = el("ul", { class: "custom-select-list" });

    let selected = initial;
    const update = () => (display.textContent = selected);

    opts.forEach(o => {
      const li = el("li", { class: "custom-option", "data-value": o.value });
      li.append(el("div", { class: "option-name", text: o.value }));
      if (o.desc) li.append(el("div", { class: "option-desc", text: o.desc }));

      li.onclick = () => {
        selected = o.value;
        update();
        list.classList.remove("open");
        onChange(selected);
      };
      list.appendChild(li);
    });

    display.onclick = () => list.classList.toggle("open");
    document.addEventListener("click", e => {
      if (!wrapper.contains(e.target)) list.classList.remove("open");
    });

    update();
    wrapper.append(display, list);
    return { wrapper };
  }

  function createMultiSelect(options, initial = [], placeholder = "Select", onChange = () => {}, showSearch = true) {
    const wrapper = el("div", { class: "custom-select multi" });
    const display = el("div", { class: "custom-select-display", text: placeholder });
    const list = el("ul", { class: "custom-select-list" });

    let selected = new Set(initial || []);
    let searchInput;

    function updateDisplay() {
      display.textContent = selected.size ? [...selected].join(", ") : placeholder;
    }

    function renderOptions(f = "") {
      list.querySelectorAll(".custom-option").forEach(o => o.remove());
      const filter = f.toLowerCase();
      options.filter(o =>
        o.value.toLowerCase().includes(filter) ||
        (o.desc || "").toLowerCase().includes(filter)
      ).forEach(o => {
        const li = el("li", { class: "custom-option" });
        const cb = el("input", { type: "checkbox" });

        cb.checked = selected.has(o.value);
        cb.onchange = () => {
          cb.checked ? selected.add(o.value) : selected.delete(o.value);
          updateDisplay();
          onChange([...selected]);
        };

        li.append(cb, el("span", { text: o.desc || o.value }));
        list.appendChild(li);
      });
    }

    if (showSearch) {
      const sLi = el("li", { class: "search-container" });
      searchInput = el("input", { type: "text", class: "inline-search", placeholder: "Search..." });
      searchInput.oninput = e => renderOptions(e.target.value);
      sLi.appendChild(searchInput);
      list.appendChild(sLi);
    }

    display.onclick = () => list.classList.toggle("open");
    document.addEventListener("click", e => {
      if (!wrapper.contains(e.target)) list.classList.remove("open");
    });

    renderOptions();
    updateDisplay();
    wrapper.append(display, list);
    return { wrapper };
  }

  function rowInput(label, key, val = "", isUrl = false, onChange = () => {}) {
    const r = el("div", { class: "form-row" });
    r.append(el("label", { text: label }));
    const i = el("input", { class: "input", type: "text", value: val });
    const hint = el("div", { class: "hint", text: "Invalid URL" });
    hint.style.display = "none";

    i.oninput = e => {
      const v = e.target.value.trim();
      if (isUrl && v && !/^https?:\/\/[^\s]+$/i.test(v)) hint.style.display = "block";
      else hint.style.display = "none";
      onChange(v);
    };

    r.append(i, hint);
    return r;
  }

  function addSectionTitle(type, desc) {
    const t = el("div", { class: "schema-section-title" });
    t.innerHTML = `<strong>${type}</strong> – ${desc}`;
    formArea.appendChild(t);
  }

  /* ------------------------------------
     ✅ Schema Registration
  ------------------------------------- */
  function registerSchemaType(type, renderFn, buildFn, defaults = {}, validateFn = () => []) {
    schemaModules[type] = { renderFn, buildFn, defaults, validateFn };
  }

  function renderForm(type) {
    currentType = type;
    const mod = schemaModules[type];
    if (!mod) return;

    form = JSON.parse(JSON.stringify(mod.defaults || {}));
    formArea.innerHTML = "";
    mod.renderFn(form, updatePreview);
    updatePreview();
  }

  function updatePreview() {
    const mod = schemaModules[currentType];
    if (!mod) return;

    const schema = mod.buildFn(form);
    jsonPreview.textContent = JSON.stringify(schema, null, 2);

    const errors = mod.validateFn(schema);
    errorCount.textContent = "Errors: " + errors.length;
    errorCount.classList.toggle("active", errors.length > 0);

    hints.innerHTML = "";
    errors.forEach(m => hints.appendChild(el("div", { class: "hint", text: m })));
  }

  /* ------------------------------------
     ✅ Popup Test Menu
  ------------------------------------- */
  if (testBtn && testMenu) {
    testBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      testMenu.classList.toggle("show");
    });

    document.addEventListener("click", () => testMenu.classList.remove("show"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") testMenu.classList.remove("show");
    });
  }

  if (testRichResults) {
    testRichResults.onclick = () => {
      window.open("https://search.google.com/test/rich-results", "_blank", "noopener");
      testMenu?.classList.remove("show");
    };
  }

  if (testSDTT) {
    testSDTT.onclick = () => {
      window.open("https://validator.schema.org/", "_blank", "noopener");
      testMenu?.classList.remove("show");
    };
  }

  /* ------------------------------------
     ✅ Button Actions
  ------------------------------------- */
  if (copyBtn && copyMessage) copyBtn.onclick = () => {
    const txt = (jsonPreview.textContent || "{}").trim();
    navigator.clipboard.writeText(txt).then(() => {
      copyMessage.classList.add("show");
      setTimeout(() => copyMessage.classList.remove("show"), 2000);
    });
  };

  if (downloadBtn) downloadBtn.onclick = () => {
    const txt = (jsonPreview.textContent || "{}").trim();
    const blob = new Blob([txt], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: currentType.toLowerCase() + ".json" });
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (resetBtn) resetBtn.onclick = () => {
    if (confirm("Reset all fields?")) renderForm(currentType);
  };

  /* ------------------------------------
     ✅ Export + Init
  ------------------------------------- */
  window.SchemaCore = {
    q, el,
    createCustomSelect, createMultiSelect,
    rowInput, addSectionTitle,
    registerSchemaType, renderForm, updatePreview
  };

  window.addEventListener("load", () => {
    const wrap = q("#schemaTypeCustom");
    wrap.innerHTML = "";

    const types = [
      { value: "Article", desc: "Blog posts or news content." },
      { value: "Organization", desc: "Company identity: logo, socials, contacts." },
      { value: "LocalBusiness", desc: "Local service, hours, location." },
      { value: "Product", desc: "SKU, price, reviews, offers." },
      { value: "FAQ", desc: "Questions & answers for rich results." }
    ];

    const cs = createCustomSelect(types, currentType, renderForm);
    wrap.appendChild(cs.wrapper);

    renderForm(currentType);
  });

})();
