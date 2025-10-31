(function () {
  const { el, addSectionTitle, registerSchemaType, updatePreview } = window.SchemaCore;

  const isValidUrl = v => /^https?:\/\/[^\s]+$/i.test(v);

  const defaults = {
    name: "",
    description: "",
    uploadDate: "",
    durationMin: "",
    durationSec: "",
    thumbnails: [""],
    contentUrl: "",
    embedUrl: "",
    seekUrl: ""
  };

  function renderVideo(form) {
    const formArea = document.querySelector("#formArea");
    formArea.innerHTML = "";
    addSectionTitle("Video", "Google-ready video rich results metadata");

    /* Name */
    const nameRow = el("div", { class: "form-row" });
    nameRow.appendChild(el("label", { text: "Video Name" }));
    const nameInput = el("input", {
      type: "text",
      placeholder: "e.g. How to Install Schema Markup",
      value: form.name || ""
    });
    nameInput.oninput = e => { form.name = e.target.value.trim(); updatePreview(); };
    nameRow.appendChild(nameInput);
    formArea.appendChild(nameRow);

    /* Description */
    const descRow = el("div", { class: "form-row" });
    descRow.appendChild(el("label", { text: "Video Description" }));
    const descInput = el("textarea", {
      rows: 3,
      placeholder: "Short summary that appears on Google"
    });
    descInput.value = form.description || "";
    descInput.oninput = e => { form.description = e.target.value.trim(); updatePreview(); };
    descRow.appendChild(descInput);
    formArea.appendChild(descRow);

    /* Upload Date + Duration */
    const dateTimeRow = el("div", { class: "form-row inline" });

    // Upload Date
    const uploadWrap = el("div", { class: "form-row" });
    uploadWrap.appendChild(el("label", { text: "Upload Date" }));
    const uploadInput = el("input", {
      type: "date",
      value: form.uploadDate || ""
    });
    uploadInput.onchange = e => { form.uploadDate = e.target.value; updatePreview(); };
    uploadWrap.appendChild(uploadInput);
    dateTimeRow.appendChild(uploadWrap);

    // Minutes
    const minWrap = el("div", { class: "form-row" });
    minWrap.appendChild(el("label", { text: "Minutes" }));
    const minInput = el("input", {
      type: "number",
      value: form.durationMin || "",
      min: 0,
      placeholder: "0"
    });
    minInput.oninput = e => {
      form.durationMin = e.target.value.trim();
      updatePreview();
    };
    minWrap.appendChild(minInput);
    dateTimeRow.appendChild(minWrap);

    // Seconds
    const secWrap = el("div", { class: "form-row" });
    secWrap.appendChild(el("label", { text: "Seconds" }));
    const secInput = el("input", {
      type: "number",
      value: form.durationSec || "",
      min: 0,
      placeholder: "0"
    });
    secInput.oninput = e => {
      form.durationSec = e.target.value.trim();
      updatePreview();
    };
    secWrap.appendChild(secInput);
    dateTimeRow.appendChild(secWrap);

    formArea.appendChild(dateTimeRow);

    /* Thumbnails */
    const thumbSec = el("div", { class: "image-section" });
    thumbSec.appendChild(el("label", { text: "Thumbnail URL(s)" }));

    (form.thumbnails || []).forEach((val, i) => {
      const row = el("div", { class: "form-row image-row" });
      const input = el("input", {
        type: "url",
        placeholder: "https://example.com/thumb.jpg",
        value: val || ""
      });
      const hint = el("div", { class: "hint", text: "Invalid URL format" });
      hint.style.display = (!val || isValidUrl(val)) ? "none" : "block";

      input.oninput = e => {
        const v = e.target.value.trim();
        form.thumbnails[i] = v;
        hint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
        updatePreview();
      };

      const rm = el("button", { class: "remove-btn", type: "button", text: "×" });
      rm.onclick = () => {
        form.thumbnails.splice(i, 1);
        renderVideo(form);
        updatePreview();
      };

      row.append(input, hint, rm);
      thumbSec.appendChild(row);
    });

    const addThumb = el("button", {
      class: "btn primary", // ✅ yellow button
      text: "Add Thumbnail"
    });
    addThumb.onclick = () => {
      form.thumbnails.push("");
      renderVideo(form);
      updatePreview();
    };
    thumbSec.appendChild(addThumb);
    formArea.appendChild(thumbSec);

    /* Content + Embed URL row */
    const urlRow = el("div", { class: "form-row inline", style: "margin-top:20px;" });

    // Content URL
    const cWrap = el("div", { class: "form-row" });
    cWrap.appendChild(el("label", { text: "Content URL" }));
    const cInput = el("input", {
      type: "url",
      placeholder: "Direct video file URL",
      value: form.contentUrl || ""
    });
    const cHint = el("div", { class: "hint", text: "Invalid URL format" });
    cHint.style.display = (!form.contentUrl || isValidUrl(form.contentUrl)) ? "none" : "block";
    cInput.oninput = e => {
      const v = e.target.value.trim();
      form.contentUrl = v;
      cHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
      updatePreview();
    };
    cWrap.append(cInput, cHint);
    urlRow.appendChild(cWrap);

    // Embed URL
    const eWrap = el("div", { class: "form-row" });
    eWrap.appendChild(el("label", { text: "Embed URL" }));
    const eInput = el("input", {
      type: "url",
      placeholder: "e.g. YouTube embed URL",
      value: form.embedUrl || ""
    });
    const eHint = el("div", { class: "hint", text: "Invalid URL format" });
    eHint.style.display = (!form.embedUrl || isValidUrl(form.embedUrl)) ? "none" : "block";
    eInput.oninput = e => {
      const v = e.target.value.trim();
      form.embedUrl = v;
      eHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
      updatePreview();
    };
    eWrap.append(eInput, eHint);
    urlRow.appendChild(eWrap);

    formArea.appendChild(urlRow);

    /* SeekToAction */
    const seekRow = el("div", { class: "form-row" });
    seekRow.appendChild(el("label", { text: "SeekToAction Target URL" }));
    const seekInput = el("input", {
      type: "url",
      placeholder: "https://example.com/video?t={seek_to_second_number}",
      value: form.seekUrl || ""
    });
    const seekHint = el("div", { class: "hint", text: "Invalid URL format" });
    seekHint.style.display = (!form.seekUrl || isValidUrl(form.seekUrl)) ? "none" : "block";
    seekInput.oninput = e => {
      const v = e.target.value.trim();
      form.seekUrl = v;
      seekHint.style.display = (!v || isValidUrl(v)) ? "none" : "block";
      updatePreview();
    };
    seekRow.append(seekInput, seekHint);
    formArea.appendChild(seekRow);

    /* References */
    const refs = el("div", { class: "schema-references" });
    refs.innerHTML = `
      <div class="ref-columns">
        <div class="ref-block">
          <strong>Schema.org reference:</strong>
          <ul>
            <li><a href="https://schema.org/VideoObject" target="_blank">VideoObject</a></li>
          </ul>
        </div>
        <div class="ref-block">
          <strong>Google docs:</strong>
          <ul>
            <li><a href="https://developers.google.com/search/docs/appearance/structured-data/video" target="_blank">Video</a></li>
          </ul>
        </div>
      </div>`;
    formArea.appendChild(refs);
  }

  function build(f) {
    const mins = parseInt(f.durationMin || 0);
    const secs = parseInt(f.durationSec || 0);
    const ISO = (mins || secs) ? `PT${mins}M${secs}S` : undefined;

    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: f.name || undefined,
      description: f.description || undefined,
      uploadDate: f.uploadDate || undefined,
      duration: ISO,
      thumbnailUrl: (f.thumbnails || []).filter(isValidUrl),
      contentUrl: f.contentUrl || undefined,
      embedUrl: f.embedUrl || undefined,
      potentialAction: f.seekUrl ? {
        "@type": "SeekToAction",
        "target": f.seekUrl
      } : undefined
    };
  }

  function validate(s) {
    const e = [];
    const bad = v => v && !/^https?:\/\/[^\s]+$/i.test(v);

    if (!s.name) e.push("Missing video name.");
    if (!s.uploadDate) e.push("Missing upload date.");
    if (!s.thumbnailUrl?.length) e.push("At least one thumbnail URL required.");
    if (bad(s.contentUrl)) e.push("Invalid Content URL.");
    if (bad(s.embedUrl)) e.push("Invalid Embed URL.");
    if (s.potentialAction && bad(s.potentialAction.target))
      e.push("Invalid SeekToAction target URL.");

    return e;
  }

  registerSchemaType("Video", renderVideo, build, defaults, validate);
})();
