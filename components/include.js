async function includeHTML(id, file) {
  try {
    const el = document.getElementById(id);
    if (!el) return;
    const res = await fetch(file);
    if (!res.ok) throw new Error(res.statusText);
    el.innerHTML = await res.text();
  } catch (err) {
    console.error('Include failed:', err);
  }
}
