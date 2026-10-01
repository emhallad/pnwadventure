const CATEGORY_ORDER = [
  "MTB",
  "Moto / Dual-Sport",
  "Road Cycling",
  "Gravel / Cyclocross",
  "Ultra Running",
  "Trail Running / Hiking",
  "Mountaineering",
  "Avalanche Training",
  "Waterski / Water",
  "Ski / Snow",
  "Concerts / Festivals",
  "Motorsports / Other"
];

const CATEGORY_ICONS = {
  "MTB": "🚵",
  "Moto / Dual-Sport": "🏍️",
  "Road Cycling": "🚴",
  "Gravel / Cyclocross": "🟤",
  "Ultra Running": "🏃‍♂️",
  "Trail Running / Hiking": "🥾",
  "Mountaineering": "🏔️",
  "Avalanche Training": "🎓",
  "Waterski / Water": "🌊",
  "Ski / Snow": "⛷️",
  "Concerts / Festivals": "🎵",
  "Motorsports / Other": "🏁"
};

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function card(item) {
  const link = item.url
    ? `<div class="actions"><a href="${esc(item.url)}" target="_blank" rel="noopener">Details ↗</a></div>`
    : "";

  const tags = [
    item.timing,
    item.location,
    item.driveTime,
    item.cost,
    item.weather
  ].filter(Boolean).map(v => `<span>${esc(v)}</span>`).join("");

  return `
    <article class="card ${item.exceptional ? "exceptional" : ""}">
      <span class="rank">#${esc(item.rank)}</span>
      <h3>${item.exceptional ? "★ " : ""}${esc(item.title)}</h3>
      <div class="meta">${tags}</div>
      <p>${esc(item.description || "")}</p>
      ${item.why ? `<p class="why"><strong>Why it fits:</strong> ${esc(item.why)}</p>` : ""}
      ${link}
    </article>
  `;
}

async function render() {
  try {
    const response = await fetch("data/current-week.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load the current brief.");
    const data = await response.json();

    document.querySelector("#weekend-meta").innerHTML = [
      data.weekend?.label,
      data.baseLocation ? `Based from ${data.baseLocation}` : "",
      data.updated ? `Updated ${data.updated}` : ""
    ].filter(Boolean).map(v => `<span class="pill">${esc(v)}</span>`).join("");

    document.querySelector("#summary").innerHTML = `
      <h2>This weekend</h2>
      <p>${esc(data.summary || "Current recommendations for the coming weekend.")}</p>
    `;

    const items = [...(data.recommendations || [])].sort((a, b) => a.rank - b.rank);
    const top = items.filter(i => i.exceptional).slice(0, 6);

    document.querySelector("#top-picks").innerHTML = top.length
      ? `<h2>🔥 Exceptional this weekend</h2><div class="top-grid">${top.map(card).join("")}</div>`
      : "";

    const grouped = Object.groupBy
      ? Object.groupBy(items, i => i.category || "Other")
      : items.reduce((acc, i) => {
          const k = i.category || "Other";
          (acc[k] ||= []).push(i);
          return acc;
        }, {});

    const categories = [
      ...CATEGORY_ORDER.filter(c => grouped[c]?.length),
      ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c))
    ];

    document.querySelector("#category-nav").innerHTML = categories
      .map(c => `<a href="#${slug(c)}">${CATEGORY_ICONS[c] || "•"} ${esc(c)}</a>`)
      .join("");

    document.querySelector("#activity-sections").innerHTML = categories.map(category => `
      <section class="activity-section" id="${slug(category)}">
        <h2>${CATEGORY_ICONS[category] || "•"} ${esc(category)}</h2>
        <p class="section-subtitle">${grouped[category].length} recommendation${grouped[category].length === 1 ? "" : "s"}</p>
        <div class="activity-grid">${grouped[category].map(card).join("")}</div>
      </section>
    `).join("");

    document.querySelector("#updated").textContent = data.updated ? `Updated ${data.updated}` : "";
  } catch (err) {
    document.querySelector("#summary").innerHTML = `<div class="error">${esc(err.message)}</div>`;
  }
}

render();
