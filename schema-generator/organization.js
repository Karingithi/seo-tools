// organization.js — Cralite Schema Generator: Organization Module (final fixed build)
(function () {
  // Wait for Core (schema-core.js) to be available
  function waitForCore(cb) {
    if (window.SchemaCore) return cb();
    let tries = 0;
    const id = setInterval(() => {
      if (window.SchemaCore) {
        clearInterval(id);
        return cb();
      }
      tries++;
      if (tries > 60) {
        clearInterval(id);
        console.error("organization.js: SchemaCore not found — ensure core.js loads before organization.js");
      }
    }, 50);
  }

  waitForCore(() => {
    const {
      el, rowInput, createCustomSelect, createMultiSelect,
      addSectionTitle, registerSchemaType
    } = window.SchemaCore;

    /* ---------------------------------------
       ORG TYPES + SUBTYPES
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
      "@typeGeneral": "Organization",
      "@typeSpecific": "",
      name: "",
      alternateName: "",
      url: "",
      logo: "",
      sameAs: [],
      contactPoint: []
    };

    /* ---------------------------------------
       RENDER FORM
    --------------------------------------- */
    function renderOrganization(form, updatePreview) {
      const formArea = document.querySelector("#formArea");
      if (!formArea) return console.error("organization.js: #formArea not found");
      formArea.innerHTML = "";
      addSectionTitle("Organization", "Logo, Contacts, and Social Profiles");

      // --- Type Selects
      const typeRow = el("div", { class: "form-row inline" });
      const mainWrap = el("div", { class: "form-row" });
      mainWrap.appendChild(el("label", { text: "Organization @type" }));

      const mainSelect = createCustomSelect(
        orgTypes.map(t => ({ value: t.value, desc: t.desc })),
        form["@typeGeneral"],
        val => {
          form["@typeGeneral"] = val;
          recreateSubSelect(val);
          updatePreview();
        }
      );
      mainWrap.appendChild(mainSelect.wrapper);

      const subWrap = el("div", { class: "form-row", id: "org-sub-wrap" });
      subWrap.appendChild(el("label", { text: "More specific @type" }));
      formArea.appendChild(typeRow);
      typeRow.appendChild(mainWrap);
      typeRow.appendChild(subWrap);

      function recreateSubSelect(primaryVal) {
        const container = document.getElementById("org-sub-wrap");
        if (!container) return;
        container.querySelectorAll(".custom-select").forEach(n => n.remove());

        const subs = orgSubTypes[primaryVal] || [];

        if (!subs.length) {
          const emptySelect = createCustomSelect([], "", () => {});
          container.appendChild(emptySelect.wrapper);
          container.style.opacity = 0.6;
          form["@typeSpecific"] = "";
          return;
        }

        container.style.opacity = 1;
        const newSub = createCustomSelect(
          subs.map(s => ({ value: s.value, desc: s.desc })),
          form["@typeSpecific"] || subs[0].value,
          v => { form["@typeSpecific"] = v; updatePreview(); }
        );
        container.appendChild(newSub.wrapper);
        form["@typeSpecific"] = form["@typeSpecific"] || subs[0].value;
      }

      recreateSubSelect(form["@typeGeneral"]);

      // --- Name Fields
      const nameRow = el("div", { class: "form-row inline" });
      nameRow.appendChild(rowInput("Name", "name", form.name, false, v => { form.name = v; updatePreview(); }));
      nameRow.appendChild(rowInput("Alternative Name", "alternateName", form.alternateName, false, v => { form.alternateName = v; updatePreview(); }));
      formArea.appendChild(nameRow);

      // --- URLs
      const urlRow = el("div", { class: "form-row inline" });
      urlRow.appendChild(rowInput("Website URL", "url", form.url, true, v => { form.url = v; updatePreview(); }));
      urlRow.appendChild(rowInput("Logo URL", "logo", form.logo, true, v => { form.logo = v; updatePreview(); }));
      formArea.appendChild(urlRow);

      // --- Social Profiles
      const socialWrap = el("div", { class: "form-row" });
      socialWrap.appendChild(el("label", { text: "Social Profiles" }));

      (form.sameAs || []).forEach((v, i) => {
        const row = el("div", { class: "form-row social-profile" });
        const input = el("input", { type: "url", placeholder: "https://facebook.com/example", value: v });
        const hint = el("div", { class: "hint", text: "Invalid URL" });
        hint.style.display = "none";

        input.oninput = e => {
          const val = e.target.value.trim();
          form.sameAs[i] = val;
          const valid = !val || /^https?:\/\/[^\s]+$/i.test(val);
          input.classList.toggle("error", !valid);
          hint.style.display = valid ? "none" : "block";
          updatePreview();
        };

        const rm = el("button", { class: "remove-btn", type: "button", text: "×" });
        rm.onclick = () => { form.sameAs.splice(i, 1); renderOrganization(form, updatePreview); updatePreview(); };

        const inputRow = el("div", { class: "input-row" });
        inputRow.appendChild(input);
        inputRow.appendChild(rm);
        row.appendChild(inputRow);
        row.appendChild(hint);
        socialWrap.appendChild(row);
      });

      const addS = el("button", { class: "btn primary", text: "Add Social Profile" });
      addS.onclick = () => {
        form.sameAs.push("");
        renderOrganization(form, updatePreview);
        updatePreview();
      };
      socialWrap.appendChild(addS);
      formArea.appendChild(socialWrap);

      // --- Contact Points
      const cpWrap = el("div", { class: "form-row" });
      cpWrap.appendChild(el("label", { text: "Contact Points" }));

      const contactTypes = [
        "Customer service", "Technical support", "Billing support",
        "Sales", "Reservations", "Emergency", "Other"
      ];
      const serviceAreas = [
        { value: "KE", desc: "Kenya" },
        { value: "US", desc: "United States" },
        { value: "GB", desc: "United Kingdom" },
        { value: "CA", desc: "Canada" }
      ];
      const languages = [
        { value: "en", desc: "English" },
        { value: "sw", desc: "Swahili" },
        { value: "fr", desc: "French" },
        { value: "de", desc: "German" }
      ];
      const optionTypes = [
        { value: "TollFree", desc: "Toll-free" },
        { value: "HearingImpairedSupported", desc: "Hearing impaired" }
      ];

      (form.contactPoint || []).forEach((cp, i) => {
        const section = el("div", { class: "contact-block card" });
        const inlineRow = el("div", { class: "form-row inline phone-row" });

        const typeWrap = el("div", { class: "form-row" });
        typeWrap.appendChild(el("label", { text: "Type" }));
        const typeSelect = createCustomSelect(contactTypes.map(t => ({ value: t })), cp.contactType || "", val => {
          form.contactPoint[i].contactType = val; updatePreview();
        });
        typeWrap.appendChild(typeSelect.wrapper);
        inlineRow.appendChild(typeWrap);

        const phoneWrap = el("div", { class: "form-row" });
        phoneWrap.appendChild(el("label", { text: "Phone Number" }));
        const phoneInput = el("input", { type: "text", placeholder: "+254700000000", value: cp.telephone || "" });
        phoneInput.oninput = e => { form.contactPoint[i].telephone = e.target.value; updatePreview(); };
        phoneWrap.appendChild(phoneInput);
        const rm = el("button", { class: "remove-btn", type: "button", text: "×" });
        rm.onclick = () => { form.contactPoint.splice(i, 1); renderOrganization(form, updatePreview); updatePreview(); };
        phoneWrap.appendChild(rm);
        inlineRow.appendChild(phoneWrap);
        section.appendChild(inlineRow);

        const tripleRow = el("div", { class: "form-row inline triple-grid" });

        const areaWrap = el("div", { class: "form-row" });
        areaWrap.appendChild(el("label", { text: "Area(s) Served" }));
        const areaSelect = createMultiSelect(serviceAreas, cp.areaServed || [], "Area(s)", vals => {
          form.contactPoint[i].areaServed = vals; updatePreview();
        }, true);
        areaWrap.appendChild(areaSelect.wrapper);
        tripleRow.appendChild(areaWrap);

        const langWrap = el("div", { class: "form-row" });
        langWrap.appendChild(el("label", { text: "Language(s)" }));
        const langSelect = createMultiSelect(languages, cp.availableLanguage || [], "Languages", vals => {
          form.contactPoint[i].availableLanguage = vals; updatePreview();
        }, true);
        langWrap.appendChild(langSelect.wrapper);
        tripleRow.appendChild(langWrap);

        const optWrap = el("div", { class: "form-row" });
        optWrap.appendChild(el("label", { text: "Options" }));
        const optSelect = createMultiSelect(optionTypes, cp.options || [], "Options", vals => {
          form.contactPoint[i].options = vals; updatePreview();
        }, false);
        optWrap.appendChild(optSelect.wrapper);
        tripleRow.appendChild(optWrap);

        section.appendChild(tripleRow);
        cpWrap.appendChild(section);
      });

      const addC = el("button", { class: "btn primary", text: "Add Phone Number" });
      addC.onclick = () => {
        form.contactPoint.push({
          contactType: "",
          telephone: "",
          areaServed: [],
          availableLanguage: [],
          options: []
        });
        renderOrganization(form, updatePreview);
        updatePreview();
      };
      cpWrap.appendChild(addC);
      formArea.appendChild(cpWrap);
    }

    /* ---------------------------------------
       BUILD + VALIDATE
    --------------------------------------- */
    function buildOrganizationSchema(f) {
      return {
        "@context": "https://schema.org",
        "@type": f["@typeSpecific"] || f["@typeGeneral"] || "Organization",
        name: f.name || undefined,
        alternateName: f.alternateName || undefined,
        url: f.url || undefined,
        logo: f.logo || undefined,
        sameAs: (f.sameAs || []).filter(Boolean),
        contactPoint: (f.contactPoint || []).map(c => ({
          "@type": "ContactPoint",
          contactType: c.contactType || undefined,
          telephone: c.telephone || undefined,
          areaServed: (c.areaServed && c.areaServed.length) ? c.areaServed : undefined,
          availableLanguage: (c.availableLanguage && c.availableLanguage.length) ? c.availableLanguage : undefined,
          options: (c.options && c.options.length) ? c.options : undefined
        }))
      };
    }

    function validateOrganization(schema) {
      const errors = [];
      if (!schema.name) errors.push("Missing organization name.");
      if (!schema.url) errors.push("Organization URL is strongly recommended.");
      if (schema.sameAs && schema.sameAs.some(u => u && !/^https?:\/\/[^\s]+$/i.test(u))) errors.push("One or more social profile URLs look invalid.");
      if (schema.contactPoint && schema.contactPoint.some(c => !c.telephone)) errors.push("Each contact point must include a phone number.");
      return errors;
    }

    /* ---------------------------------------
       REGISTER
    --------------------------------------- */
    registerSchemaType("Organization", renderOrganization, buildOrganizationSchema, defaults, validateOrganization);

    // Auto-render if currently selected
    const sel = document.querySelector("#schemaType");
    if (sel && sel.value === "Organization" && window.SchemaCore?.renderForm) {
      window.SchemaCore.renderForm("Organization");
    }
  });
})();
