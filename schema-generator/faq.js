// faq.js — Cralite Schema Generator: FAQ Module
(function () {
  const { el, addSectionTitle, rowInput, registerSchemaType, updatePreview } = window.SchemaCore;

  // Default structure for new FAQ schema
  const faqDefaults = {
    mainEntity: [
      { question: "", answer: "" }
    ]
  };

  // --- RENDER FORM ---
  function renderFAQ(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";
    addSectionTitle("FAQ Page", "Add questions and answers to create a valid FAQ schema.");

    // For each FAQ question
    (form.mainEntity || []).forEach((item, i) => {
      const qBox = el("div", { class: "faq-box card" });

      // Question field
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

      // Answer field
      const aLabel = el("label", { text: "Answer" });
      const aTextarea = el("textarea", {
        rows: 3,
        placeholder: "Provide the answer for this question"
      });
      aTextarea.value = item.answer || "";
      aTextarea.oninput = e => {
        form.mainEntity[i].answer = e.target.value.trim();
        updatePreview();
      };

      // Remove button
      const rm = el("button", { class: "remove-btn", type: "button" });
      rm.appendChild(el("img", {
        src: "../components/icons/remove.svg",
        alt: "Remove",
        class: "remove-icon"
      }));
      rm.onclick = () => {
        form.mainEntity.splice(i, 1);
        renderFAQ(form);
        updatePreview();
      };

      // Combine all
      qBox.appendChild(qLabel);
      qBox.appendChild(qInput);
      qBox.appendChild(aLabel);
      qBox.appendChild(aTextarea);
      qBox.appendChild(rm);
      formArea.appendChild(qBox);
    });

    // Add new question button
    const addQ = el("button", { class: "btn primary", text: "Add Question" });
    addQ.onclick = () => {
      form.mainEntity.push({ question: "", answer: "" });
      renderFAQ(form);
      updatePreview();
    };
    formArea.appendChild(addQ);
  }

  // --- BUILD JSON-LD ---
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

  // --- VALIDATION ---
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

  // Register this schema type with the core
  registerSchemaType("FAQ", renderFAQ, buildFAQSchema, faqDefaults, validateFAQ);
})();
