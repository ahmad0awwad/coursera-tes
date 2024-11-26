const THRESHOLD_AMOUNT = 200;

// document.addEventListener('DOMContentLoaded', function() {
//     console.error('DOM fully loaded and parsed');
//     loadCartData();
//     updateCartCount();
//     document.getElementById('shipping-method').addEventListener('change', handleShippingMethodChange);
//     document.getElementById('checkout-form').addEventListener('submit', function(event) {

//         if (!validateForm()) {
//             event.preventDefault();
//         }
//     });

//     const areaList = document.getElementById('area-list');
//     const areaSearch = document.getElementById('area-search');
//     areaSearch.addEventListener('input', filterAreaList);

//     // Populate area list
//     areas.forEach(area => {
//         const option = document.createElement('option');
//         option.value = area;
//         option.textContent = area;
//         areaList.appendChild(option);
//     });
//      // Set default value for Civil ID fields
//      document.getElementById('pickup-civil-id').value = ' ';
//      document.getElementById('delivery-civil-id').value = ' ';
// });

document.addEventListener('DOMContentLoaded', function () {
    const orderSummary = document.getElementById('order-summary');
    const subtotalElement = document.getElementById('subtotal-amount');
    const totalElement = document.getElementById('total-amount');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const THRESHOLD_AMOUNT = 200; // Define your threshold amount for ID requirements

    if (cart.length === 0) {
        orderSummary.innerHTML = '<tr><td colspan="2">Your cart is empty</td></tr>';
        subtotalElement.textContent = '0 KD';
        totalElement.textContent = '0 KD';
        return;
    }

    let subtotal = 0;
    let orderHtml = '';

    cart.forEach(item => {
        // Parse the price correctly
        const price = parseInt(String(item.price).replace(/[^\d]/g, ''), 10) || 0; // Remove non-numeric characters
        const quantity = parseInt(item.quantity, 10) || 0;
        const totalPrice = price * quantity;

        subtotal += totalPrice;

        // Generate HTML for each item in the order summary
        orderHtml += `
            <tr>
                <td>${item.name} x ${quantity}</td>
                <td>${totalPrice.toLocaleString()} KD</td>
            </tr>
        `;
    });

    // Generate HTML for subtotal and total
    orderHtml += `
        <tr>
            <td>Subtotal</td>
            <td>${subtotal.toLocaleString()} KD</td>
        </tr>
        <tr>
            <td>Total</td>
            <td class="total">${subtotal.toLocaleString()} KD</td>
        </tr>
    `;

    // Update the DOM elements with the calculated values
    orderSummary.innerHTML = orderHtml;
    subtotalElement.textContent = `${subtotal.toLocaleString()} KD`;
    totalElement.textContent = `${subtotal.toLocaleString()} KD`;

    // Handle Civil ID and Shipping Method Logic
    document.querySelectorAll('#pickup-civil-id, #delivery-civil-id').forEach(field => {
        field.removeAttribute('required'); // Remove required attribute initially
    });

    if (subtotal >= THRESHOLD_AMOUNT) {
        // Show Civil ID upload field if subtotal exceeds the threshold
        document.getElementById('upload-civil-id').style.display = 'block';
    } else {
        // Hide Civil ID upload field if subtotal is below the threshold
        document.getElementById('upload-civil-id').style.display = 'none';
    }

    // Handle shipping method visibility and related logic
    const shippingMethodElement = document.getElementById('shipping-method');
    if (shippingMethodElement) {
        handleShippingMethodChange.call(shippingMethodElement);
    }
});








function handleShippingMethodChange() {
    const shippingMethod = this.value;
    const pickupFields = document.getElementById('pickup-fields');
    const deliveryFields = document.getElementById('delivery-fields');
    const paymentLabel = document.querySelector('label[for="radio-4"]');

    if (shippingMethod === 'pickup') {
        pickupFields.style.display = 'block';
        deliveryFields.style.display = 'none';
        paymentLabel.textContent = 'Pay at store';

        // Set required attribute for pickup fields
        document.getElementById('pickup-civil-id').removeAttribute('required');
        if (parseFloat(document.querySelector('.total').textContent.replace(' KD', '')) >= THRESHOLD_AMOUNT) {
            document.getElementById('pickup-civil-id').setAttribute('required', 'required');
        }
    } else {
        pickupFields.style.display = 'none';
        deliveryFields.style.display = 'block';
        paymentLabel.textContent = 'Cash on delivery';

        // Set required attribute for delivery fields
        document.getElementById('delivery-civil-id').removeAttribute('required');
        if (parseFloat(document.querySelector('.total').textContent.replace(' KD', '')) >= THRESHOLD_AMOUNT) {
            document.getElementById('delivery-civil-id').setAttribute('required', 'required');
        }
    }
}

