// Shop Logic - The Brain
export let cart = JSON.parse(localStorage.getItem("cart")) || [];

export function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.title,
      price: product.price,
      quantity: 1,
    });
  }
  saveCart();
}

export function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
}

export function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) removeFromCart(id);
  }
  saveCart();
}

export function calculateTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
}
