// breadcrumb.js — Cralite Schema Generator: BreadcrumbList Module ✅ Final Updated
(function () {
  const {
    el, addSectionTitle, registerSchemaType,
    updatePreview
  } = window.SchemaCore;

  const isValidUrl = v => /^https?:\/\/[^\s]+$/i.test(v);

  const defaults = {
    items: [
      { name: "", url: "" },
      { name: "", url: "" }
    ]
  };

  function render(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";

    addSectionTitle("Breadcrumb Schema", "Help Google understand your page hierarchy");

    const wrap = el("div", { class: "form-row" });
    wrap.appendChild(el("label", { text: "Breadcrumb Items" }));

    (form.items || []).forEach((item, i) => {
      const row = el("div", { class: "form-row inline breadcrumb-row" });

      // ✅ NAME FIELD
      const nameWrap = el("div", { class: "form-row" });
      nameWrap.appendChild(el("label", { text: "Name" }));
      const nameInput = el("input", {
        type: "text",
        value: item.name || "",
        placeholder: `Page #${i + 1} Name`
      });
      nameInput.oninput = e => {
        form.items[i].name = e.target.value.trim();
        updatePreview();
      };
      nameWrap.appendChild(nameInput);
      row.appendChild(nameWrap);

      // ✅ URL FIELD
      const urlWrap = el("div", { class: "form-row" });
      urlWrap.appendChild(el("label", { text: "URL" }));
      const urlInput = el("input", {
        type: "url",
        value: item.url || "",
        placeholder: `https://example.com/page-${i + 1}`
      });
      const urlHint = el("div", { class: "hint", text: "Invalid URL format" });
      urlHint.style.display = (!item.url || isValidUrl(item.url)) ? "none" : "block";

      urlInput.oninput = e => {
        const v = e.target.value.trim();
        form.items[i].url = v;
        urlHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
        updatePreview();
      };
      urlWrap.append(urlInput, urlHint);
      row.appendChild(urlWrap);

      // ✅ Remove button only if >2 breadcrumbs
      if (form.items.length > 2) {
        const rm = el("button", {
          class: "remove-btn",
          type: "button",
          text: "×"
        });
        rm.onclick = () => {
          form.items.splice(i, 1);
          render(form);
          updatePreview();
        };
        row.appendChild(rm);
      }

      wrap.appendChild(row);
    });

    const addBtn = el("button", {
      class: "btn primary",
      text: "Add URL"
    });
    addBtn.onclick = () => {
      form.items.push({ name: "", url: "" });
      render(form);
      updatePreview();
    };
    wrap.appendChild(addBtn);

    formArea.appendChild(wrap);

    /* ✅ Reference Links (Matches Article + Org layout) */
    const refs = el("div", { class: "schema-references" });
    refs.innerHTML = `
      <div class="ref-columns">
        <div class="ref-block">
          <strong>Schema.org's reference:</strong>
          <ul>
            <li><a href="https://schema.org/BreadcrumbList" target="_blank">BreadcrumbList</a></li>
          </ul>
        </div>
        <div class="ref-block">
          <strong>Google's documentation:</strong>
          <ul>
            <li><a href="https://developers.google.com/search/docs/appearance/structured-data/breadcrumb" target="_blank">Breadcrumb</a></li>
          </ul>
        </div>
      </div>
    `;
    formArea.appendChild(refs);
  }

  function build(form) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: form.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name || undefined,
        item: item.url || undefined
      }))
    };
  }

  function validate(schema) {
    const errors = [];
    const items = schema.itemListElement || [];

    if (!items.length) errors.push("At least one breadcrumb required.");

    items.forEach((item, i) => {
      if (!item.name) errors.push(`Breadcrumb #${i + 1}: Missing name.`);
      if (!item.item) errors.push(`Breadcrumb #${i + 1}: Missing URL.`);
      if (item.item && !isValidUrl(item.item))
        errors.push(`Breadcrumb #${i + 1}: Invalid URL format.`);
    });

    return errors;
  }

  registerSchemaType("Breadcrumb", render, build, defaults, validate);
})();
