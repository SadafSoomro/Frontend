export const departments = [
  { id: 'skincare', name: 'Skincare', tag: 'skincare', match: /skin.?care|cleanser|face wash|facial|serum|moisturi[sz]er|make.?up remover|face mask|masks? (?:&|and) peels?|essence|niacinamide|relief cream|toner|micellar|exfoliat/ },
  { id: 'makeup', name: 'Makeup', tag: 'makeup', match: /make.?up|lipstick|foundation|mascara|primer|concealer|lip\s*(?:liner|balm|gloss|tint)|compact powder|setting powder|eyeliner|eyeshadow|blush|nail polish|highlighter/ },
  { id: 'hair', name: 'Hair Care', tag: 'haircare', match: /hair|shampoo|conditioner|repair mask|scalp/ },
  { id: 'body', name: 'Body Care', tag: 'bodycare', match: /body|bath|shower gel|hand cream|deodorant/ },
  { id: 'sunscreen', name: 'Sunscreen', tag: 'sunscreen', match: /sun\s*(?:screen|block|care)|\bspf\s*\d*|uv protection/ },
  { id: 'fragrance', name: 'Fragrance', tag: 'fragrance', match: /fragrance|perfume|cologne|eau de|body mist|scented mist/ },
  { id: 'baby', name: 'Baby Care', tag: 'babycare', match: /\bbaby|infant|newborn/ },
  { id: 'tools', name: 'Tools & Accessories', tag: 'tools', match: /tool|accessor|brush|sponge|applicator|beauty blender|lash curler/ },
];

// More specific departments take priority over the broader categories in a product name.
const matchOrder = ['baby', 'sunscreen', 'fragrance', 'tools', 'hair', 'body', 'skincare', 'makeup']
  .map(id => departments.find(department => department.id === id));

const namedDepartment = name => matchOrder.find(department => department.match.test(name?.toLowerCase() || ''));

export function categoryDepartment(category) {
  return namedDepartment(category?.name) ||
    departments.find(department => department.tag === category?.description?.trim().toLowerCase());
}

export function productDepartment(product, category) {
  const assigned = categoryDepartment(category || product.category_id);
  const named = namedDepartment(product.name);
  const broadTag = departments.find(department => department.tag === category?.description?.trim().toLowerCase());

  // Older catalog imports attach a whole department's products to its first subcategory.
  // The imported department tag and the product title resolve these assignments.
  if (broadTag) return named || broadTag;
  return assigned || named;
}