function validateForm() {
    console.error('Validating form');
    let isValid = true;
    const fields = document.querySelectorAll('.form-control');
    let firstInvalidField = null;

    fields.forEach(field => {
        field.style.borderColor = '';
        field.removeAttribute('title');
    });

    function scrollToField(field, message) {
        
        if (!firstInvalidField) {
            console.error(`Invalid field: ${field.id}, Reason: ${message}`);
            firstInvalidField = field;
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus();
            field.style.borderColor = 'red';
            field.setAttribute('title', message);
        }
    }

    const shippingMethod = document.getElementById('shipping-method').value;
    const totalAmount = parseFloat(document.querySelector('.total').textContent.replace(' KD', ''));

    console.error(`Shipping method: ${shippingMethod}, Total amount: ${totalAmount}`);

    if (shippingMethod === 'pickup') {
        const pickupFirstName = document.getElementById('pickup-first-name');
        const pickupLastName = document.getElementById('pickup-last-name');
        const pickupPhone = document.getElementById('pickup-phone');
        const pickupCivilId = document.getElementById('pickup-civil-id');

        if (!pickupFirstName.value.trim()) {
            scrollToField(pickupFirstName, 'First name is required');
            isValid = false;
        }
        if (!pickupLastName.value.trim()) {
            scrollToField(pickupLastName, 'Last name is required');
            isValid = false;
        }
        if (!/^\d{8}$/.test(pickupPhone.value.trim())) {
            scrollToField(pickupPhone, 'Phone number must be 8 digits');
            isValid = false;
        }
        if (pickupCivilId.hasAttribute('required') && !/^\d{12}$/.test(pickupCivilId.value.trim())) {
            scrollToField(pickupCivilId, 'Civil ID number must be exactly 12 digits');
            isValid = false;
        }
    } else {
        const deliveryFirstName = document.getElementById('delivery-first-name');
        const deliveryLastName = document.getElementById('delivery-last-name');
        const deliveryPhone = document.getElementById('delivery-phone');
        const deliveryCivilId = document.getElementById('delivery-civil-id');
        const areaList = document.getElementById('area-list');
        const deliveryBlock = document.getElementById('delivery-block');
        const deliveryStreet = document.getElementById('delivery-street');
        const deliveryHouse = document.getElementById('delivery-house');

        if (!deliveryFirstName.value.trim()) {
            scrollToField(deliveryFirstName, 'First name is required');
            isValid = false;
        }
        if (!deliveryLastName.value.trim()) {
            scrollToField(deliveryLastName, 'Last name is required');
            isValid = false;
        }
        if (!/^\d{8}$/.test(deliveryPhone.value.trim())) {
            scrollToField(deliveryPhone, 'Phone number must be 8 digits');
            isValid = false;
        }
        if (deliveryCivilId.hasAttribute('required') && !/^\d{12}$/.test(deliveryCivilId.value.trim())) {
            scrollToField(deliveryCivilId, 'Civil ID number must be exactly 12 digits');
            isValid = false;
        }
        if (!areaList.value.trim()) {
            scrollToField(areaList, 'Area is required');
            isValid = false;
        }
        if (!deliveryBlock.value.trim()) {
            scrollToField(deliveryBlock, 'Block is required');
            isValid = false;
        }
        if (!deliveryStreet.value.trim()) {
            scrollToField(deliveryStreet, 'Street is required');
            isValid = false;
        }
        if (!deliveryHouse.value.trim()) {
            scrollToField(deliveryHouse, 'House is required');
            isValid = false;
        }
    }

    if (firstInvalidField) {
        console.error('Form validation failed. First invalid field: ', firstInvalidField.id);
        return false;
    }

    console.error('Form validation passed');
    return isValid;
}

