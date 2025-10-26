// Cralite Schema Generator v3.7 — Stable build: inline dropdown search + options without search
(function () {
  /* ---------------------------------------
     ORGANIZATION TYPES AND SUBTYPES
  --------------------------------------- */
  const orgTypes = [
    { value: "Organization", desc: "A general organization like a business, NGO, or club." },
    { value: "Airline", desc: "Provides passenger flight services." },
    { value: "Consortium", desc: "A membership body of organizations." },
    { value: "Corporation", desc: "A registered business company." },
    { value: "EducationalOrganization", desc: "A school, college, or learning institution." },
    { value: "FundingScheme", desc: "A program providing structured grant funding." },
    { value: "GovernmentOrganization", desc: "A public or state-run institution." },
    { value: "LibrarySystem", desc: "A network of cooperating libraries." },
    { value: "MedicalOrganization", desc: "Provides medical or healthcare services." },
    { value: "NGO", desc: "A non-governmental or nonprofit organization." },
    { value: "NewsMediaOrganization", desc: "Publishes or broadcasts news content." },
    { value: "OnlineBusiness", desc: "Operates mainly through the internet." },
    { value: "PerformingGroup", desc: "A music, dance, or theater performance group." },
    { value: "PoliticalParty", desc: "An organized political movement or party." },
    { value: "Project", desc: "A temporary organized initiative or venture." },
    { value: "ResearchOrganization", desc: "Conducts scientific or academic research." },
    { value: "SearchRescueOrganization", desc: "Provides emergency search and rescue services." },
    { value: "SportsOrganization", desc: "Organizes or manages sports activities." },
    { value: "WorkersUnion", desc: "Represents and supports employees’ interests." }
  ];

  const orgSubTypes = {
    Organization: [],
    EducationalOrganization: [
      { value: "CollegeOrUniversity", desc: "Higher learning (university, college)." },
      { value: "ElementarySchool", desc: "Primary education for young children." },
      { value: "HighSchool", desc: "Secondary education institution." },
      { value: "MiddleSchool", desc: "Intermediate education level." },
      { value: "Preschool", desc: "Early childhood learning center." },
      { value: "School", desc: "General school institution." }
    ],
    MedicalOrganization: [
      { value: "Dentist", desc: "Dental care provider." },
      { value: "Hospital", desc: "Healthcare facility for patients." },
      { value: "MedicalClinic", desc: "Outpatient healthcare center." },
      { value: "Pharmacy", desc: "Dispenses medicines and health products." },
      { value: "Physician", desc: "Licensed medical doctor." },
      { value: "VeterinaryCare", desc: "Animal health services." }
    ],
    PerformingGroup: [
      { value: "DanceGroup", desc: "Performs dance productions." },
      { value: "MusicGroup", desc: "Band or musical ensemble." },
      { value: "TheaterGroup", desc: "Stage performance company." }
    ],
    SportsOrganization: [
      { value: "SportsClub", desc: "Club organizing sports activities." },
      { value: "SportsTeam", desc: "A team of players competing together." }
    ]
  };

  /* ---------------------------------------
     DEFAULTS
  --------------------------------------- */
  const defaults = {
    Organization: {
      "@typeGeneral": "Organization",
      "@typeSpecific": "",
      name: "",
      alternateName: "",
      url: "",
      logo: "",
      sameAs: [],
      contactPoint: []
    },
    LocalBusiness: { name: "", url: "", phone: "", address: "" },
    Article: { headline: "", author: "", datePublished: "", image: "", description: "" },
    Product: { name: "", image: "", description: "", sku: "", price: "", currency: "KES" },
    FAQ: { mainEntity: [{ question: "", answer: "" }] }
  };

  /* ---------------------------------------
     HELPERS
  --------------------------------------- */
  function q(sel, el = document) { return el.querySelector(sel); }
  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    (children || []).forEach(c => n.appendChild(c));
    return n;
  }

  // DOM handles — ensure they exist or fail gracefully
  const schemaType = q("#schemaType");
  const formArea = q("#formArea");
  const jsonPreview = q("#jsonPreview");
  const errorCount = q("#errorCount");
  const hints = q("#hints");
  const copyBtn = q("#copyBtn");
  const downloadBtn = q("#downloadBtn");
  const resetBtn = q("#resetBtn");

  if (!schemaType || !formArea || !jsonPreview) {
    console.warn("Cralite Schema Generator: required DOM nodes (#schemaType, #formArea, #jsonPreview) not found — aborting init.");
    return;
  }

  let currentType = schemaType.value || "Organization";
  let form = JSON.parse(JSON.stringify(defaults[currentType] || {}));
  let openCustomLists = new Set();

  /* ---------------------------------------
     CUSTOM SELECT (unchanged behaviour, placeholder supported)
  --------------------------------------- */
  function createCustomSelect(opts = [], initial = "", onChange = () => {}) {
    const items = opts.map(o => typeof o === "string" ? { value: o, desc: "" } : o);
    const wrapper = el("div", { class: "custom-select" });
    const display = el("div", { class: "custom-select-display", role: "button", tabindex: 0 });
    const list = el("ul", { class: "custom-select-list" });
    let selected = initial || "";
    let placeholderText = "";

    function renderDisplay() {
      if (!selected && placeholderText) {
        display.textContent = placeholderText;
        display.classList.add("placeholder");
      } else {
        display.textContent = selected || "";
        display.classList.remove("placeholder");
      }
    }

    function populateList() {
      list.innerHTML = "";
      items.forEach(it => {
        const li = el("li", { class: "custom-option", "data-value": it.value });
        const name = el("div", { class: "option-name", text: it.value });
        li.appendChild(name);
        if (it.desc) li.appendChild(el("div", { class: "option-desc", text: it.desc }));
        li.onclick = () => {
          selected = it.value;
          renderDisplay();
          closeList();
          onChange(selected);
        };
        list.appendChild(li);
      });
    }

    function openList() { list.classList.add("open"); openCustomLists.add(list); }
    function closeList() { list.classList.remove("open"); openCustomLists.delete(list); }
    function toggleList() { list.classList.contains("open") ? closeList() : openList(); }

    display.onclick = toggleList;
    display.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleList(); } };

    populateList();
    renderDisplay();
    wrapper.appendChild(display);
    wrapper.appendChild(list);

    return {
      wrapper,
      setPlaceholder(text) { placeholderText = text; renderDisplay(); },
      setOptions(newOpts = []) {
        const normalized = newOpts.map(o => typeof o === "string" ? { value: o, desc: "" } : o);
        items.length = 0; normalized.forEach(i => items.push(i));
        populateList();
      },
      setValue(val) { selected = val; renderDisplay(); },
      getValue() { return selected; }
    };
  }

  // close open lists when clicking outside
  document.addEventListener("click", e => {
    openCustomLists.forEach(list => {
      if (!list.contains(e.target) && !list.previousSibling?.contains(e.target)) {
        list.classList.remove("open");
        openCustomLists.delete(list);
      }
    });
  });

  /* ---------------------------------------
     MULTI-SELECT WITH INLINE SEARCH (Area & Languages)
     showSearch: true -> inline search appears as first list item and autofocuses
     showSearch: false -> no search input (used for Options)
  --------------------------------------- */
  /* ---------------------------------------
   MULTI-SELECT WITH INLINE SEARCH (v3.8)
   Fix: keeps search input persistent while filtering
--------------------------------------- */
function createMultiSelect(options, initial = [], placeholder = "Select", onChange = () => {}, showSearch = true) {
  const wrapper = el("div", { class: "custom-select multi" });
  const display = el("div", { class: "custom-select-display", text: placeholder });
  const list = el("ul", { class: "custom-select-list" });
  let selected = new Set(initial || []);

  // persistent search input
  let searchInput = null;

  function renderDisplay() {
    display.textContent = selected.size ? Array.from(selected).join(", ") : placeholder;
  }

  function renderOptions(filter = "") {
    // clear all except search container
    list.querySelectorAll(".custom-option").forEach(o => o.remove());

    const filtered = options.filter(o => {
      const f = (filter || "").toLowerCase();
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

  function openDropdown() {
    list.classList.add("open");
    openCustomLists.add(list);
    if (showSearch && searchInput) setTimeout(() => searchInput.focus(), 0);
  }

  function closeDropdown() {
    list.classList.remove("open");
    openCustomLists.delete(list);
  }

  function toggleDropdown() {
    list.classList.contains("open") ? closeDropdown() : openDropdown();
  }

  // create search (once)
  if (showSearch) {
    const searchLi = el("li", { class: "search-container" });
    searchInput = el("input", { type: "text", class: "inline-search", placeholder: "Search..." });
    searchInput.oninput = e => renderOptions(e.target.value);
    searchLi.appendChild(searchInput);
    list.appendChild(searchLi);
  }

  // render initial options
  renderOptions();

  display.onclick = toggleDropdown;
  wrapper.appendChild(display);
  wrapper.appendChild(list);
  renderDisplay();

  document.addEventListener("click", e => {
    if (!wrapper.contains(e.target)) closeDropdown();
  });

  return { wrapper, getSelected: () => Array.from(selected) };
}


  /* ---------------------------------------
     FORM RENDERERS
  --------------------------------------- */
  function renderOrg() {
    formArea.innerHTML = "";
    addSectionTitle("Organization", "Logo, Contacts, Social Profile");

    // --- @type selectors
    const typeRow = el("div", { class: "form-row inline" });
    const mainWrap = el("div", { class: "form-row" });
    mainWrap.appendChild(el("label", { text: "Organization @type" }));
    const mainSelect = createCustomSelect(orgTypes, form["@typeGeneral"], val => {
      setKey("@typeGeneral", val);
      updateSubSelect(val);
      updatePreview();
    });
    mainWrap.appendChild(mainSelect.wrapper);

    const subWrap = el("div", { class: "form-row" });
    subWrap.appendChild(el("label", { text: "More specific @type" }));
    const subSelect = createCustomSelect([], form["@typeSpecific"], val => {
      setKey("@typeSpecific", val);
      updatePreview();
    });
    subSelect.setPlaceholder("No specific types available");
    subWrap.appendChild(subSelect.wrapper);

    typeRow.appendChild(mainWrap);
    typeRow.appendChild(subWrap);
    formArea.appendChild(typeRow);

    function updateSubSelect(primaryVal) {
      const subs = orgSubTypes[primaryVal] || [];
      if (subs.length === 0) {
        subSelect.setOptions([]);
        subSelect.setPlaceholder("No specific types available");
        setKey("@typeSpecific", "");
      } else {
        subSelect.setOptions(subs);
        subSelect.setValue(subs[0]?.value || "");
        setKey("@typeSpecific", subs[0]?.value || "");
      }
    }
    updateSubSelect(form["@typeGeneral"]);

    // --- Name + Alt Name
    const nameRow = el("div", { class: "form-row inline" });
    nameRow.appendChild(rowInput("Name", "name", form.name));
    nameRow.appendChild(rowInput("Alternative Name", "alternateName", form.alternateName));
    formArea.appendChild(nameRow);

    // --- URL + Logo
    const urlRow = el("div", { class: "form-row inline" });
    urlRow.appendChild(rowInput("Website URL", "url", form.url, true));
    urlRow.appendChild(rowInput("Logo URL", "logo", form.logo, true));
    formArea.appendChild(urlRow);

    // --- Social Profiles
    const socialWrap = el("div", { class: "form-row" });
    socialWrap.appendChild(el("label", { text: "Social Profiles" }));

    (form.sameAs || []).forEach((v, i) => {
      const r = el("div", { class: "form-row social-profile" });
      const input = el("input", { type: "url", placeholder: "Enter Facebook, Instagram, or other social profile URL", value: v });
      const hint = el("div", { class: "hint", text: "Please enter a valid URL." });
      hint.style.display = "none";
      input.oninput = (e) => {
        const val = e.target.value.trim();
        form.sameAs[i] = val;
        if (val && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val)) {
          input.classList.add("error");
          hint.style.display = "block";
        } else {
          input.classList.remove("error");
          hint.style.display = "none";
        }
        updatePreview();
      };
      const rm = el("button", { class: "remove-btn", type: "button" });
      rm.appendChild(el("img", { src: "../components/icons/remove.svg", alt: "Remove", class: "remove-icon" }));
      rm.onclick = () => { form.sameAs.splice(i, 1); renderForm(currentType); updatePreview(); };
      const inputRow = el("div", { class: "input-row" });
      inputRow.appendChild(input);
      inputRow.appendChild(rm);
      r.appendChild(inputRow);
      r.appendChild(hint);
      socialWrap.appendChild(r);
    });

    const addS = el("button", { class: "btn primary", text: "Add Social Profile" });
    addS.onclick = () => { form.sameAs = form.sameAs || []; form.sameAs.push(""); renderForm(currentType); updatePreview(); };
    socialWrap.appendChild(addS);
    formArea.appendChild(socialWrap);

    // --- Contact Points
    const cpWrap = el("div", { class: "form-row" });
    cpWrap.appendChild(el("label", { text: "Add Contact" }));

    const contactTypes = [
      "Customer service", "Technical support", "Billing support",
      "Bill payment", "Sales", "Reservations", "Credit card support",
      "Emergency", "Baggage tracking", "Roadside assistance",
      "Package tracking", "Other"
    ];

    const serviceAreas = [
      { value: "US", desc: "United States" },
      { value: "CA", desc: "Canada" },
      { value: "GB", desc: "United Kingdom" },
      { value: "AU", desc: "Australia" },
      { value: "KE", desc: "Kenya" },
      { value: "NG", desc: "Nigeria" },
      { value: "ZA", desc: "South Africa" },
      { value: "IN", desc: "India" },
      { value: "DE", desc: "Germany" },
      { value: "FR", desc: "France" },
      { value: "BR", desc: "Brazil" },
      { value: "CN", desc: "China" }
    ];

    const languages = [
      { value: "en", desc: "English" },
      { value: "fr", desc: "French" },
      { value: "es", desc: "Spanish" },
      { value: "sw", desc: "Swahili" },
      { value: "de", desc: "German" },
      { value: "hi", desc: "Hindi" },
      { value: "ar", desc: "Arabic" },
      { value: "pt", desc: "Portuguese" }
    ];

    const optionTypes = [
      { value: "TollFree", desc: "Toll-free" },
      { value: "HearingImpairedSupported", desc: "Hearing impaired" }
    ];

    (form.contactPoint || []).forEach((cp, i) => {
      const section = el("div", { class: "contact-block card" });

      // --- Inline Row: Contact Type + Phone Number ---
      const inlineRow = el("div", { class: "form-row inline phone-row" });

      // CONTACT TYPE
      const typeWrap = el("div", { class: "form-row" });
      typeWrap.appendChild(el("label", { text: "Type" }));
      const typeSelect = createCustomSelect(contactTypes.map(c => ({ value: c, desc: "" })), cp.contactType || "", val => {
        form.contactPoint[i].contactType = val;
        updatePreview();
      });
      typeSelect.setPlaceholder("Select contact type");
      typeWrap.appendChild(typeSelect.wrapper);
      inlineRow.appendChild(typeWrap);

      // PHONE NUMBER
      const phoneWrap = el("div", { class: "form-row" });
      phoneWrap.appendChild(el("label", { text: "Phone Number" }));
      const phoneInput = el("input", { type: "text", placeholder: "Format: +1-401-555-1212", value: cp.telephone || "" });
      phoneInput.oninput = e => { form.contactPoint[i].telephone = e.target.value; updatePreview(); };
      phoneWrap.appendChild(phoneInput);
      // REMOVE button
      const rm = el("button", { class: "remove-btn", type: "button" });
      rm.appendChild(el("img", { src: "../components/icons/remove.svg", alt: "Remove", class: "remove-icon" }));
      rm.onclick = () => { form.contactPoint.splice(i, 1); renderForm(currentType); updatePreview(); };
      phoneWrap.appendChild(rm);

      inlineRow.appendChild(phoneWrap);
      section.appendChild(inlineRow);

      // --- Inline Row: Areas Served, Languages, Options ---
      const tripleRow = el("div", { class: "form-row inline triple-grid" });

      // AREA(S) SERVED (multi-select with inline search)
      const areaWrap = el("div", { class: "form-row" });
      areaWrap.appendChild(el("label", { text: "Area(s) Served" }));
      const areaSelect = createMultiSelect(serviceAreas, cp.areaServed || [], "Area(s)", vals => {
        form.contactPoint[i].areaServed = vals;
        updatePreview();
      }, true);
      areaWrap.appendChild(areaSelect.wrapper);
      tripleRow.appendChild(areaWrap);

      // LANGUAGE(S) (multi-select with inline search)
      const langWrap = el("div", { class: "form-row" });
      langWrap.appendChild(el("label", { text: "Language(s)" }));
      const langSelect = createMultiSelect(languages, cp.availableLanguage || [], "Language(s)", vals => {
        form.contactPoint[i].availableLanguage = vals;
        updatePreview();
      }, true);
      langWrap.appendChild(langSelect.wrapper);
      tripleRow.appendChild(langWrap);

      // OPTIONS (multi-select WITHOUT search)
      const optWrap = el("div", { class: "form-row" });
      optWrap.appendChild(el("label", { text: "Options" }));
      const optSelect = createMultiSelect(optionTypes, cp.options || [], "Select options", vals => {
        form.contactPoint[i].options = vals;
        updatePreview();
      }, false);
      optWrap.appendChild(optSelect.wrapper);
      tripleRow.appendChild(optWrap);

      section.appendChild(tripleRow);
      cpWrap.appendChild(section);
    });

    const addC = el("button", { class: "btn primary", text: "Add Phone Number" });
    addC.onclick = () => {
      form.contactPoint = form.contactPoint || [];
      form.contactPoint.push({
        contactType: "",
        telephone: "",
        areaServed: [],
        availableLanguage: [],
        options: []
      });
      renderForm(currentType);
      updatePreview();
    };
    cpWrap.appendChild(addC);
    formArea.appendChild(cpWrap);
  }

  /* ---------------------------------------
     OTHER SCHEMA TYPES (Article, Product, LocalBusiness, FAQ)
     Kept consistent with earlier implementation
  --------------------------------------- */
  function renderArticle() {
    formArea.innerHTML = "";
    addSectionTitle("Article", "Headline, Author, and Publish Date");
    formArea.appendChild(rowInput("Headline", "headline", form.headline));
    formArea.appendChild(rowInput("Author", "author", form.author));
    formArea.appendChild(rowInput("Date Published", "datePublished", form.datePublished));
    formArea.appendChild(rowInput("Image URL", "image", form.image, true));
    formArea.appendChild(rowInput("Description", "description", form.description));
  }

  function renderProduct() {
    formArea.innerHTML = "";
    addSectionTitle("Product", "Details, Price, and SKU");
    formArea.appendChild(rowInput("Product Name", "name", form.name));
    formArea.appendChild(rowInput("Image URL", "image", form.image, true));
    formArea.appendChild(rowInput("Description", "description", form.description));
    formArea.appendChild(rowInput("SKU", "sku", form.sku));
    formArea.appendChild(rowInput("Price", "price", form.price));
    formArea.appendChild(rowInput("Currency", "currency", form.currency));
  }

  function renderLocalBusiness() {
    formArea.innerHTML = "";
    addSectionTitle("Local Business", "Name, Address, and Contact Info");
    formArea.appendChild(rowInput("Business Name", "name", form.name));
    formArea.appendChild(rowInput("Website URL", "url", form.url, true));
    formArea.appendChild(rowInput("Phone Number", "phone", form.phone));
    formArea.appendChild(rowInput("Address", "address", form.address));
  }

  function renderFAQ() {
    formArea.innerHTML = "";
    addSectionTitle("FAQ", "Questions and Answers");
    (form.mainEntity || []).forEach((item, i) => {
      const qBox = el("div", { class: "faq-box" });
      qBox.appendChild(rowInput("Question", "mainEntity." + i + ".question", item.question));
      qBox.appendChild(rowInput("Answer", "mainEntity." + i + ".answer", item.answer));
      const rm = el("button", { class: "btn", text: "Remove" });
      rm.onclick = () => {
        form.mainEntity.splice(i, 1);
        renderForm(currentType);
        updatePreview();
      };
      qBox.appendChild(rm);
      formArea.appendChild(qBox);
    });
    const addQ = el("button", { class: "btn primary", text: "Add Question" });
    addQ.onclick = () => {
      form.mainEntity = form.mainEntity || [];
      form.mainEntity.push({ question: "", answer: "" });
      renderForm(currentType);
    };
    formArea.appendChild(addQ);
  }

  function renderForm(t) {
    switch (t) {
      case "Organization": return renderOrg();
      case "Article": return renderArticle();
      case "Product": return renderProduct();
      case "LocalBusiness": return renderLocalBusiness();
      case "FAQ": return renderFAQ();
      default:
        formArea.innerHTML = "";
        addSectionTitle("Schema", "General Schema Form");
        formArea.appendChild(el("div", { text: "Schema type not supported yet." }));
    }
  }

  /* ---------------------------------------
     VALIDATION + PREVIEW
  --------------------------------------- */
  function addSectionTitle(type, description) {
    const title = el("div", { class: "schema-section-title" });
    title.innerHTML = `<strong>${type}</strong> – ${description}`;
    formArea.appendChild(title);
  }

  function isValidURL(str) {
    return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test((str || "").trim());
  }

  function rowInput(label, key, val = "", isUrl = false) {
    const r = el("div", { class: "form-row" });
    r.appendChild(el("label", { text: label }));
    const i = el("input", { class: "input", type: "text", value: val || "" });
    const hint = el("div", { class: "hint", text: "Invalid URL" });
    hint.style.display = "none";
    i.oninput = e => {
      const v = e.target.value;
      setKey(key, v);
      if (isUrl) {
        if (v && !isValidURL(v)) { hint.style.display = "block"; i.classList.add("error"); }
        else { hint.style.display = "none"; i.classList.remove("error"); }
      }
    };
    r.appendChild(i);
    r.appendChild(hint);
    return r;
  }

  function setKey(path, val) {
    const parts = path.split(".");
    let ref = form;
    for (const p of parts.slice(0, -1)) {
      // create object/array if missing
      if (ref[p] === undefined) ref[p] = {};
      ref = ref[p];
    }
    ref[parts.at(-1)] = val;
    updatePreview();
  }

  function buildSchema(t, f) {
    if (t === "Organization") {
      return {
        "@context": "https://schema.org",
        "@type": f["@typeSpecific"] || f["@typeGeneral"],
        name: f.name || undefined,
        alternateName: f.alternateName || undefined,
        url: f.url || undefined,
        logo: f.logo || undefined,
        sameAs: f.sameAs?.filter(Boolean),
        contactPoint: (f.contactPoint || []).map(c => ({
          "@type": "ContactPoint",
          contactType: c.contactType || undefined,
          telephone: c.telephone || undefined,
          areaServed: c.areaServed && c.areaServed.length ? c.areaServed : undefined,
          availableLanguage: c.availableLanguage && c.availableLanguage.length ? c.availableLanguage : undefined,
          options: c.options && c.options.length ? c.options : undefined
        }))
      };
    }
    if (t === "Article") {
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: f.headline || undefined,
        author: f.author || undefined,
        datePublished: f.datePublished || undefined,
        image: f.image || undefined,
        description: f.description || undefined
      };
    }
    if (t === "Product") {
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: f.name || undefined,
        image: f.image || undefined,
        description: f.description || undefined,
        sku: f.sku || undefined,
        offers: {
          "@type": "Offer",
          price: f.price || undefined,
          priceCurrency: f.currency || undefined
        }
      };
    }
    if (t === "LocalBusiness") {
      return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: f.name || undefined,
        url: f.url || undefined,
        telephone: f.phone || undefined,
        address: f.address || undefined
      };
    }
    if (t === "FAQ") {
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: (f.mainEntity || []).map(q => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: { "@type": "Answer", text: q.answer }
        }))
      };
    }
    return { "@context": "https://schema.org" };
  }

  function validate(t, s) {
    const e = [];
    if (t === "Organization") {
      if (!s.name) e.push("Organization `name` is required.");
      if (!s.url) e.push("Organization `url` strongly recommended.");
    }
    return e;
  }

  function updatePreview() {
    const data = buildSchema(currentType, form);
    jsonPreview.textContent = JSON.stringify(data, null, 2);
    if (errorCount) {
      const errors = validate(currentType, data);
      errorCount.textContent = "Errors: " + errors.length;
      if (hints) {
        hints.innerHTML = "";
        errors.forEach(x => hints.appendChild(el("div", { class: "hint", text: x })));
      }
    }
  }

  /* ---------------------------------------
     BUTTON ACTIONS
  --------------------------------------- */
  if (schemaType) {
    schemaType.onchange = () => {
      currentType = schemaType.value;
      form = JSON.parse(JSON.stringify(defaults[currentType] || {}));
      renderForm(currentType);
      updatePreview();
    };
  }

  if (copyBtn) copyBtn.onclick = () => navigator.clipboard.writeText(jsonPreview.textContent || "");
  if (downloadBtn) downloadBtn.onclick = () => {
    const blob = new Blob([jsonPreview.textContent || ""], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: (currentType || "schema").toLowerCase() + "-schema.json" });
    document.body.appendChild(a); a.click(); a.remove();
  };
  if (resetBtn) resetBtn.onclick = () => {
    form = JSON.parse(JSON.stringify(defaults[currentType] || {}));
    renderForm(currentType);
    updatePreview();
  };

  /* ---------------------------------------
     INIT
  --------------------------------------- */
  renderForm(currentType);
  updatePreview();
})();
