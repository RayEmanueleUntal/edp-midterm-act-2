import * as Shop from "./shop.js";
import { getCurrentUser } from "../auth/auth.js";

let allProducts = [];

// ===== DOM Elements =====

// Products Grid
const grid = document.querySelector("#product-grid");

// Cart
const cartItemsContainer = document.querySelector("#cart-items");
const cartBadge = document.getElementById("cart-badge");
const totalPriceEl = document.querySelector("#total-price");
const checkoutDialog = document.querySelector("#checkout-dialog");

async function initShop(cat = 15, limit = 40) {
  try {
    await Shop.initCurrency("USD", "PHP");
    const response = await fetch(
      `https://api.escuelajs.co/api/v1/products/?categoryId=${cat}&offset=0&limit=${limit}`,
    );
    allProducts = await response.json();
    renderProducts(allProducts);
    renderCart();
  } catch (error) {
    console.error("Error fetching shop data:", error);
  }
}

function renderProducts(products) {
  if (!grid) return;
  grid.innerHTML = products
    .map(
      (p) => `
            <div class="product-card">
                <div class="img-container">
                    ${
                      p.images.length > 1
                        ? `
                        <button class="nav-btn prev" onclick="changeImage(${p.id}, -1)">&#10094;</button>
                        <button class="nav-btn next" onclick="changeImage(${p.id}, 1)">&#10095;</button>
                    `
                        : ""
                    }
                    <img 
                        id="img-${p.id}"
                        src="${p.images[0]}" 
                        alt="${p.title}" 
                        data-index="0"
                        style="width:100%"
                    >
                </div>
                <div class="card-info">
                    <h4>${p.title}</h4>
                    <p class="price">₱${Shop.convertAmt(p.price)}</p>
                </div>
                <button class="add-btn" onclick="handleAddToCart(${p.id})">Add to Cart</button>
            </div>
        `,
    )
    .join("");
}

// --- Global Handlers ---

window.changeImage = (id, delta) => {
  const product = allProducts.find((p) => p.id === id);
  if (!product) return;

  // Initialize index if it doesn't exist
  if (product.currentImgIndex === undefined) product.currentImgIndex = 0;

  let newIndex = product.currentImgIndex + delta;

  // Logic to loop
  if (newIndex >= product.images.length) newIndex = 0;
  if (newIndex < 0) newIndex = product.images.length - 1;

  // Update the actual object in the array (the "State")
  product.currentImgIndex = newIndex;

  // 2. Trigger a UI update for just this card
  const imgEl = document.querySelector(`#img-${id}`);
  if (imgEl) imgEl.src = product.images[newIndex];
};

window.handleAddToCart = async (id) => {
  const product = allProducts.find((p) => p.id === id);
  if (product) {
    Shop.addToCart(product);
    renderCart();
  }
};

window.changeQty = async (id, delta) => {
  Shop.updateQty(id, delta);
  renderCart();
};

window.removeItem = async (id) => {
  Shop.removeFromCart(id);
  renderCart();
};

window.handleClearCart = async () => {
  Shop.clearCart();
  renderCart();
};

function renderCart() {
  if (!cartItemsContainer) return;

  const itemCount = Shop.cart.length;

  if (itemCount === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-msg">Your cart is empty</p>`;
    cartBadge.style.display = "none";
    totalPriceEl.textContent = `Total: ₱0`;
    return;
  }

  // Update Badge
  cartBadge.style.display = "Block";
  cartBadge.innerText = itemCount;

  // Update Cart Content
  cartItemsContainer.innerHTML = Shop.cart
    .map((item) => {
      // Ensure we have a valid image even if the API data is messy
      const imgUrl =
        item.images && item.images[0]
          ? item.images[0]
          : "https://placehold.co/100x100?text=No+Image";

      return `
            <div class="cart-item">
                <div class="cart-item-main">
                    <img src="${imgUrl}" alt="${item.name}" class="cart-img" onerror="this.src='https://placehold.co/100x100?text=No+Image'">
                    <div class="cart-item-details">
                        <span class="cart-item-name">${item.name}</span>
                    </div>
                </div>

                <div class="cart-item-actions">
                    <div class="unit-price">₱${Shop.convertAmt(item.price)}</div>
                    
                    <div class="qty-ctrl">
                        <button onclick="changeQty(${item.id}, -1)">-</button>
                        <span class="qty-num">${item.quantity}</span>
                        <button onclick="changeQty(${item.id}, 1)">+</button>
                    </div>

                    <div class="item-subtotal">₱${Shop.convertAmt(item.price * item.quantity)}</div>
                    
                    <button class="remove-btn" onclick="removeItem(${item.id})">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
        `;
    })
    .join("");

  totalPriceEl.textContent = `Total: ₱${Shop.convertAmt(Shop.calculateTotal())}`;
}

// Filter Logic
const filterForm = document.querySelector(".price-filter-container");
if (filterForm) {
  filterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const min = parseFloat(document.querySelector("#min-price").value) || 0;
    const max =
      parseFloat(document.querySelector("#max-price").value) || Infinity;

    const filtered = allProducts.filter(
      (p) => Shop.convertAmt(p.price) >= min && Shop.convertAmt(p.price) <= max,
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
    userInfo: { email: user.email, username: user.username },
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
                    <p>Thank you for shopping, ${user.username}!</p>
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

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q"); // This looks for ?q= in the URL
  const category = 0;

  if (query) {
    // 1. Keep the text in the search box so the user sees what they searched for
    const input = document.querySelector("#search-input");
    if (input) input.value = query;

    // 2. Fetch from API
    fetch(
      `https://api.escuelajs.co/api/v1/products/?title=${query}&categoryId=${category}`,
    )
      .then((res) => res.json())
      .then((data) => {
        // Important: Update global allProducts so filters still work!
        allProducts = data;

        if (data.length === 0) {
          grid.innerHTML = `<p class="no-results">No products found for "${query}"</p>`;
        } else {
          renderProducts(data);
        }
      })
      .catch((err) => console.error("Search error:", err));
  } else {
    // No search query? Load default shop
    initShop(category);
  }
});
