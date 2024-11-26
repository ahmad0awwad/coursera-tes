function updateCartCount() {
    console.log('updateCartCount got called'); // Debug: 

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((count, product) => count + product.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    
    console.log('Cart:', cart); // Debug: Log the cart
    console.log('Cart Count:', cartCount); // Debug: Log the cart count
    
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        console.log('Cart count updated:', cartCountElement.textContent); // Debug: Confirm update
    } else {
        console.error('Cart count element not found'); // Debug: Element not found
    }
}
