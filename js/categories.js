// Order matches the 20-card grid. Images: put images/<slug>.(png|jpg|jpeg|webp|svg)
window.CATEGORIES = [
  ["paan-corner", "Paan Corner"],
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
  { cls: "offer-a", title: "Flat 20% off\non fresh produce", sub: "Fruits & vegetables, farm to door", cta: "Grab offer" },
  { cls: "offer-b", title: "Buy 1 Get 1\non snacks", sub: "Chips, namkeen & munchies", cta: "Grab offer" },
  { cls: "offer-c", title: "₹100 off on\nyour first order", sub: "Use code BUYIT100 above ₹499", cta: "Claim now" }
];
