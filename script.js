// --- GLOBAL CONFIG & DATA ---
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000/api' : '/api';

const FALLBACK_PRODUCTS = [
    { id: "prod_1", name: "A Cute Little Girl Hand Stitching Clothes", price: 500, categoryId: "embroidered-clothes", subcategoryId: "kurtis", image: "img/placeholder.png", status: "published", categoryName: "Embroidered & Hand-Stitched" },
    { id: "prod_2", name: "Colorful Applique Pouch", price: 799, categoryId: "other-handicrafts", subcategoryId: "jute-bags", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpijLGyKIV-d9VrEGbWzLLHe44J1P3BFvgHJq4E9d7gA&s=10", status: "published", categoryName: "Other Handicrafts" },
    { id: "prod_3", name: "Sashiko Embroidered Jeans", price: 2499, categoryId: "embroidered-clothes", subcategoryId: "jackets", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHAZqy4uNX9_yihi4CXgNAhsSr7c9Q4f6MovYgs9Xe8A&s=10", status: "published", categoryName: "Embroidered & Hand-Stitched" },
    { id: "prod_4", name: "Floral Fairy Light Hoop", price: 1299, categoryId: "other-handicrafts", subcategoryId: "macrame-hangings", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4_rZRO56o2R8ll_Fy1qnzC7fXqMm_IjfT0W_0IV1OdQ&s=10", status: "published", categoryName: "Other Handicrafts" },
    { id: "prod_5", name: "Bright Yarn Flower Hanging", price: 999, categoryId: "other-handicrafts", subcategoryId: "macrame-hangings", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXr2u7o7lkBiPl-MEsNkGFGgLCDdQh0nF3o9S0PB3izA&s=10", status: "published", categoryName: "Other Handicrafts" },
    { id: "prod_6", name: "Tiny Woven Daisy Basket", price: 599, categoryId: "other-handicrafts", subcategoryId: "bamboo-baskets", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmvGxiNqCibZWaa070PMZ3JZGA3Fr4lz68cAi_iWoE0A&s=10", status: "published", categoryName: "Other Handicrafts" },
    { id: "prod_7", name: "Floral Embroidered Beanie", price: 699, categoryId: "embroidered-clothes", subcategoryId: "scarves", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdN7QGCSpJx-JLAZtb2LMZLi68He6hI_iyjX3yxROCfA&s=10", status: "published", categoryName: "Embroidered & Hand-Stitched" },
    { id: "prod_8", name: "Hand-stitched Fabric Motifs", price: 349, categoryId: "other-handicrafts", subcategoryId: "jute-bags", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1_b2ZJsjCwOH9gJ1RFzYFCb0VxNj8YOmGjeJD2y1v0A&s=10", status: "published", categoryName: "Other Handicrafts" },
    { id: "prod_9", name: "Patchwork Boro Pillow", price: 1499, categoryId: "other-handicrafts", subcategoryId: "rugs", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFDLuh12PswfHbASigaUtRXLglqQKclRBX2lL_2C_GHA&s=10", status: "published", categoryName: "Other Handicrafts" }
];

let globalProducts = [];

// Helper: Global Toast
function showToast(message, type = 'success') {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.className = 'toast show ' + type;
    const icon = type === 'success' ? '<i class="fas fa-check-circle" style="color:#2ecc71;"></i>' : '<i class="fas fa-exclamation-circle" style="color:#e74c3c;"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Global API Fetch
async function fetchProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error("API not available");
        const data = await res.json();
        globalProducts = data;
        return data;
    } catch (e) {
        console.warn("Using fallback products due to backend unavailability on this environment.");
        // Try getting new ones from localstorage just in case
        const local = JSON.parse(localStorage.getItem('anu_products_fallback') || '[]');
        globalProducts = [...FALLBACK_PRODUCTS, ...local];
        return globalProducts;
    }
}

// --- CART SYSTEM ---
let cart = JSON.parse(localStorage.getItem('anu_cart') || '[]');

function saveCart() {
    localStorage.setItem('anu_cart', JSON.stringify(cart));
    updateCartBadges();
    renderCartDrawer();
}

function addToCart(productId, productInfo = null) {
    let product = globalProducts.find(p => String(p.id) === String(productId));
    if (!product && productInfo) product = productInfo; 
    if (!product) return showToast('Product not found.', 'error');
    
    const existing = cart.find(item => String(item.id) === String(product.id));
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    saveCart();
    showToast('Added to cart!');
}

function updateCartQty(id, delta) {
    const item = cart.find(i => String(i.id) === String(id));
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => String(i.id) !== String(id));
    }
    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => String(i.id) !== String(id));
    saveCart();
}

function updateCartBadges() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-icon .badge').forEach(b => b.textContent = total);
}

// Inject Cart Drawer HTML
function injectCartDrawer() {
    if (document.getElementById('cart-drawer')) return;
    const drawerHtml = `
    <div id="cart-drawer-overlay" class="drawer-overlay"></div>
    <div id="cart-drawer" class="cart-drawer">
        <div class="cart-header">
            <h2>Your Cart</h2>
            <button class="close-cart" id="close-cart">&times;</button>
        </div>
        <div class="cart-items" id="cart-items-container"></div>
        <div class="cart-footer">
            <div class="cart-total">
                <span>Subtotal</span>
                <span id="cart-subtotal">₹0</span>
            </div>
            <button class="btn primary-btn btn-full" id="btn-checkout">Checkout</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);
    
    document.getElementById('close-cart').onclick = toggleCart;
    document.getElementById('cart-drawer-overlay').onclick = toggleCart;
    document.getElementById('btn-checkout').onclick = () => {
        if(cart.length === 0) return showToast('Cart is empty', 'error');
        showToast('Proceeding to checkout...');
    };
}

function renderCartDrawer() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-bag"></i><p>Your cart is empty.</p></div>';
        subtotalEl.textContent = '₹0';
        return;
    }
    
    let subtotal = 0;
    container.innerHTML = cart.map(item => {
        subtotal += item.price * item.qty;
        return `
        <div class="cart-item">
            <img src="${item.image || 'img/placeholder.png'}" class="cart-item-img">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="cart-qty-controls">
                    <button onclick="updateCartQty('${item.id}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="updateCartQty('${item.id}', 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
        </div>`;
    }).join('');
    subtotalEl.textContent = '₹' + subtotal;
}

function toggleCart(e) {
    if(e) e.preventDefault();
    document.getElementById('cart-drawer').classList.toggle('open');
    document.getElementById('cart-drawer-overlay').classList.toggle('show');
}


// --- SEARCH SYSTEM ---
function injectSearchPanels() {
    const searchBars = document.querySelectorAll('.search-bar');
    searchBars.forEach(bar => {
        const input = bar.querySelector('input');
        if(!input) return;
        
        // Wrap input and create panel
        bar.style.position = 'relative';
        const panel = document.createElement('div');
        panel.className = 'search-panel';
        panel.innerHTML = '<div class="search-results"></div>';
        bar.appendChild(panel);
        
        const resultsContainer = panel.querySelector('.search-results');
        
        input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (q.length < 2) {
                panel.style.display = 'none';
                return;
            }
            panel.style.display = 'block';
            
            const matches = globalProducts.filter(p => 
                (p.name && p.name.toLowerCase().includes(q)) || 
                (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
                (p.subcategoryName && p.subcategoryName.toLowerCase().includes(q)) ||
                (p.description && p.description.toLowerCase().includes(q))
            );
            
            if (matches.length === 0) {
                resultsContainer.innerHTML = `<div class="search-empty">No crafts found for "${q}"</div>`;
            } else {
                resultsContainer.innerHTML = matches.slice(0, 5).map(m => `
                    <a href="product.html?id=${m.id}" class="search-item">
                        <img src="${m.image || 'img/placeholder.png'}">
                        <div>
                            <h4>${m.name}</h4>
                            <span class="s-cat">${m.categoryName}</span>
                            <span class="s-price">₹${m.price}</span>
                        </div>
                    </a>
                `).join('') + `<a href="category.html?search=${encodeURIComponent(q)}" class="search-view-all">View all results &rarr;</a>`;
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if(e.key === 'Enter' && input.value.trim().length > 1) {
                window.location.href = `category.html?search=${encodeURIComponent(input.value.trim())}`;
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if(!bar.contains(e.target)) panel.style.display = 'none';
        });
    });
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch products to warm up cache
    await fetchProducts();
    
    // 2. Setup Cart
    injectCartDrawer();
    updateCartBadges();
    renderCartDrawer();
    document.querySelectorAll('.cart-icon').forEach(icon => {
        icon.addEventListener('click', toggleCart);
    });
    
    // 3. Setup Search
    injectSearchPanels();
    
    // 4. Attach generic Add to Cart buttons
    document.addEventListener('click', (e) => {
        if(e.target.closest('.add-to-cart')) {
            const btn = e.target.closest('.add-to-cart');
            const card = btn.closest('.product-card');
            if(card) {
                const img = card.querySelector('img').src;
                const name = card.querySelector('.product-title, h3').textContent;
                const priceText = card.querySelector('.product-price').textContent;
                const price = parseInt(priceText.replace(/[^0-9]/g, ''));
                addToCart(name, { id: name, name, image: img, price, qty: 1 });
            }
        }
    });

    // 5. Wishlist toggle
    document.addEventListener('click', (e) => {
        if(e.target.closest('.wishlist')) {
            const btn = e.target.closest('.wishlist');
            const icon = btn.querySelector('i');
            if(icon.classList.contains('far')) {
                icon.classList.replace('far', 'fas');
                icon.style.color = 'var(--primary)';
                showToast('Added to Wishlist!');
            } else {
                icon.classList.replace('fas', 'far');
                icon.style.color = '';
            }
        }
    });

    // 6. Welcome modal logic
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        setTimeout(() => modal.classList.add('active'), 1500);
        const closeBtn = document.querySelector('.close-modal');
        const claimBtn = document.querySelector('.modal-text .primary-btn');
        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        if (claimBtn) claimBtn.onclick = () => {
            modal.classList.remove('active');
            const shop = document.querySelector('#shop');
            if(shop) shop.scrollIntoView({ behavior: 'smooth' });
        };
    }
});
