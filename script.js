document.addEventListener('DOMContentLoaded', () => {
    // Add micro-animations or interactivity if needed
    const wishlistBtns = document.querySelectorAll('.wishlist');
    
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if(icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#ff477e';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    // Modal logic
    const modal = document.getElementById('welcome-modal');
    const closeBtn = document.querySelector('.close-modal');
    const claimBtn = document.querySelector('.modal-text .primary-btn');

    // Show modal shortly after load
    if (modal) {
        setTimeout(() => {
            modal.classList.add('active');
        }, 1500);
    }

    // Close modal on click
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            // Scroll to shop
            document.querySelector('#shop').scrollIntoView({ behavior: 'smooth' });
        });
    }


    // Load custom crafts from localStorage
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        const customCrafts = JSON.parse(localStorage.getItem('addedCrafts')) || [];
        customCrafts.forEach(craft => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    <img src="${craft.image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=500&q=80'}" alt="${craft.name}">
                    <div class="product-overlay">
                        <button class="btn add-to-cart">Add to Cart</button>
                        <button class="icon-btn wishlist"><i class="far fa-heart"></i></button>
                    </div>
                </div>
                <div class="product-info">
                    <span class="product-category">New Arrival</span>
                    <h3 class="product-title">${craft.name}</h3>
                    <div class="product-price">₹${craft.price}</div>
                </div>
            `;
            // Insert at the beginning of the grid
            productGrid.insertBefore(card, productGrid.firstChild);
        });

        // Re-attach wishlist logic to new items
        const newWishlistBtns = productGrid.querySelectorAll('.wishlist');
        newWishlistBtns.forEach(btn => {
            // Remove old listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', function() {
                const icon = this.querySelector('i');
                if(icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    icon.style.color = '#ff477e';
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    icon.style.color = '';
                }
            });
        });
    }
});