document.addEventListener('DOMContentLoaded', function () {
    const areaSearch = document.getElementById('area-search');
    const areaList = document.getElementById('area-list');
    let areas = [];

    // Fetch areas from mockdb.json
    fetch('mockdb.json')
        .then(response => response.json())
        .then(data => {
            areas = data.areas;
        })
        .catch(error => {
            console.error('Error fetching areas:', error);
        });

    function populateAreaList(filteredAreas) {
        areaList.innerHTML = '';
        filteredAreas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaList.appendChild(option);
        });
        if (filteredAreas.length > 0) {
            areaList.style.display = 'block';
        } else {
            areaList.style.display = 'none';
        }
    }

    function filterAreas(query) {
        return areas.filter(area => area.toLowerCase().includes(query.toLowerCase()));
    }

    areaSearch.addEventListener('focus', function () {
        const query = areaSearch.value;
        const filteredAreas = filterAreas(query);
        populateAreaList(filteredAreas);
        areaList.style.display = 'block';
    });

    areaSearch.addEventListener('blur', function () {
        setTimeout(() => {
            areaList.style.display = 'none';
        }, 100); // Delay to allow option selection
    });

    areaSearch.addEventListener('input', function () {
        const query = areaSearch.value;
        const filteredAreas = filterAreas(query);
        populateAreaList(filteredAreas);
    });

    areaList.addEventListener('change', function () {
        areaSearch.value = areaList.value;
        areaList.style.display = 'none';
    });

    // Set default value for Civil ID fields if they exist
    const pickupCivilId = document.getElementById('pickup-civil-id');
    const deliveryCivilId = document.getElementById('delivery-civil-id');
    if (pickupCivilId) {
        pickupCivilId.value = ' ';
    }
    if (deliveryCivilId) {
        deliveryCivilId.value = ' ';
    }
});


document.getElementById('checkout-form').addEventListener('submit', function(event) {
    if (!validateForm()) {
        event.preventDefault();
    } else {
        const orderDetails = {
            shippingMethod: document.getElementById('shipping-method').value,
            pickupDetails: {
                firstName: document.getElementById('pickup-first-name').value,
                lastName: document.getElementById('pickup-last-name').value,
                phone: document.getElementById('pickup-phone').value,
                email: document.getElementById('pickup-email').value,
                civilId: document.getElementById('pickup-civil-id').value
            },
            deliveryDetails: {
                firstName: document.getElementById('delivery-first-name').value,
                lastName: document.getElementById('delivery-last-name').value,
                phone: document.getElementById('delivery-phone').value,
                email: document.getElementById('delivery-email').value,
                civilId: document.getElementById('delivery-civil-id').value,
                area: document.getElementById('area-search').value,
                block: document.getElementById('delivery-block').value,
                street: document.getElementById('delivery-street').value,
                house: document.getElementById('delivery-house').value,
                floor: document.getElementById('delivery-floor').value,
                flat: document.getElementById('delivery-flat').value
            },
            paymentMethod: document.querySelector('input[name="payment-method"]:checked').nextElementSibling.textContent,
            cart: JSON.parse(localStorage.getItem('cart')) || []
        };

        const formData = new FormData();
        formData.append('orderDetails', JSON.stringify(orderDetails));

        const civilIdImages = document.getElementById('delivery-civil-id-document').files;
        if (civilIdImages.length > 2) {
            alert('Please upload a maximum of 2 files for Civil ID (Front and Back).');
            event.preventDefault();
            return;
        }
        for (let i = 0; i < civilIdImages.length; i++) {
            formData.append('civilIdImages', civilIdImages[i]);
        }

        fetch('/api/invoices', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Invoice data sent successfully:', data);

            // Store the order details in session storage to pass to the invoice page
            sessionStorage.setItem('orderDetails', JSON.stringify(orderDetails));

            // Clear the cart after successful form submission
            localStorage.removeItem('cart');
            console.log('Cart has been emptied');

            // Redirect to the invoice page
            window.location.href = 'invoice.html';
        })
        .catch(error => console.error('Error:', error));
        
        event.preventDefault();
    }
});


// function generateInvoiceNumber() {
//     return 'INV' + Math.floor(Math.random() * 1000000);
// }

// function calculateDueDate() {
//     const today = new Date();
//     const dueDate = new Date(today);
//     dueDate.setDate(today.getDate() + 30);
//     return dueDate.toLocaleDateString();
// }
