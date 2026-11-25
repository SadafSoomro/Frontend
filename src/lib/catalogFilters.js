export const productPrice = product => product.on_sale === true ? product.price : (product.discount_price || product.price);

export const defaultProductFilters = { brand: '', min: '', max: '', inStock: false };

export function matchesProductFilters(product, filters) {
  const price = productPrice(product);
  return (!filters.brand || product.brand === filters.brand) &&
    (filters.min === '' || price >= Number(filters.min)) &&
    (filters.max === '' || price <= Number(filters.max)) &&
    (!filters.inStock || product.stock_quantity > 0);
}
