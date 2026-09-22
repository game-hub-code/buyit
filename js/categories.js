// Order matches the 20-card grid. Images: put images/<slug>.(avif|png|jpg|jpeg|webp|svg)
window.CATEGORIES = [
  /*["paan-corner", "Paan Corner"],*/
  ["dairy-bread-eggs", "Dairy, Bread & Eggs"],
  ["fruits-vegetables", "Fruits & Vegetables"],
  ["cold-drinks-juices", "Cold Drinks & Juices"],
  ["snacks-munchies", "Snacks & Munchies"],
  ["breakfast-instant-food", "Breakfast & Instant Food"],
  ["sweet-tooth", "Sweet Tooth"],
  ["bakery-biscuits", "Bakery & Biscuits"],
  ["tea-coffee-milk-drinks", "Tea, Coffee & Milk Drinks"],
  ["atta-rice-dal", "Atta, Rice & Dal"],
  ["masala-oil-more", "Masala, Oil & More"],
  ["sauces-spreads", "Sauces & Spreads"],
  ["chicken-meat-fish", "Chicken, Meat & Fish"],
  ["organic-healthy-living", "Organic & Healthy Living"],
  ["baby-care", "Baby Care"],
  ["pharma-wellness", "Pharma & Wellness"],
  ["cleaning-essentials", "Cleaning Essentials"],
  ["home-office", "Home & Office"],
  ["personal-care", "Personal Care"],
  ["pet-care", "Pet Care"]
].map(([slug, name]) => ({ slug, name, href: slug + ".html" }));

window.OFFERS = [
  { cls: "offer-a", title: "Flat 20% off\non fresh produce", sub: "Fruits & vegetables, farm to door", cta: "Grab offer", art: '<svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="86" cy="86" r="62" fill="rgba(255,255,255,.22)"/><circle cx="86" cy="86" r="44" fill="rgba(255,255,255,.95)"/><circle cx="72" cy="72" r="8" fill="#17b8a6"/><circle cx="100" cy="100" r="8" fill="#17b8a6"/><path d="M104 68 68 104" stroke="#17b8a6" stroke-width="7" stroke-linecap="round"/><circle cx="30" cy="40" r="8" fill="rgba(255,255,255,.5)"/><circle cx="140" cy="140" r="6" fill="rgba(255,255,255,.5)"/></svg>' },
  { cls: "offer-b", title: "Buy 1 Get 1\non snacks", sub: "Chips, namkeen & munchies", cta: "Grab offer", art: '<svg viewBox="0 0 160 160" aria-hidden="true"><rect x="22" y="44" width="70" height="92" rx="12" fill="rgba(0,0,0,.14)" transform="rotate(-10 57 90)"/><rect x="62" y="34" width="70" height="92" rx="12" fill="#fff" transform="rotate(8 97 80)"/><text x="97" y="92" text-anchor="middle" font-family="Poppins,Segoe UI,sans-serif" font-size="30" font-weight="800" fill="#1f1f1f" transform="rotate(8 97 80)">1+1</text><circle cx="140" cy="30" r="9" fill="rgba(255,255,255,.6)"/></svg>' },
  { cls: "offer-c", title: "₹100 off on\nyour first order", sub: "Use code BUYIT100 above ₹499", cta: "Claim now", art: '<svg viewBox="0 0 160 160" aria-hidden="true"><path d="M20 52h120a8 8 0 0 1 8 8v12a12 12 0 0 0 0 24v12a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8V96a12 12 0 0 0 0-24V60a8 8 0 0 1 8-8z" fill="#f8cb46" transform="rotate(-8 80 90)"/><path d="M104 60v68" stroke="rgba(0,0,0,.25)" stroke-width="3" stroke-dasharray="6 6" transform="rotate(-8 80 90)"/><text x="60" y="104" text-anchor="middle" font-family="Poppins,Segoe UI,sans-serif" font-size="42" font-weight="800" fill="#1f1f1f" transform="rotate(-8 80 90)">₹100</text></svg>' }
];