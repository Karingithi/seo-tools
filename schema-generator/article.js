// article.js — Cralite Schema Generator: Article / Blog / News ✅ FINAL
(function () {
  const {
    el, addSectionTitle, rowInput,
    registerSchemaType, updatePreview,
    createCustomSelect
  } = window.SchemaCore;

  const articleDefaults = {
    "@type": "BlogPosting",
    url: "",
    headline: "",
    description: "",
    author: "",
    datePublished: "",
    dateModified: "",
    images: [""],
    publisherName: "",
    publisherLogo: "",
    articleBody: ""
  };

  function renderArticle(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";

    addSectionTitle("Article Schema", "Articles, News Posts, and Blogs");

    /* ✅ Article Type + URL Inline Row */
    const typeRow = el("div", { class: "form-row inline" });

    // Article @type custom select
    const typeCol = el("div", { class: "form-row" });
    typeCol.appendChild(el("label", { text: "Article @type" }));

    const typeOptions = [
      { value: "Article", desc: "General article content" },
      { value: "NewsArticle", desc: "News, announcements & updates" },
      { value: "BlogPosting", desc: "Blog posts & editorial content" }
    ];

    const typeSelect = createCustomSelect(
      typeOptions,
      form["@type"],
      v => { form["@type"] = v; updatePreview(); }
    );

    typeCol.appendChild(typeSelect.wrapper);
    typeRow.appendChild(typeCol);

    // Article URL w/ validation
    const urlCol = el("div", { class: "form-row" });
    urlCol.appendChild(el("label", { text: "Article URL" }));

    const urlInput = el("input", {
      type: "url",
      placeholder: "https://example.com/my-article",
      value: form.url || ""
    });

    const urlHint = el("div", {
      class: "hint",
      text: "Invalid URL — must start with http(s)://"
    });
    urlHint.style.display = "none";

    urlInput.oninput = e => {
      const v = e.target.value.trim();
      form.url = v;

      const valid = !v || /^https?:\/\/[^\s]+$/i.test(v);
      urlInput.classList.toggle("error", !valid);
      urlHint.style.display = valid ? "none" : "block";
      updatePreview();
    };

    urlCol.append(urlInput, urlHint);
    typeRow.appendChild(urlCol);

    formArea.appendChild(typeRow);

    // ✅ Headline
    const headlineRow = rowInput("Headline", "headline", form.headline, false, v => {
      form.headline = v; updatePreview();
    });
    formArea.appendChild(headlineRow);

    // ✅ Description
    const descRow = el("div", { class: "form-row" });
    descRow.appendChild(el("label", { text: "Description" }));
    const descInput = el("textarea", {
      rows: 3,
      placeholder: "Brief summary or intro paragraph"
    });
    descInput.value = form.description || "";
    descInput.oninput = e => {
      form.description = e.target.value.trim();
      updatePreview();
    };
    descRow.appendChild(descInput);
    formArea.appendChild(descRow);

    // ✅ Author
    const authorRow = rowInput("Author Name", "author", form.author, false, v => {
      form.author = v; updatePreview();
    });
    formArea.appendChild(authorRow);

    // ✅ Dates
    const dateGroup = el("div", { class: "form-row inline" });

    const pubCol = el("div", { class: "form-row" });
    pubCol.append(el("label", { text: "Date Published" }));
    const pubDate = el("input", { type: "date", value: form.datePublished || "" });
    pubDate.onchange = e => { form.datePublished = e.target.value; updatePreview(); };
    pubCol.appendChild(pubDate);

    const modCol = el("div", { class: "form-row" });
    modCol.append(el("label", { text: "Date Modified" }));
    const modDate = el("input", { type: "date", value: form.dateModified || "" });
    modDate.onchange = e => { form.dateModified = e.target.value; updatePreview(); };
    modCol.appendChild(modDate);

    dateGroup.append(pubCol, modCol);
    formArea.appendChild(dateGroup);


    /* ✅ Image Loop */
    const imageSection = el("div", { class: "image-section" });
    imageSection.appendChild(el("label", { text: "Image(s)" }));

    (form.images || []).forEach((img, i) => {
      const imgRow = el("div", { class: "form-row image-row" });

      const input = el("input", {
        type: "url",
        placeholder: "https://example.com/image.jpg",
        value: img
      });
      input.oninput = e => {
        form.images[i] = e.target.value.trim();
        updatePreview();
      };

      const rm = el("button", { class: "remove-btn", type: "button", text: "×" });
      rm.onclick = () => {
        form.images.splice(i, 1);
        renderArticle(form);
        updatePreview();
      };

      imgRow.append(input, rm);
      imageSection.appendChild(imgRow);
    });

    const addImage = el("button", { class: "btn primary", text: "Add Image" });
    addImage.onclick = () => {
      form.images.push("");
      renderArticle(form);
      updatePreview();
    };
    imageSection.appendChild(addImage);

    formArea.appendChild(imageSection);


    /* ✅ Publisher */
    formArea.appendChild(
      rowInput("Publisher Name", "publisherName", form.publisherName, false, v => {
        form.publisherName = v; updatePreview();
      })
    );

    formArea.appendChild(
      rowInput("Publisher Logo URL", "publisherLogo", form.publisherLogo, true, v => {
        form.publisherLogo = v; updatePreview();
      })
    );


    /* ✅ Article Body */
    const bodyRow = el("div", { class: "form-row" });
    bodyRow.appendChild(el("label", { text: "Article Body (Optional)" }));

    const bodyInput = el("textarea", {
      rows: 6,
      placeholder: "Paste main content here…"
    });
    bodyInput.value = form.articleBody || "";
    bodyInput.oninput = e => {
      form.articleBody = e.target.value.trim();
      updatePreview();
    };

    bodyRow.appendChild(bodyInput);
    formArea.appendChild(bodyRow);
  }

  /* ✅ Build Schema */
  function buildArticleSchema(f) {
    return {
      "@context": "https://schema.org",
      "@type": f["@type"],
      url: f.url || undefined,
      headline: f.headline || undefined,
      description: f.description || undefined,
      author: f.author ? { "@type": "Person", name: f.author } : undefined,
      datePublished: f.datePublished || undefined,
      dateModified: f.dateModified || undefined,
      image: (f.images || []).filter(Boolean),
      publisher: (f.publisherName || f.publisherLogo) ? {
        "@type": "Organization",
        name: f.publisherName || undefined,
        logo: f.publisherLogo ? {
          "@type": "ImageObject",
          url: f.publisherLogo
        } : undefined
      } : undefined,
      articleBody: f.articleBody || undefined
    };
  }

  /* ✅ Validation */
  function validateArticle(schema) {
    const errors = [];
    if (!schema.url) errors.push("Article URL is required.");
    if (schema.url && !/^https?:\/\/[^\s]+$/i.test(schema.url))
      errors.push("Article URL format looks invalid.");
    if (!schema.headline) errors.push("Missing headline.");
    if (!schema.description) errors.push("Missing description.");
    if (!schema.author?.name) errors.push("Missing author name.");
    if (!schema.datePublished) errors.push("Missing publication date.");
    if (!schema.image?.length) errors.push("At least one image is required.");
    if (!schema.publisher?.name) errors.push("Missing publisher name.");
    return errors;
  }

  registerSchemaType("Article", renderArticle, buildArticleSchema, articleDefaults, validateArticle);

})();
