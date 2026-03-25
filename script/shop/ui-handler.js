// Shop UI-Handler

// State
let allProducts = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Fetch and Render
async function initShop(cat = 1) {
  const response = await fetch(
    `https://api.escuelajs.co/api/v1/products?categoryId=${cat}&offset=0&limit=25`,
  );
  allProducts = await response.json();
  renderProducts(allProducts);
}

// Render Function
function renderProducts(productsToDisplay) {
  const grid = document.querySelector("#product-grid");
  grid.innerHTML = productsToDisplay
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.images[0]}" alt="${product.title}" style="width:100%">
            <h4>${product.title}</h4>
            <p>₱${product.price}</p>
            <button onclick="handleAddToCart(${product.id})">Add to Cart</button>
        </div>
        `,
    )
    .join("");
}

// Filter Logic
window.applyPriceFilter = () => {
  const min = document.querySelector("#min-price").value || 0;
  const max = document.querySelector("#max-price").value || Infinity;

  const filtered = allProducts.filter((p) => p.price >= min && p.price <= max);
  renderProducts(filtered);
};

// Add To Cart Function
window.handleAddToCart = (id) => {
  const item = allProducts.find((p) => p.id === id);
  console.log("Added to Cart: ", item.title);
};

initShop(1);
