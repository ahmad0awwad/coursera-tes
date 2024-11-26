// document.addEventListener('DOMContentLoaded', function() {
//     const orderDetails = JSON.parse(sessionStorage.getItem('orderDetails'));

//     if (!orderDetails) {
//         document.getElementById('invoice-details').innerHTML = '<p>No order details found.</p>';
//         return;
//     }

//     document.getElementById('client-name').textContent = orderDetails.shippingMethod === 'pickup' ? `${orderDetails.pickupDetails.firstName} ${orderDetails.pickupDetails.lastName}` : `${orderDetails.deliveryDetails.firstName} ${orderDetails.deliveryDetails.lastName}`;
//     document.getElementById('client-address').textContent = orderDetails.shippingMethod === 'pickup' ? 'N/A' : `${orderDetails.deliveryDetails.area}, ${orderDetails.deliveryDetails.block}, ${orderDetails.deliveryDetails.street}, ${orderDetails.deliveryDetails.house}`;
//     document.getElementById('client-email').textContent = orderDetails.shippingMethod === 'pickup' ? orderDetails.pickupDetails.email : orderDetails.deliveryDetails.email;
//     document.getElementById('payment-method').textContent = orderDetails.paymentMethod;
//     document.getElementById('due-date').textContent = new Date().toLocaleDateString();

//     const itemsBody = document.getElementById('invoice-items-body');
//     orderDetails.cart.forEach(item => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${item.name.en}</td>
//             <td>${item.quantity}</td>
//             <td>${item.price} KD</td>
//             <td>${item.price * item.quantity} KD</td>
//         `;
//         itemsBody.appendChild(row);
//     });

//     const totalAmount = orderDetails.cart.reduce((total, item) => total + item.price * item.quantity, 0);
//     document.getElementById('total-amount').textContent = `${totalAmount} KD`;
// });

const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

fetch(`/api/order/${orderId}`)
    .then((response) => response.json())
    .then((data) => {
        // Populate invoice with fetched data
        document.getElementById('customerName').textContent = data.customer.name;
        document.getElementById('civilId').textContent = data.customer.civilId;
        document.getElementById('totalPrice').textContent = `${data.totalPrice} KD`;
        document.getElementById('totalDiscount').textContent = `${data.totalDiscount} KD`;
        document.getElementById('netTotal').textContent = `${data.netTotal} KD`;

        // Populate tables for general, gold, and diamond
        populateTable('generalTable', data.products.filter(p => p.type === 'general'));
        populateTable('goldTable', data.products.filter(p => p.type === 'gold'));
        populateTable('diamondTable', data.products.filter(p => p.type === 'diamond'));
    });

function populateTable(tableId, products) {
    const tableBody = document.getElementById(`${tableId}-body`);
    products.forEach(product => {
        const row = `<tr>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.price} KD</td>
            <td>${product.discount} KD</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    // Fetch order data from the server
    fetch(`/api/order/${orderId}`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                // Populate customer info
                document.getElementById('customerName').textContent = data.customer.name;
                document.getElementById('civilId').textContent = data.customer.civilId;
                document.getElementById('totalPrice').textContent = `${data.totalPrice} KD`;
                document.getElementById('totalDiscount').textContent = `${data.totalDiscount} KD`;
                document.getElementById('netTotal').textContent = `${data.netTotal} KD`;

                // Populate product tables
                populateTable('generalTable-body', data.products.filter(p => p.type === 'general'));
                populateTable('goldTable-body', data.products.filter(p => p.type === 'gold'));
                populateTable('diamondTable-body', data.products.filter(p => p.type === 'diamond'));
            } else {
                alert('Order not found.');
            }
        })
        .catch(error => {
            console.error('Error fetching order data:', error);
        });

    // Helper function to populate product tables
    function populateTable(tableId, products) {
        const tableBody = document.getElementById(tableId);
        products.forEach(product => {
            const row = `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.price} KD</td>
                    <td>${product.discount} KD</td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    }
});
