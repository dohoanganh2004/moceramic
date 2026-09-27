// Product cards show one price without asking the shopper to pick a variant
// first, so they use the same variant "Add to Cart" on these listing pages
// actually adds (product.variants[0], see addToCart in pages/shop, pages/index) -
// falling back to the product's basePrice only if it has no variants at all.
// Without this, a card could show basePrice while checkout charges a
// different variant price.
export default function getDisplayPrice(product) {
  const variant = product && product.variants && product.variants[0];
  return (variant && variant.price) || (product && product.basePrice) || 0;
}
