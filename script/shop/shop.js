// Shop Logic
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
      images: product.images,
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

// Converting from USD

let rate = 1;

export async function initCurrency(src_curr = "USD", target_curr = "PHP") {
  try {
    const resp = await fetch(
      `https://api.frankfurter.dev/v2/rates?base=${src_curr}&quotes=${target_curr}`,
    );
    const data = await resp.json();
    rate = data[0].rate;
    console.log("Rate updated:", rate);
  } catch (err) {
    console.error("Rate fetch failed, using 1", err);
    rate = 1;
  }
}

export function convertAmt(amt) {
  return (amt * rate).toFixed(2);
}
