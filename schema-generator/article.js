// article.js — UPDATED WITH FLATPICKR SUPPORT ✅
(function () {
  const {
    el, addSectionTitle, registerSchemaType,
    updatePreview, createCustomSelect
  } = window.SchemaCore;

  const isValidUrl = v => /^https?:\/\/[^\s]+$/i.test(v);

  const defaults = {
    "@type": "BlogPosting",
    url: "",
    headline: "",
    strictHeadline: false,
    description: "",
    images: [""],
    authorType: "Person",
    author: "",
    authorUrl: "",
    datePublished: "",
    dateModified: "",
    publisherName: "",
    publisherLogo: "",
    articleBody: ""
  };

  function renderArticle(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";
    window.SchemaCore.activeForm = form; // ✅ Track active form globally
    addSectionTitle("Article Schema", "Google-ready Article, BlogPosting, NewsArticle");

    /* TYPE + URL */
    const typeRow = el("div", { class: "form-row inline" });

    const atypeWrap = el("div", { class: "form-row" });
    atypeWrap.appendChild(el("label", { text: "Article @type" }));

    const types = [
      { value: "Article", desc: "General article" },
      { value: "NewsArticle", desc: "News reporting" },
      { value: "BlogPosting", desc: "Blog content" }
    ];

    const atypeSelect = createCustomSelect(
      types,
      form["@type"],
      v => { form["@type"] = v; updatePreview(); }
    );
    atypeWrap.appendChild(atypeSelect.wrapper);
    typeRow.appendChild(atypeWrap);

    // URL input
    const urlWrap = el("div", { class: "form-row" });
    urlWrap.appendChild(el("label", { text: "Article URL" }));
    const urlInput = el("input", {
      type: "url",
      value: form.url || "",
      placeholder: "https://example.com/my-article"
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
    typeRow.appendChild(urlWrap);
    formArea.appendChild(typeRow);

    /* HEADLINE */
    const headRow = el("div", { class: "form-row" });
    headRow.appendChild(el("label", { text: "Headline" }));
    const headInput = el("input", {
      type: "text",
      placeholder: "e.g. 10 Proven SEO Tips to Boost Traffic",
      value: form.headline || ""
    });
    const counter = el("div", {
      class: "hint",
      style: "margin-top:6px;font-weight:500;"
    });
    const strictCheck = el("input", { type: "checkbox" });
    strictCheck.checked = !!form.strictHeadline;
    strictCheck.onchange = e => {
      form.strictHeadline = e.target.checked;
      updateCount();
      updatePreview();
    };
    const strictLabel = el("label", {
      style: "font-weight:400;font-size:16px;margin-top:6px;display:flex;gap:6px;"
    });
    strictLabel.append(strictCheck, el("span", { text: "Strict 110-character SEO limit" }));

    function updateCount() {
      const max = 110;
      if (form.strictHeadline && headInput.value.length > max)
        headInput.value = headInput.value.slice(0, max);

      const len = headInput.value.length;
      counter.textContent = `${len}/${max} characters`;
      counter.style.color =
        len > max ? "#b91c1c" :
        len > 90 ? "#b45309" :
        "var(--secondary)";
    }
    headInput.oninput = () => {
      form.headline = headInput.value.trim();
      updateCount();
      updatePreview();
    };
    updateCount();

    headRow.append(headInput, counter, strictLabel);
    formArea.appendChild(headRow);

    /* DESCRIPTION */
    const descRow = el("div", { class: "form-row" });
    descRow.appendChild(el("label", { text: "Description" }));
    const descInput = el("textarea", {
      rows: 3,
      placeholder: "Short summary — appears in Google search results"
    });
    descInput.value = form.description || "";
    descInput.oninput = e => {
      form.description = e.target.value.trim();
      updatePreview();
    };
    descRow.appendChild(descInput);
    formArea.appendChild(descRow);

    /* IMAGES */
    const imgSec = el("div", { class: "image-section" });
    imgSec.appendChild(el("label", { text: "Image(s)" }));

    (form.images || []).forEach((val, i) => {
      const imgRow = el("div", { class: "form-row image-row" });
      const imgInput = el("input", {
        type: "url",
        value: val || "",
        placeholder: "https://example.com/image.jpg"
      });
      const imgHint = el("div", { class: "hint", text: "Invalid URL format" });
      imgHint.style.display = (!val || isValidUrl(val)) ? "none" : "block";
      imgInput.oninput = e => {
        const v = e.target.value.trim();
        form.images[i] = v;
        imgHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
        updatePreview();
      };

      const rm = el("button", { class: "remove-btn", type: "button", text: "×" });
      rm.onclick = () => {
        form.images.splice(i, 1);
        renderArticle(form);
        updatePreview();
      };

      imgRow.append(imgInput, imgHint, rm);
      imgSec.appendChild(imgRow);
    });

    const addImg = el("button", { class: "btn secondary", text: "Add Image" });
    addImg.onclick = () => {
      form.images.push("");
      renderArticle(form);
      updatePreview();
    };
    imgSec.appendChild(addImg);
    formArea.appendChild(imgSec);

    /* AUTHOR TYPE + NAME inline */
    const authorRow = el("div", { class: "form-row inline" });

    const aTypeWrap = el("div", { class: "form-row" });
    aTypeWrap.appendChild(el("label", { text: "Author @type" }));
    const aTypeSelect = createCustomSelect(
      [
        { value: "Person", desc: "Individual" },
        { value: "Organization", desc: "Brand or Company" }
      ],
      form.authorType,
      v => { form.authorType = v; updatePreview(); }
    );
    aTypeWrap.appendChild(aTypeSelect.wrapper);
    authorRow.appendChild(aTypeWrap);

    const aNameWrap = el("div", { class: "form-row" });
    aNameWrap.appendChild(el("label", { text: "Author Name" }));
    const aNameInput = el("input", {
      type: "text",
      value: form.author || "",
      placeholder: "e.g. Jane Doe"
    });
    aNameInput.oninput = e => { form.author = e.target.value.trim(); updatePreview(); };
    aNameWrap.appendChild(aNameInput);
    authorRow.appendChild(aNameWrap);

    formArea.appendChild(authorRow);

    /* AUTHOR URL */
    const aUrlRow = el("div", { class: "form-row" });
    aUrlRow.appendChild(el("label", { text: "Author URL" }));
    const aUrlInput = el("input", {
      type: "url",
      value: form.authorUrl || "",
      placeholder: "https://example.com/author"
    });
    const aUrlHint = el("div", { class: "hint", text: "Invalid URL format" });
    aUrlHint.style.display = (!form.authorUrl || isValidUrl(form.authorUrl)) ? "none" : "block";
    aUrlInput.oninput = e => {
      const v = e.target.value.trim();
      form.authorUrl = v;
      aUrlHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
      updatePreview();
    };
    aUrlRow.append(aUrlInput, aUrlHint);
    formArea.appendChild(aUrlRow);

    /* PUBLISHER inline */
    const pubRow = el("div", { class: "form-row inline" });

    const pName = el("div", { class: "form-row" });
    pName.appendChild(el("label", { text: "Publisher Name" }));
    const pNameInput = el("input", {
      type: "text",
      value: form.publisherName || "",
    });
    pNameInput.oninput = e => { form.publisherName = e.target.value.trim(); updatePreview(); };
    pName.appendChild(pNameInput);
    pubRow.appendChild(pName);

    const pLogo = el("div", { class: "form-row" });
    pLogo.appendChild(el("label", { text: "Publisher Logo URL" }));
    const pLogoInput = el("input", {
      type: "url",
      value: form.publisherLogo || "",
      placeholder: "https://example.com/logo.png"
    });
    const pLogoHint = el("div", { class: "hint", text: "Invalid URL format" });
    pLogoHint.style.display = (!form.publisherLogo || isValidUrl(form.publisherLogo)) ? "none" : "block";
    pLogoInput.oninput = e => {
      const v = e.target.value.trim();
      form.publisherLogo = v;
      pLogoHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
      updatePreview();
    };
    pLogo.append(pLogoInput, pLogoHint);
    pubRow.appendChild(pLogo);

    formArea.appendChild(pubRow);

    /* ✅ DATES — Flatpickr enabled */
    const dates = el("div", { class: "form-row inline" });

    const dp = el("div", { class: "form-row" });
    dp.appendChild(el("label", { text: "Date Published" }));
    const dpInput = el("input", {
      class: "flatpickr-input",
      "data-field": "datePublished",
      placeholder: "YYYY-MM-DD",
      value: form.datePublished || ""
    });
    dp.appendChild(dpInput);
    dates.appendChild(dp);

    const dm = el("div", { class: "form-row" });
    dm.appendChild(el("label", { text: "Date Modified" }));
    const dmInput = el("input", {
      class: "flatpickr-input",
      "data-field": "dateModified",
      placeholder: "YYYY-MM-DD",
      value: form.dateModified || ""
    });
    dm.appendChild(dmInput);
    dates.appendChild(dm);

    formArea.appendChild(dates);

    /* ARTICLE BODY */
    const bodyRow = el("div", { class: "form-row" });
    bodyRow.appendChild(el("label", { text: "Article Body (Optional)" }));
    const bodyInput = el("textarea", {
      rows: 6,
      placeholder: "Paste or write the main content here…"
    });
    bodyInput.value = form.articleBody || "";
    bodyInput.oninput = e => {
      form.articleBody = e.target.value.trim();
      updatePreview();
    };
    bodyRow.appendChild(bodyInput);
    formArea.appendChild(bodyRow);

    /* References */
    const refs = el("div", { class: "schema-references" });
    refs.innerHTML = `
      <div class="ref-columns">
        <div class="ref-block">
          <strong>Schema.org reference:</strong>
          <ul>
            <li><a href="https://schema.org/Article" target="_blank">Article</a></li>
            <li><a href="https://schema.org/BlogPosting" target="_blank">BlogPosting</a></li>
            <li><a href="https://schema.org/NewsArticle" target="_blank">NewsArticle</a></li>
          </ul>
        </div>
        <div class="ref-block">
          <strong>Google docs:</strong>
          <ul>
            <li><a href="https://developers.google.com/search/docs/appearance/structured-data/article" target="_blank">Article</a></li>
          </ul>
        </div>
      </div>`;
    formArea.appendChild(refs);

    // ✅ Notify global initializer to attach Flatpickr after render
    document.dispatchEvent(new Event("schemaFormUpdated"));
  }

  function build(f) {
    const author = f.author ? {
      "@type": f.authorType,
      name: f.author,
      url: f.authorUrl || undefined
    } : undefined;

    const publisher = (f.publisherName || f.publisherLogo)
      ? {
          "@type": "Organization",
          name: f.publisherName || undefined,
          logo: f.publisherLogo ? { "@type": "ImageObject", url: f.publisherLogo } : undefined
        }
      : undefined;

    return {
      "@context": "https://schema.org",
      "@type": f["@type"] || "BlogPosting",
      url: f.url || undefined,
      headline: f.headline || undefined,
      description: f.description || undefined,
      author,
      datePublished: f.datePublished || undefined,
      dateModified: f.dateModified || undefined,
      image: (f.images || []).filter(Boolean),
      publisher,
      articleBody: f.articleBody || undefined
    };
  }

  function validate(s) {
    const e = [];
    const bad = v => v && !/^https?:\/\/[^\s]+$/i.test(v);

    if (!s.url || bad(s.url)) e.push("Invalid or missing Article URL.");
    if (!s.headline) e.push("Missing headline.");
    if (!s.description) e.push("Missing description.");

    if (!s.author?.name) e.push("Missing author name.");
    if (bad(s.author?.url)) e.push("Author URL invalid.");

    if (!s.datePublished) e.push("Missing publication date.");
    if (!s.image?.length) e.push("At least one image URL is required.");
    if ((s.image || []).some(bad)) e.push("One or more image URLs invalid.");

    if (!s.publisher?.name) e.push("Missing publisher name.");
    if (bad(s.publisher?.logo?.url)) e.push("Publisher Logo URL invalid.");

    return e;
  }

  registerSchemaType("Article", renderArticle, build, defaults, validate);
})();