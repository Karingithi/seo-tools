// searchbox.js — Cralite Schema Generator: Sitelinks Searchbox (Updated UI ✅)

(function () {
  const {
    el, addSectionTitle, rowInput,
    registerSchemaType, updatePreview
  } = window.SchemaCore;

  const isValidUrl = v => /^https?:\/\/[^\s]+$/i.test(v);

  const defaults = {
    name: "",
    url: "",
    searchTemplate: "https://example.com/search?q={search_term_string}",
    alternateUrls: []
  };

  function renderSearchbox(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";
    addSectionTitle(
      "Website Sitelinks Searchbox",
      "Enable Google’s search box under your website results"
    );

    /* ✅ Website Name + URL inline */
    const siteRow = el("div", { class: "form-row inline" });

    // Website name
    const nameWrap = el("div", { class: "form-row" });
    nameWrap.appendChild(el("label", { text: "Website Name" }));
    const nameInput = el("input", {
      type: "text",
      value: form.name || "",
    });
    nameInput.oninput = e => {
      form.name = e.target.value.trim();
      updatePreview();
    };
    nameWrap.appendChild(nameInput);
    siteRow.appendChild(nameWrap);

    // Website URL
    const urlWrap = el("div", { class: "form-row" });
    urlWrap.appendChild(el("label", { text: "Website URL" }));
    const urlInput = el("input", {
      type: "url",
      value: form.url || "",
      placeholder: "https://example.com"
    });
    const urlHint = el("div", { class: "hint", text: "Invalid URL format" });
    urlHint.style.display = (!form.url || isValidUrl(form.url)) ? "none" : "block";

    urlInput.oninput = e => {
      const v = e.target.value.trim();
      form.url = v;
      urlHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
      updatePreview();
    };

    urlWrap.append(urlInput, urlHint);
    siteRow.appendChild(urlWrap);
    formArea.appendChild(siteRow);

    /* ✅ Internal Search URL */
    const sRow = el("div", { class: "form-row" });
    sRow.appendChild(el("label", { text: "Internal Site Search URL" }));

    const sInput = el("input", {
      type: "url",
      value: form.searchTemplate || "",
      placeholder: "https://example.com/search?q={search_term_string}"
    });

    const sHint = el("div",
      { class: "hint", text: "Must be valid URL & include {search_term_string}" });
    sHint.style.display =
      (isValidUrl(form.searchTemplate) &&
       form.searchTemplate.includes("{search_term_string}"))
        ? "none" : "block";

    sInput.oninput = e => {
      const v = e.target.value.trim();
      form.searchTemplate = v;
      sHint.style.display =
        (isValidUrl(v) && v.includes("{search_term_string}"))
          ? "none" : "block";
      updatePreview();
    };

    sRow.append(sInput, sHint);
    formArea.appendChild(sRow);

    /* ✅ Alternate URLs */
    const altSec = el("div", { class: "form-row" });
    altSec.appendChild(el("label", { text: "Alternate URLs (Optional)" }));

    (form.alternateUrls || []).forEach((val, i) => {
      const row = el("div", { class: "form-row image-row" });

      const input = el("input", {
        type: "url",
        value: val || "",
        placeholder: "https://m.example.com"
      });

      const hint = el("div", { class: "hint", text: "Invalid URL format" });
      hint.style.display = (!val || isValidUrl(val)) ? "none" : "block";

      input.oninput = e => {
        const v = e.target.value.trim();
        form.alternateUrls[i] = v;
        hint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
        updatePreview();
      };

      const rm = el("button", { class: "remove-btn", type: "button", text: "×" });
      rm.onclick = () => {
        form.alternateUrls.splice(i, 1);
        renderSearchbox(form);
        updatePreview();
      };

      row.append(input, hint, rm);
      altSec.appendChild(row);
    });

    const addAlt = el("button", { class: "btn primary", text: "Add URL" });
    addAlt.onclick = () => {
      form.alternateUrls.push("");
      renderSearchbox(form);
      updatePreview();
    };
    altSec.appendChild(addAlt);

    formArea.appendChild(altSec);

    /* ✅ References */
    const refs = el("div", { class: "schema-references" });
    refs.innerHTML = `
      <div class="ref-columns">
        <div class="ref-block">
          <strong>Schema.org reference:</strong>
          <ul>
            <li><a href="https://schema.org/WebSite" target="_blank">WebSite</a></li>
            <li><a href="https://schema.org/SearchAction" target="_blank">SearchAction</a></li>
          </ul>
        </div>
        <div class="ref-block">
          <strong>Google documentation:</strong>
          <ul>
            <li><a href="https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox" target="_blank">Sitelinks Searchbox</a></li>
          </ul>
        </div>
      </div>`;
    formArea.appendChild(refs);
  }

  /* ✅ JSON Builder */
  function build(f) {
    const out = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: f.name || undefined,
      url: f.url || undefined,
      potentialAction: {
        "@type": "SearchAction",
        target: f.searchTemplate || undefined,
        "query-input": "required name=search_term_string"
      }
    };

    if (f.alternateUrls?.length) {
      out.sameAs = f.alternateUrls.filter(Boolean);
    }

    return out;
  }

  /* ✅ Validation */
  function validate(s) {
    const e = [];
    const bad = v => v && !isValidUrl(v);

    if (!s.url || bad(s.url)) e.push("Invalid or missing Website URL.");
    if (!s.potentialAction?.target ||
        bad(s.potentialAction.target) ||
        !s.potentialAction.target.includes("{search_term_string}"))
      e.push("Internal search URL must be a valid URL containing {search_term_string}.");
    if (s.sameAs?.some(bad)) e.push("One or more alternate URLs invalid.");

    return e;
  }

  registerSchemaType(
    "Website Sitelinks Searchbox",
    renderSearchbox,
    build,
    defaults,
    validate
  );
})();
