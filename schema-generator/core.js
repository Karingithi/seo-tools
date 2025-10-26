// core.js — Cralite Schema Generator Core v1.1 (with validation + error hints)
(function () {
  /* ---------------------------------------
     BASIC HELPERS
  --------------------------------------- */
  const q = (sel, el = document) => el.querySelector(sel);
  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    (children || []).forEach(c => n.appendChild(c));
    return n;
  };

  /* ---------------------------------------
     GLOBAL STATE + DOM REFERENCES
  --------------------------------------- */
  const schemaType = q("#schemaType");
  const formArea = q("#formArea");
  const jsonPreview = q("#jsonPreview");
  const errorCount = q("#errorCount");
  const hints = q("#hints");
  const copyBtn = q("#copyBtn");
  const downloadBtn = q("#downloadBtn");
  const resetBtn = q("#resetBtn");

  let currentType = schemaType ? schemaType.value : "Organization";
  let form = {};
  const schemaModules = {}; // { type: { renderFn, buildFn, defaults, validateFn } }
  const openCustomLists = new Set();

  /* ---------------------------------------
     CUSTOM SELECT
  --------------------------------------- */
  function createCustomSelect(opts = [], initial = "", onChange = () => {}) {
    const items = opts.map(o => typeof o === "string" ? { value: o, desc: "" } : o);
    const wrapper = el("div", { class: "custom-select" });
    const display = el("div", { class: "custom-select-display", role: "button", tabindex: 0 });
    const list = el("ul", { class: "custom-select-list" });
    let selected = initial || "";
    let placeholder = "Select option";

    function renderDisplay() {
      display.textContent = selected || placeholder;
      display.classList.toggle("placeholder", !selected);
    }

    function populateList() {
      list.innerHTML = "";
      items.forEach(it => {
  const li = el("li", { class: "custom-option", "data-value": it.value });

  const name = el("div", { class: "option-name", text: it.value });
  li.appendChild(name);

  if (it.desc) {
    const desc = el("div", { class: "option-desc", text: it.desc });
    li.appendChild(desc);
  }

  li.onclick = () => {
    selected = it.value;
    renderDisplay();
    list.classList.remove("open");
    onChange(selected);
  };

  list.appendChild(li);
});
    }

    display.onclick = () => list.classList.toggle("open");
    display.onkeydown = e => { if (["Enter", " "].includes(e.key)) { e.preventDefault(); list.classList.toggle("open"); } };

    populateList();
    renderDisplay();
    wrapper.appendChild(display);
    wrapper.appendChild(list);
    return { wrapper, getValue: () => selected, setValue: v => { selected = v; renderDisplay(); } };
  }

  /* ---------------------------------------
     MULTI-SELECT WITH INLINE SEARCH (v3.8)
  --------------------------------------- */
  function createMultiSelect(options, initial = [], placeholder = "Select", onChange = () => {}, showSearch = true) {
    const wrapper = el("div", { class: "custom-select multi" });
    const display = el("div", { class: "custom-select-display", text: placeholder });
    const list = el("ul", { class: "custom-select-list" });
    let selected = new Set(initial || []);
    let searchInput;

    function renderDisplay() {
      display.textContent = selected.size ? Array.from(selected).join(", ") : placeholder;
    }

    function renderOptions(filter = "") {
      list.querySelectorAll(".custom-option").forEach(o => o.remove());
      const filtered = options.filter(o => {
        const f = filter.toLowerCase();
        return o.value.toLowerCase().includes(f) || (o.desc || "").toLowerCase().includes(f);
      });
      filtered.forEach(o => {
        const li = el("li", { class: "custom-option" });
        const cb = el("input", { type: "checkbox" });
        cb.checked = selected.has(o.value);
        cb.onchange = () => {
          cb.checked ? selected.add(o.value) : selected.delete(o.value);
          renderDisplay();
          onChange(Array.from(selected));
        };
        li.appendChild(cb);
        li.appendChild(el("span", { text: o.desc || o.value }));
        list.appendChild(li);
      });
    }

    if (showSearch) {
      const searchLi = el("li", { class: "search-container" });
      searchInput = el("input", { type: "text", class: "inline-search", placeholder: "Search..." });
      searchInput.oninput = e => renderOptions(e.target.value);
      searchLi.appendChild(searchInput);
      list.appendChild(searchLi);
    }

    function openDropdown() {
      list.classList.add("open");
      openCustomLists.add(list);
      if (showSearch && searchInput) setTimeout(() => searchInput.focus(), 0);
    }

    function closeDropdown() {
      list.classList.remove("open");
      openCustomLists.delete(list);
    }

    display.onclick = () => (list.classList.contains("open") ? closeDropdown() : openDropdown());
    renderOptions();
    renderDisplay();
    wrapper.appendChild(display);
    wrapper.appendChild(list);

    document.addEventListener("click", e => {
      if (!wrapper.contains(e.target)) closeDropdown();
    });

    return { wrapper, getSelected: () => Array.from(selected) };
  }

  /* ---------------------------------------
     CORE UTILITIES
  --------------------------------------- */
  function addSectionTitle(type, description) {
    const title = el("div", { class: "schema-section-title" });
    title.innerHTML = `<strong>${type}</strong> – ${description}`;
    formArea.appendChild(title);
  }

  function rowInput(label, key, val = "", isUrl = false, onChange = () => {}) {
    const r = el("div", { class: "form-row" });
    r.appendChild(el("label", { text: label }));
    const i = el("input", { class: "input", type: "text", value: val });
    const hint = el("div", { class: "hint", text: "Invalid URL" });
    hint.style.display = "none";
    i.oninput = e => {
      const v = e.target.value.trim();
      if (isUrl && v && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(v)) hint.style.display = "block";
      else hint.style.display = "none";
      onChange(v);
    };
    r.appendChild(i);
    r.appendChild(hint);
    return r;
  }

  /* ---------------------------------------
     REGISTRATION + RENDER + VALIDATION
  --------------------------------------- */
  function registerSchemaType(type, renderFn, buildFn, defaults = {}, validateFn = () => []) {
    schemaModules[type] = { renderFn, buildFn, defaults, validateFn };
  }

  function renderForm(type) {
    const mod = schemaModules[type];
    if (!mod) {
      formArea.innerHTML = "Schema type not supported.";
      return;
    }
    form = JSON.parse(JSON.stringify(mod.defaults));
    formArea.innerHTML = "";
    mod.renderFn(form, updatePreview);
    updatePreview();
  }

  function updatePreview() {
    const mod = schemaModules[currentType];
    if (!mod) return;

    const schema = mod.buildFn(form);
    jsonPreview.textContent = JSON.stringify(schema, null, 2);

    // validation
    const errors = mod.validateFn(schema);
    errorCount.textContent = `Errors: ${errors.length}`;
    errorCount.classList.toggle("active", errors.length > 0);
    hints.innerHTML = "";
    errors.forEach(msg => {
      hints.appendChild(el("div", { class: "hint", text: msg }));
    });
  }

  /* ---------------------------------------
     BUTTON ACTIONS
  --------------------------------------- */
  if (schemaType) {
    schemaType.onchange = () => {
      currentType = schemaType.value;
      renderForm(currentType);
    };
  }

  if (copyBtn) copyBtn.onclick = () => navigator.clipboard.writeText(jsonPreview.textContent || "");
  if (downloadBtn) downloadBtn.onclick = () => {
    const blob = new Blob([jsonPreview.textContent || ""], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: (currentType || "schema").toLowerCase() + "-schema.json" });
    document.body.appendChild(a); a.click(); a.remove();
  };
  if (resetBtn) resetBtn.onclick = () => renderForm(currentType);

  /* ---------------------------------------
     EXPOSE GLOBALLY
  --------------------------------------- */
  window.SchemaCore = {
    q, el, createCustomSelect, createMultiSelect, rowInput, addSectionTitle,
    registerSchemaType, renderForm, updatePreview
  };

  document.addEventListener("DOMContentLoaded", () => renderForm(currentType));
})();
