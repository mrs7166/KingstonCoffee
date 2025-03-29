document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cartForShipping')) || [];
    const cartItemsContainer = document.querySelector('.list-group.mb-3');
    const totalElement = document.querySelector('.list-group-item:last-child strong');
    const badge = document.querySelector('.badge.bg-primary.rounded-pill');

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between lh-sm';
        listItem.innerHTML = `
            <div>
                <h6 class="my-0">${item.name}</h6>
                <small class="text-muted">Quantity: ${item.quantity}</small>
            </div>
            <span class="text-muted">$${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartItemsContainer.insertBefore(listItem, cartItemsContainer.lastElementChild); // Add before the total
        total += item.price * item.quantity;
    });

    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    if(badge){
        badge.textContent = cart.length;
    }

});