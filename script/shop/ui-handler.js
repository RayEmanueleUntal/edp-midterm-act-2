import * as Shop from "./shop.js"; // Ensure shop.js has the logic functions
import { getCurrentUser } from "../auth/auth.js";

let allProducts = [];

// DOM Elements
const grid = document.querySelector("#product-grid");
const cartItemsContainer = document.querySelector("#cart-items");
const totalPriceEl = document.querySelector("#total-price");
const checkoutDialog = document.querySelector("#checkout-dialog");

/**
 * Helper to clean the Escuela API image strings
 */
function cleanImageUrl(url) {
  if (!url) return "https://placehold.co/400x400?text=No+Image";
  // Remove brackets, quotes, and backslashes often found in this API's data
  let clean = url.replace(/[\[\]\"\\]/g, "");
  if (!clean.startsWith("http"))
    return "https://placehold.co/400x400?text=Invalid+URL";
  return clean;
}

async function initShop(cat = 1) {
  try {
    // Change the URL to this:
    const response = await fetch(
      `https://api.escuelajs.co/api/v1/products/?categoryId=${cat}&offset=0&limit=40`,
    );
    allProducts = await response.json();
    renderProducts(allProducts);
    renderCart();
  } catch (error) {
    console.error("Error fetching shop data:", error);
  }
}

function renderProducts(products) {
  console.log(products.length);
  if (!grid) return;
  grid.innerHTML = products
    .map(
      (p) => `
            <div class="product-card">
                <div class="img-container">
                    <img 
                        src="${cleanImageUrl(p.images[0])}" 
                        alt="${p.title}" 
                        onerror="this.onerror=null;this.src='https://placehold.co/400x400?text=No+Image';" 
                        style="width:100%"
                    >
                </div>
                <div class="card-info">
                    <h4>${p.title}</h4>
                    <p class="price">₱${p.price}</p>
                    <button class="add-btn" onclick="handleAddToCart(${p.id})">Add to Cart</button>
                </div>
            </div>
        `,
    )
    .join("");
}

// --- Global Handlers (Attached to window for Module Scope) ---

window.handleAddToCart = (id) => {
  const product = allProducts.find((p) => p.id === id);
  if (product) {
    Shop.addToCart(product);
    renderCart();
  }
};

window.changeQty = (id, delta) => {
  Shop.updateQty(id, delta);
  renderCart();
};

window.removeItem = (id) => {
  Shop.removeFromCart(id);
  renderCart();
};

function renderCart() {
  if (!cartItemsContainer) return;

  if (Shop.cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-msg">Your cart is empty</p>`;
    totalPriceEl.textContent = `Total: ₱0`;
    return;
  }

  cartItemsContainer.innerHTML = Shop.cart
    .map(
      (item) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <span>₱${item.price} each</span>
                </div>
                <div class="qty-ctrl">
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
                <div class="cart-item-subtotal">
                    <span>₱${item.price * item.quantity}</span>
                    <button class="remove-btn" onclick="removeItem(${item.id})">×</button>
                </div>
            </div>
        `,
    )
    .join("");

  totalPriceEl.textContent = `Total: ₱${Shop.calculateTotal()}`;
}

// Filter Logic
const filterForm = document.querySelector(".price-filter-container");
if (filterForm) {
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const min = parseFloat(document.querySelector("#min-price").value) || 0;
    const max =
      parseFloat(document.querySelector("#max-price").value) || Infinity;

    const filtered = allProducts.filter(
      (p) => p.price >= min && p.price <= max,
    );
    renderProducts(filtered);
  });
}

// Checkout Simulation
window.handleCheckout = () => {
  const user = getCurrentUser();
  if (!user) return alert("Please log in first!");
  if (Shop.cart.length === 0) return alert("Cart is empty!");

  // Construct Payload (Meets Criteria 4.b)
  const payload = {
    userInfo: { email: user.email },
    cartItems: Shop.cart,
    totalPrice: Shop.calculateTotal(),
  };

  checkoutDialog.innerHTML = `
        <div class="checkout-status">
            <div class="spinner"></div>
            <p>Processing your order, please wait...</p>
        </div>`;
  checkoutDialog.showModal();

  setTimeout(() => {
    // 90% Success chance
    if (Math.random() > 0.1) {
      checkoutDialog.innerHTML = `
                <div class="success-msg">
                    <span style="font-size: 3rem;">🧡</span>
                    <h3>Order Successful!</h3>
                    <p>Thank you for shopping, ${user.email}!</p>
                    <button onclick="window.location.reload()" class="btn-apply">Return Home</button>
                </div>`;

      // Save payload to localStorage (Criteria 5.a)
      const orders = JSON.parse(localStorage.getItem("order_history") || "[]");
      orders.push(payload);
      localStorage.setItem("order_history", JSON.stringify(orders));

      Shop.clearCart();
    } else {
      checkoutDialog.innerHTML = `
                <div class="error-msg">
                    <span style="font-size: 3rem;">❌</span>
                    <h3>Payment Failed</h3>
                    <p>Something went wrong with the transaction.</p>
                    <button onclick="document.querySelector('#checkout-dialog').close()" class="btn-apply">Try Again</button>
                </div>`;
    }
  }, 2000);
};

// Start the app
initShop(2);
