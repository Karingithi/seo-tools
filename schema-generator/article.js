// article.js — Cralite Schema Generator: Article / Blog / News
(function () {
  const { el, addSectionTitle, rowInput, registerSchemaType, updatePreview } = window.SchemaCore;

  const articleDefaults = {
    "@type": "BlogPosting", // default type
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

  // --- RENDER FORM ---
  function renderArticle(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";
    addSectionTitle("Article Schema", "Generate BlogPosting or NewsArticle structured data easily.");

    // Article Type Selector
    const typeRow = el("div", { class: "form-row" });
    const typeLabel = el("label", { text: "Select Article Type" });
    const typeSelect = el("select");
    ["BlogPosting", "NewsArticle"].forEach(t => {
      const opt = el("option", { value: t, text: t });
      if (form["@type"] === t) opt.selected = true;
      typeSelect.appendChild(opt);
    });
    typeSelect.onchange = e => {
      form["@type"] = e.target.value;
      updatePreview();
    };
    typeRow.appendChild(typeLabel);
    typeRow.appendChild(typeSelect);
    formArea.appendChild(typeRow);

    // Headline
    formArea.appendChild(rowInput("headline", "Headline", "e.g. How to Improve SEO in 2025", form, updatePreview));

    // Description
    const descLabel = el("label", { text: "Description" });
    const desc = el("textarea", { rows: 3, placeholder: "Brief summary or intro paragraph" });
    desc.value = form.description || "";
    desc.oninput = e => {
      form.description = e.target.value.trim();
      updatePreview();
    };
    const descRow = el("div", { class: "form-row" });
    descRow.appendChild(descLabel);
    descRow.appendChild(desc);
    formArea.appendChild(descRow);

    // Author
    formArea.appendChild(rowInput("author", "Author Name", "e.g. Jane Doe", form, updatePreview));

    // Publication Dates
    const dateGroup = el("div", { class: "form-row inline" });

    const pubDate = el("div", { class: "form-row" });
    const pubLabel = el("label", { text: "Date Published" });
    const pubInput = el("input", { type: "date", value: form.datePublished || "" });
    pubInput.onchange = e => {
      form.datePublished = e.target.value;
      updatePreview();
    };
    pubDate.appendChild(pubLabel);
    pubDate.appendChild(pubInput);

    const modDate = el("div", { class: "form-row" });
    const modLabel = el("label", { text: "Date Modified" });
    const modInput = el("input", { type: "date", value: form.dateModified || "" });
    modInput.onchange = e => {
      form.dateModified = e.target.value;
      updatePreview();
    };
    modDate.appendChild(modLabel);
    modDate.appendChild(modInput);

    dateGroup.appendChild(pubDate);
    dateGroup.appendChild(modDate);
    formArea.appendChild(dateGroup);

    // --- IMAGE LOOP ---
    const imageSection = el("div", { class: "image-section" });
    const imageLabel = el("label", { text: "Image(s)" });
    imageSection.appendChild(imageLabel);

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

      const rm = el("button", { class: "remove-btn", type: "button" });
      rm.appendChild(el("img", {
        src: "../components/icons/remove.svg",
        alt: "Remove",
        class: "remove-icon"
      }));
      rm.onclick = () => {
        form.images.splice(i, 1);
        renderArticle(form);
        updatePreview();
      };

      imgRow.appendChild(input);
      imgRow.appendChild(rm);
      imageSection.appendChild(imgRow);
    });

    const addImage = el("button", { class: "btn secondary", text: "Add Image" });
    addImage.onclick = () => {
      form.images.push("");
      renderArticle(form);
      updatePreview();
    };
    imageSection.appendChild(addImage);
    formArea.appendChild(imageSection);

    // Publisher Fields (heading removed)
    const publisherName = rowInput("publisherName", "Publisher Name", "e.g. Cralite Digital", form, updatePreview);
    formArea.appendChild(publisherName);

    const publisherLogo = rowInput("publisherLogo", "Publisher Logo URL", "https://example.com/logo.png", form, updatePreview);
    formArea.appendChild(publisherLogo);

    // Article Body
    const bodyLabel = el("label", { text: "Article Body (Optional)" });
    const bodyTextarea = el("textarea", {
      rows: 6,
      placeholder: "Paste or write the main content of the article here..."
    });
    bodyTextarea.value = form.articleBody || "";
    bodyTextarea.oninput = e => {
      form.articleBody = e.target.value.trim();
      updatePreview();
    };
    const bodyRow = el("div", { class: "form-row" });
    bodyRow.appendChild(bodyLabel);
    bodyRow.appendChild(bodyTextarea);
    formArea.appendChild(bodyRow);
  }

  // --- BUILD JSON-LD ---
  function buildArticleSchema(f) {
    const schema = {
      "@context": "https://schema.org",
      "@type": f["@type"] || "BlogPosting",
      headline: f.headline || undefined,
      description: f.description || undefined,
      author: f.author ? { "@type": "Person", name: f.author } : undefined,
      datePublished: f.datePublished || undefined,
      dateModified: f.dateModified || undefined,
      image: (f.images || []).filter(Boolean),
      publisher: {
        "@type": "Organization",
        name: f.publisherName || undefined,
        logo: f.publisherLogo ? { "@type": "ImageObject", url: f.publisherLogo } : undefined
      },
      articleBody: f.articleBody || undefined
    };

    if (!schema.publisher.name && !schema.publisher.logo) delete schema.publisher;
    return schema;
  }

  // --- VALIDATION ---
  function validateArticle(schema) {
    const errors = [];
    if (!schema.headline) errors.push("Missing headline.");
    if (!schema.description) errors.push("Missing description.");
    if (!schema.author?.name) errors.push("Missing author name.");
    if (!schema.datePublished) errors.push("Missing publication date.");
    if (!schema.image?.length) errors.push("At least one image URL is required.");
    if (!schema.publisher?.name) errors.push("Missing publisher name.");
    return errors;
  }

  // Register Schema
  registerSchemaType("Article", renderArticle, buildArticleSchema, articleDefaults, validateArticle);
})();
