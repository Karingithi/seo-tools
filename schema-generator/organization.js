// organization.js — Cralite Schema Generator: Organization Module (Final Build)
(function () {

  function waitForCore(cb) {
    if (window.SchemaCore) return cb();
    let tries = 0;
    const id = setInterval(() => {
      if (window.SchemaCore) {
        clearInterval(id);
        cb();
      } else if (++tries > 60) {
        clearInterval(id);
        console.error("organization.js: SchemaCore not found — ensure core.js loads first");
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
      { value: "FundingScheme", desc: "Grant funding program." },
      { value: "GovernmentOrganization", desc: "Public or state-run institution." },
      { value: "LibrarySystem", desc: "Network of cooperating libraries." },
      { value: "MedicalOrganization", desc: "Healthcare provider." },
      { value: "NGO", desc: "Non-profit organization." },
      { value: "NewsMediaOrganization", desc: "Publishes or broadcasts news." },
      { value: "OnlineBusiness", desc: "Internet-based business." },
      { value: "PerformingGroup", desc: "Music, dance, or theater group." },
      { value: "PoliticalParty", desc: "Organized political movement." },
      { value: "Project", desc: "Organized planned initiative." },
      { value: "ResearchOrganization", desc: "Academic or scientific research." },
      { value: "SearchRescueOrganization", desc: "Emergency search & rescue." },
      { value: "SportsOrganization", desc: "Sports organizing body." },
      { value: "WorkersUnion", desc: "Represents employees’ interests." }
    ];

    const orgSubTypes = {
      EducationalOrganization: [
        { value: "CollegeOrUniversity", desc: "Higher education institution." },
        { value: "ElementarySchool", desc: "Primary education." },
        { value: "HighSchool", desc: "Secondary education." },
        { value: "MiddleSchool", desc: "Intermediate level school." },
        { value: "Preschool", desc: "Early childhood education." },
        { value: "School", desc: "General education facility." }
      ],
      MedicalOrganization: [
        { value: "Dentist", desc: "Dental healthcare." },
        { value: "Hospital", desc: "Large healthcare facility." },
        { value: "MedicalClinic", desc: "Outpatient healthcare." },
        { value: "Pharmacy", desc: "Dispenses medicines." },
        { value: "Physician", desc: "Licensed medical doctor." },
        { value: "VeterinaryCare", desc: "Animal healthcare." }
      ],
      PerformingGroup: [
        { value: "DanceGroup", desc: "Dance performers." },
        { value: "MusicGroup", desc: "Musical group." },
        { value: "TheaterGroup", desc: "Stage performers." }
      ],
      SportsOrganization: [
        { value: "SportsClub", desc: "Organized sports club." },
        { value: "SportsTeam", desc: "Team in competitions." }
      ]
    };

    /* ---------------------------------------
       DEFAULT FORM VALUES ✅ Now has default ContactPoint
    --------------------------------------- */
    const defaults = {
      "@typeGeneral": "Organization",
      "@typeSpecific": "",
      name: "",
      alternateName: "",
      url: "",
      logo: "",
      sameAs: [],
      contactPoint: [{
        contactType: "Customer service", // ✅ Default
        telephone: "",
        areaServed: [],
        availableLanguage: [],
        options: []
      }]
    };

    /* ---------------------------------------
       RENDER FORM
    --------------------------------------- */
    function renderOrganization(form, updatePreview) {
      const formArea = document.querySelector("#formArea");
      formArea.innerHTML = "";
      addSectionTitle("Organization", "Logo, Contacts, and Social Profiles");

      // ---- Organization Type Select
      const typeRow = el("div", { class: "form-row inline" });

      const mainWrap = el("div", { class: "form-row" });
      mainWrap.appendChild(el("label", { text: "Organization @type" }));

      const mainSelect = createCustomSelect(
        orgTypes,
        form["@typeGeneral"],
        val => {
          form["@typeGeneral"] = val;
          recreateSubSelect(val);
          updatePreview();
        }
      );
      mainWrap.appendChild(mainSelect.wrapper);
      typeRow.appendChild(mainWrap);

      const subWrap = el("div", { class: "form-row", id: "org-sub-wrap" });
      subWrap.appendChild(el("label", { text: "More specific @type" }));
      typeRow.appendChild(subWrap);

      formArea.appendChild(typeRow);

function recreateSubSelect(primaryVal) {
  const container = document.getElementById("org-sub-wrap");
  if (!container) return;

  // Remove any previous selector
  container.querySelectorAll(".custom-select, .disabled-select").forEach(n => n.remove());

  const subs = orgSubTypes[primaryVal] || [];

  if (!subs.length) {
    form["@typeSpecific"] = "";

    const placeholder = el("div", {
      class: "disabled-select",
      text: "Select Option"
    });

    // Make it visually disabled / non-clickable
    placeholder.style.opacity = "0.6";
    placeholder.style.cursor = "not-allowed";
    container.appendChild(placeholder);

    return;
  }

  const initial =
    form["@typeSpecific"] && subs.some(s => s.value === form["@typeSpecific"])
      ? form["@typeSpecific"]
      : subs[0].value;

  const subSelect = createCustomSelect(
    subs,
    initial,
    v => { form["@typeSpecific"] = v; updatePreview(); }
  );

  form["@typeSpecific"] = initial;
  container.appendChild(subSelect.wrapper);
}

      recreateSubSelect(form["@typeGeneral"]);

      // ---- Name Fields
      const nameRow = el("div", { class: "form-row inline" });
      nameRow.appendChild(
        rowInput("Name", "name", form.name, false, v => { form.name = v; updatePreview(); })
      );
      nameRow.appendChild(
        rowInput("Alternative Name", "alternateName", form.alternateName, false, v => { form.alternateName = v; updatePreview(); })
      );
      formArea.appendChild(nameRow);

      // ---- URLs
      const urlRow = el("div", { class: "form-row inline" });
      urlRow.appendChild(
        rowInput("Website URL", "url", form.url, true, v => { form.url = v; updatePreview(); })
      );
      urlRow.appendChild(
        rowInput("Logo URL", "logo", form.logo, true, v => { form.logo = v; updatePreview(); })
      );
      formArea.appendChild(urlRow);

      // ---- Social Profiles (sameAs)
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

        const rm = el("button", { class: "remove-btn", text: "×" });
        rm.onclick = () => { form.sameAs.splice(i, 1); renderOrganization(form, updatePreview); };

        row.append(el("div", { class: "input-row" }, [input, rm]));
        row.appendChild(hint);
        socialWrap.appendChild(row);
      });

      socialWrap.appendChild(
        el("button", { class: "btn primary", text: "Add Social Profile" }, [])
      ).onclick = () => {
        form.sameAs.push("");
        renderOrganization(form, updatePreview);
      };

      formArea.appendChild(socialWrap);

      /* ---------------------------------------
         ✅ ContactPoints now default "Customer service"
      --------------------------------------- */
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
        const card = el("div", { class: "contact-block card" });

        const inlineRow = el("div", { class: "form-row inline" });

        const typeWrap = el("div", { class: "form-row" });
        typeWrap.appendChild(el("label", { text: "Type" }));
        const typeSelect = createCustomSelect(
          contactTypes.map(v => ({ value: v })),
          cp.contactType || "Customer service",
          v => { form.contactPoint[i].contactType = v; updatePreview(); }
        );
        typeWrap.appendChild(typeSelect.wrapper);
        inlineRow.appendChild(typeWrap);

        const phoneWrap = el("div", { class: "form-row" });
        phoneWrap.appendChild(el("label", { text: "Phone Number" }));
        const phoneInput = el("input", { type: "text", placeholder: "+1-401-555-1212", value: cp.telephone || "" });
        phoneInput.oninput = e => { form.contactPoint[i].telephone = e.target.value; updatePreview(); };
        const rm = el("button", { class: "remove-btn", text: "×" });
        rm.onclick = () => { form.contactPoint.splice(i, 1); renderOrganization(form, updatePreview); };
        phoneWrap.append(phoneInput, rm);
        inlineRow.appendChild(phoneWrap);

        card.appendChild(inlineRow);

        const more = el("div", { class: "form-row inline triple-grid" });

        more.appendChild(
          (() => {
            const w = el("div", { class: "form-row" });
            w.appendChild(el("label", { text: "Area(s) Served" }));
            const sel = createMultiSelect(serviceAreas, cp.areaServed || [], "Area(s)", vals => {
              form.contactPoint[i].areaServed = vals; updatePreview();
            });
            w.appendChild(sel.wrapper);
            return w;
          })()
        );

        more.appendChild(
          (() => {
            const w = el("div", { class: "form-row" });
            w.appendChild(el("label", { text: "Language(s)" }));
            const sel = createMultiSelect(languages, cp.availableLanguage || [], "Languages", vals => {
              form.contactPoint[i].availableLanguage = vals; updatePreview();
            });
            w.appendChild(sel.wrapper);
            return w;
          })()
        );

        more.appendChild(
          (() => {
            const w = el("div", { class: "form-row" });
            w.appendChild(el("label", { text: "Options" }));
            const sel = createMultiSelect(optionTypes, cp.options || [], "Options", vals => {
              form.contactPoint[i].options = vals; updatePreview();
            }, false);
            w.appendChild(sel.wrapper);
            return w;
          })()
        );

        card.appendChild(more);
        cpWrap.appendChild(card);
      });

      cpWrap.appendChild(
        el("button", { class: "btn primary", text: "Add Phone Number" })
      ).onclick = () => {
        form.contactPoint.push({
          contactType: "Customer service",
          telephone: "",
          areaServed: [],
          availableLanguage: [],
          options: []
        });
        renderOrganization(form, updatePreview);
      };

      formArea.appendChild(cpWrap);
      /* ---------------------------------------
   ✅ Schema References Footer
--------------------------------------- */
const refs = el("div", { class: "schema-references" });
refs.innerHTML = `
  <div class="ref-columns">
    <div class="ref-block">
      <strong>Schema.org's references:</strong>
      <ul>
        <li><a href="https://schema.org/Organization" target="_blank">Organization</a></li>
      </ul>
    </div>

    <div class="ref-block">
      <strong>Google's documentation:</strong>
      <ul>
        <li><a href="https://developers.google.com/search/docs/appearance/structured-data/logo" target="_blank">Logo</a></li>
        <li><a href="https://developers.google.com/search/docs/appearance/structured-data/social-profile" target="_blank">Social Profile Links</a></li>
      </ul>
    </div>
  </div>
`;
formArea.appendChild(refs);

    }

    /* ---------------------------------------
       BUILD ✅ outputs correct @type logic
    --------------------------------------- */
    function build(f) {
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
          areaServed: c.areaServed?.length ? c.areaServed : undefined,
          availableLanguage: c.availableLanguage?.length ? c.availableLanguage : undefined,
          options: c.options?.length ? c.options : undefined
        }))
      };
    }

    /* ---------------------------------------
       VALIDATE ✅ improved messaging
    --------------------------------------- */
    function validate(schema) {
      const e = [];
      if (!schema.name) e.push("Missing organization name.");
      if (!schema.url) e.push("Website URL recommended.");
      if (schema.sameAs?.some(u => u && !/^https?:\/\/[^\s]+$/i.test(u)))
        e.push("One or more social profile URLs look invalid.");
      if (schema.contactPoint?.some(c => !c.telephone))
        e.push("Each contact point must include a phone number.");
      return e;
    }

    /* ---------------------------------------
       REGISTER
    --------------------------------------- */
    registerSchemaType("Organization", renderOrganization, build, defaults, validate);

  });
})();
