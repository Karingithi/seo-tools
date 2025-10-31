// faq.js — Cralite Schema Generator: FAQ Module (with references ✅)
(function () {
  const { el, addSectionTitle, registerSchemaType, updatePreview } = window.SchemaCore;

  const faqDefaults = {
    mainEntity: [
      { question: "", answer: "" }
    ]
  };

  function renderFAQ(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";
    addSectionTitle("FAQ Page", "Add questions and answers to create a valid FAQ schema.");

    (form.mainEntity || []).forEach((item, i) => {
      const qBox = el("div", { class: "faq-box card" });

      const qLabel = el("label", { text: `Question ${i + 1}` });
      const qInput = el("input", {
        type: "text",
        placeholder: "Enter the question",
        value: item.question || ""
      });
      qInput.oninput = e => {
        form.mainEntity[i].question = e.target.value.trim();
        updatePreview();
      };

      const aLabel = el("label", { text: "Answer" });
      const aTextarea = el("textarea", {
        rows: 3,
        placeholder: "Provide the answer"
      });
      aTextarea.value = item.answer || "";
      aTextarea.oninput = e => {
        form.mainEntity[i].answer = e.target.value.trim();
        updatePreview();
      };

      const rm = el("button", { class: "remove-btn", type: "button", text: "×" });
      rm.onclick = () => {
        form.mainEntity.splice(i, 1);
        renderFAQ(form);
        updatePreview();
      };

      qBox.append(qLabel, qInput, aLabel, aTextarea, rm);
      formArea.appendChild(qBox);
    });

    const addQ = el("button", { class: "btn primary", text: "Add Question" });
    addQ.onclick = () => {
      form.mainEntity.push({ question: "", answer: "" });
      renderFAQ(form);
      updatePreview();
    };
    formArea.appendChild(addQ);

    /* ✅ Documentation References */
    const refs = el("div", { class: "schema-references" });
    refs.innerHTML = `
      <div class="ref-columns">
        <div class="ref-block">
          <strong>Schema.org's references:</strong>
          <ul>
            <li><a href="https://schema.org/FAQPage" target="_blank" rel="noopener">FAQPage</a></li>
          </ul>
        </div>

        <div class="ref-block">
          <strong>Google's documentation:</strong>
          <ul>
            <li><a href="https://developers.google.com/search/docs/appearance/structured-data/faqpage" target="_blank" rel="noopener">FAQ Page</a></li>
          </ul>
        </div>
      </div>
    `;
    formArea.appendChild(refs);
  }

  function buildFAQSchema(f) {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: (f.mainEntity || [])
        .filter(q => q.question && q.answer)
        .map(q => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer
          }
        }))
    };
  }

  function validateFAQ(schema) {
    const errors = [];
    if (!schema.mainEntity || schema.mainEntity.length === 0) {
      errors.push("At least one question-answer pair is required.");
    } else {
      schema.mainEntity.forEach((q, i) => {
        if (!q.name) errors.push(`FAQ #${i + 1}: Missing question.`);
        if (!q.acceptedAnswer?.text) errors.push(`FAQ #${i + 1}: Missing answer.`);
      });
    }
    return errors;
  }

  registerSchemaType("FAQ Page", renderFAQ, buildFAQSchema, faqDefaults, validateFAQ);
})();
