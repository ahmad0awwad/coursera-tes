document.querySelector('#clear').addEventListener('click', function () {
    localStorage.removeItem('cart');
    updateCartCount()
});

$(window).scroll(function() {
    if ($(this).scrollTop() >= 50) {
        $('#return-to-top').fadeIn(200);
    } else {
        $('#return-to-top').fadeOut(200);
    }
});


$('#return-to-top').click(function() {
    $('body,html').animate({
        scrollTop: 0
    }, 500);
});



// Function to get cart items from localStorage
function getCartItems() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function addToCart(product) {
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the product already exists in the cart using the name
    const existingIndex = cartItems.findIndex(item => item.name === product.name);

    if (existingIndex > -1) {
        // Update the quantity if the product exists
        cartItems[existingIndex].quantity += product.quantity;
    } else {
        // Add the new product to the cart
        cartItems.push(product);
    }

    // Save the updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Update cart count dynamically
    updateCartCount();
}


document.querySelector('#addToCartButton').addEventListener('click', function () {
    const product = {
        id: document.getElementById('product-id').value,
        name: document.getElementById('product-title').textContent.trim(),
        price: parseFloat(document.getElementById('product-price').textContent.replace(' KD', '')),
        quantity: parseInt(document.querySelector('.quantity-input').value),
        image: document.getElementById('mainImage').src
    };

    console.log("Adding product to cart:", product); // Debug log
    addToCart(product);
});



function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const totalQuantity = cartItems.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);

    // Update the cart count in the DOM
    const cartCountElement = document.querySelector('.cart-c');
    if (cartCountElement) {
        cartCountElement.textContent = totalQuantity;
    }
}

// Call this function on page load
document.addEventListener('DOMContentLoaded', updateCartCount);



// Initialize cart counter on page load
window.onload = function () {
    updateCartCount();
};









function changeImage(src) {
    document.getElementById('mainImage').src = src;
}



//////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const categoriesDropdownMenu = document.getElementById('categories-dropdown-menu');

    // Check if the element exists before proceeding
    if (!categoriesDropdownMenu) {
        console.log('Dropdown menu not found. Skipping category fetch.');
        return;
    }

    // Fetch categories from the server
    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const categories = data.categories || [];
            if (!Array.isArray(categories)) {
                console.error('Expected an array in "data.categories", but got:', categories);
                return;
            }

            console.log('Fetched categories:', categories);

            let categoriesHtml = '';
            categories.forEach((category, index) => {
                console.log(`Category ${index + 1}:`, category);

                const categoryId = category._id || 'undefined';
                const categoryName = category.name?.en || 'Unknown Category';

                categoriesHtml += `
                    <a class="dropdown-item" href="list.html?category=${categoryId}">${categoryName}</a>
                `;
            });

            categoriesDropdownMenu.innerHTML = categoriesHtml;
        })
        .catch(error => console.error('Error fetching categories:', error));
});


// // ////////////
// // $(function() {
// //     // Load header and footer
// //     $("#header-placeholder").load("header.html", function() {
// //         updateCartCount();
// //         const path = window.location.pathname;
// //         const page = path.split("/").pop();

// //         $(".nav_links li a").removeClass("active");

// //         // Highlight the active navigation link
// //         if (page === "index.html") {
// //             $("#nav-home a").addClass("active");
// //         } else if (page === "list.html") {
// //             $("#nav-products a").addClass("active");
// //         } else if (page === "contact.html") {
// //             $("#nav-contact a").addClass("active");
// //         } else if (page === "about.html") {
// //             $("#nav-about a").addClass("active");
// //         } else {
// //             $("#nav-home a").addClass("active");
// //         }

// //         // Fetch categories for the dropdown
// //         fetch('/api/categories')
// //         .then(response => response.json())
// //         .then(data => {
// //             console.log('Fetched categories:', data);

// //             const categoriesDropdownMenu = document.getElementById('categories-dropdown-menu');
// //             if (!categoriesDropdownMenu) {
// //                 console.error("Categories dropdown menu not found.");
// //                 return;
// //             }

// //             let categoriesHtml = '';

// //             data.forEach((category, index) => {
// //                 console.log(`Category ${index + 1}:`, category);

// //                 // Handle missing _id and category name
// //                 if (!category._id) {
// //                     console.error(`Category at index ${index + 1} is missing _id. Category data:`, category);
// //                     return;  // Skip this category
// //                 }

// //                 const categoryName = category.name && category.name.en ? category.name.en : 'Unknown Category';
                
// //                 categoriesHtml += `<a class="dropdown-item" href="list.html?category=${category._id}">${categoryName}</a>`;

// //                 // Log subcategories
// //                 if (category.subcategories && category.subcategories.length > 0) {
// //                     console.log(`Subcategories for ${categoryName}:`, category.subcategories);
// //                 } else {
// //                     console.warn(`No subcategories found for category: ${categoryName} (ID: ${category._id})`); error 
// //                 }
// //             });

// //             categoriesDropdownMenu.innerHTML = categoriesHtml;
// //         })
// //         .catch((error) => console.error('Error fetching categories:', error));
// //     });

// //     $("#footer-placeholder").load("footer.html");

// //     // Fetch and display the slider
// //     fetch('/api/slider')
// //     .then(response => response.json())
// //     .then(data => {
// //         const sliderContainer = $(".swiper-wrapper");
// //         let sliderHtml = '';

// //         data.forEach(slide => {
// //             sliderHtml += `
// //                 <div class="swiper-slide">
// //                     <div class="slider-box">
// //                         <img src="${slide.image}" alt="${slide.collection}" class="img-fluid">
// //                         <div class="text-wrapper">
// //                             <div class="container">
// //                                 <div class="text-holder">
// //                                     <h4>${slide.title}</h4>
// //                                     <h3><span>${slide.collection}</span></h3>
// //                                     <a href="${slide.link}" class="btn btn-shop">SHOP NOW</a>
// //                                 </div>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             `;
// //         });

// //         sliderContainer.html(sliderHtml);

// //         // Initialize Swiper after slides are added
// //         new Swiper('.swiper-container', {
// //             loop: true,
// //             navigation: {
// //                 nextEl: '.swiper-button-next',
// //                 prevEl: '.swiper-button-prev',
// //             },
// //             pagination: {
// //                 el: '.swiper-pagination',
// //                 clickable: true,
// //             },
// //         });
// //     })
// //     .catch(err => console.error('Error fetching slider data:', err));

// //     fetch('/api/categories')
// //     .then(response => response.json())
// //     .then(data => {
// //         console.log('Fetched categories:', data);  // Log the full data to see if subcategories exist
// //     })
// //     .catch(err => console.error('Error fetching categories:', err));
    
// ////////////
//     // Fetch featured products from API and display them
//   // Fetch featured products from API and display them
//  fetch('/api/featured-products')
//     .then(response => response.json())
//     .then(data => {
//         const featuredProductsContainer = $(".products .row");
//         let featuredProductsHtml = '';

//         data.forEach(product => {
//             // Check if the product has valid name and images properties
//             const hasValidName = product.name && product.name.en;
//             const hasValidImages = product.images && product.images.length > 0;

//             if (hasValidName && hasValidImages) {
//                 featuredProductsHtml += `
//                     <div class="col-md-6 col-lg-3">
//                         <div class="product-card text-center">
//                             <div class="img-holder">
//                                 <a href="productTemplate.html?id=${product._id}">
//                                     <img src="${product.images[0]}" alt="${product.name.en}" class="img-fluid">
//                                 </a>
//                                 <div class="over-link">
//                                     <ul>
//                                         <li><a href="productTemplate.html?id=${product._id}"><i class="fas fa-search"></i></a></li>
//                                         <li><a href="#"><i class="fas fa-heart"></i></a></li>
//                                         <li> <a href="#"><img src="images/car2.png" alt="" class="img-fluid"></a> </li>
//                                     </ul>
//                                 </div>
//                             </div>
//                             <h3><a href="productTemplate.html?id=${product._id}">${product.name.en}</a></h3>
//                             <p class="price">${product.price} KD</p>
//                         </div>
//                     </div>
//                 `;
//             } else {
//                 console.warn('Invalid product data:', product);
//             }
//         });

//         featuredProductsContainer.html(featuredProductsHtml);
//     })
//     .catch(error => console.error('Error fetching featured products:', error));

// });


///

// Dynamically load the header


// $("#header-placeholder").load("header.html", function () {
//     console.log('Header loaded successfully');

//     fetch('/api/categories')
//         .then(response => response.json())
//         .then(data => {
//             const categoriesDropdownMenu = document.getElementById('categories-dropdown-menu');

//             // Debug: Check if the dropdown menu exists
//             console.log('Dropdown menu element:', categoriesDropdownMenu);

//             if (!categoriesDropdownMenu) {
//                 console.error('Dropdown menu element not found');
//                 return;
//             }

//             const categories = data.categories || [];
//             if (!Array.isArray(categories)) {
//                 console.error('Expected an array of categories, but got:', categories);
//                 return;
//             }

//             let categoriesHtml = '';
//             categories.forEach((category, index) => {
//                 const categoryId = category._id || 'undefined';
//                 const categoryName = category.name?.en || 'Unknown Category';
//                 categoriesHtml += `<a class="dropdown-item" href="list.html?category=${categoryId}">${categoryName}</a>`;
//             });

//             // Debug: Log the generated HTML
//             console.log('Generated HTML:', categoriesHtml);

//             categoriesDropdownMenu.innerHTML = categoriesHtml;
//         })
//         .catch(error => console.error('Error fetching categories:', error));
// });



// $(function() {
//     $("#header-placeholder2").load("headerAr", function() {
//         updateCartCount();
//         const path = window.location.pathname;
//         const page = path.split("/").pop();

//         $(".nav_links li a").removeClass("active");

//         if (page === "index.html") {
//             $("#nav-home a").addClass("active");
//         } else if (page === "list.html") {
//             $("#nav-products a").addClass("active");
//         } else if (page === "contact.html") {
//             $("#nav-contact a").addClass("active");
//         } else if (page === "about.html") {
//             $("#nav-about a").addClass("active");
//         } else {
//             $("#nav-home a").addClass("active");
//         }

//         fetch('/api/categories')
//     .then(response => response.json())
//     .then(data => {
//         console.log('Fetched categories:', data);  // Log all fetched categories

//         const categoriesDropdownMenu = document.getElementById('categories-dropdown-menu');
//         let categoriesHtml = '';

//         data.forEach((category, index) => {
//             // Log each category to the console
//             console.log(`Category ${index + 1}:`, category);

//             // Check if category._id exists
//             if (!category._id) {
//                 console.error(`Category at index ${index + 1} is missing _id. Category data:`, category);
//             }

//             // Check if category.name and category.name.en exist, use a default if not
//             const categoryName = category.name && category.name.en ? category.name.en : 'Unknown Category';
            
//             // Add the category to the dropdown HTML
//             categoriesHtml += `<a class="dropdown-item" href="list.html?category=${category._id || 'undefined'}">${categoryName}</a>`;

//             // Log subcategories if they exist, otherwise print a warning
//             if (category.subcategories && category.subcategories.length > 0) {
//                 console.log(`Subcategories for ${categoryName}:`, category.subcategories);
//             } else {
//                 console.warn(`No subcategories found for category: ${categoryName} (ID: ${category._id || 'undefined'})`);
//             }
//         });

//         categoriesDropdownMenu.innerHTML = categoriesHtml;  // Set the generated HTML
//     })
//     .catch(error => console.error('Error fetching categories:', error));

//     });
// ///
//     $("#footer-placeholder2").load("footerAr");
// ///
//     // Fetch slider data from API and display the slider
//     fetch('/api/slider')
//         .then(response => response.json())
//         .then(data => {
//             const sliderContainer = $(".swiper-wrapper");
//             let sliderHtml = '';

//             data.forEach(slide => {
//                 sliderHtml += `
//                     <div class="swiper-slide">
//                         <div class="slider-box">
//                             <img src="${slide.image}" alt="${slide.collection}" class="img-fluid">
//                             <div class="text-wrapper">
//                                 <div class="container">
//                                     <div class="text-holder">
//                                         <h4>${slide.title}</h4>
//                                         <h3><span>${slide.collection}</span></h3>
//                                         <a href="${slide.link}" class="btn btn-shop">SHOP NOW</a>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 `;
//             });

//             sliderContainer.html(sliderHtml);

//             // Ensure Swiper is initialized after the slides are added
//             new Swiper('.swiper-container', {
//                 loop: true,
//                 navigation: {
//                     nextEl: '.swiper-button-next',
//                     prevEl: '.swiper-button-prev',
//                 },
//                 pagination: {
//                     el: '.swiper-pagination',
//                     clickable: true,
//                 },
//             });
//         })
//         .catch(error => console.error('Error fetching slider data:', error));

//     // Fetch featured products from API and display them
//   // Fetch featured products from API and display them
//  fetch('/api/featured-products')
//     .then(response => response.json())
//     .then(data => {
//         const featuredProductsContainer = $(".products .row");
//         let featuredProductsHtml = '';

//         data.forEach(product => {
//             // Check if the product has valid name and images properties
//             const hasValidName = product.name && product.name.en;
//             const hasValidImages = product.images && product.images.length > 0;

//             if (hasValidName && hasValidImages) {
//                 featuredProductsHtml += `
//                     <div class="col-md-6 col-lg-3">
//                         <div class="product-card text-center">
//                             <div class="img-holder">
//                                 <a href="productTemplate.html?id=${product._id}">
//                                     <img src="${product.images[0]}" alt="${product.name.en}" class="img-fluid">
//                                 </a>
//                                 <div class="over-link">
//                                     <ul>
//                                         <li><a href="productTemplate.html?id=${product._id}"><i class="fas fa-search"></i></a></li>
//                                         <li><a href="#"><i class="fas fa-heart"></i></a></li>
//                                         <li> <a href="#"><img src="images/car2.png" alt="" class="img-fluid"></a> </li>
//                                     </ul>
//                                 </div>
//                             </div>
//                             <h3><a href="productTemplate.html?id=${product._id}">${product.name.en}</a></h3>
//                             <p class="price">${product.price} KD</p>
//                         </div>
//                     </div>
//                 `;
//             } else {
//                 console.warn('Invalid product data:', product);
//             }
//         });

//         featuredProductsContainer.html(featuredProductsHtml);
//     })
//     .catch(error => console.error('Error fetching featured products:', error));

// });


// Load the header and footer
$("#header-placeholder").load("header.html", function () {
    console.log('Header loaded successfully');

    // Fetch categories for the dropdown
    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const categoriesDropdownMenu = document.getElementById('categories-dropdown-menu');

            // Debug: Check if the dropdown menu exists
            console.log('Dropdown menu element:', categoriesDropdownMenu);

            if (!categoriesDropdownMenu) {
                console.error('Dropdown menu element not found');
                return;
            }

            const categories = data.categories || [];
            if (!Array.isArray(categories)) {
                console.error('Expected an array of categories, but got:', categories);
                return;
            }

            let categoriesHtml = '';
            categories.forEach((category) => {
                const categoryId = category._id || 'undefined';
                const categoryName = category.name?.en || 'Unknown Category';
                categoriesHtml += `<a class="dropdown-item" href="list.html?category=${categoryId}">${categoryName}</a>`;
            });

            // Debug: Log the generated HTML
            console.log('Generated HTML:', categoriesHtml);

            categoriesDropdownMenu.innerHTML = categoriesHtml;
        })
        .catch(error => console.error('Error fetching categories:', error));
});

// Load the footer
$("#footer-placeholder").load("footer.html", function () {
    console.log('Footer loaded successfully');
    
    // Additional footer-related functionality (if needed)
    fetch('/api/featured-products')
        .then(response => response.json())
        .then(data => {
            const featuredProductsContainer = $(".products .row");
            let featuredProductsHtml = '';

            data.forEach(product => {
                const hasValidName = product.name && product.name.en;
                const hasValidImages = product.images && product.images.length > 0;

                if (hasValidName && hasValidImages) {
                    featuredProductsHtml += `
                        <div class="col-md-6 col-lg-3">
                            <div class="product-card text-center">
                                <div class="img-holder">
                                    <a href="productTemplate.html?id=${product._id}">
                                        <img src="${product.images[0]}" alt="${product.name.en}" class="img-fluid">
                                    </a>
                                    <div class="over-link">
                                        <ul>
                                            <li><a href="productTemplate.html?id=${product._id}"><i class="fas fa-search"></i></a></li>
                                            <li><a href="#"><i class="fas fa-heart"></i></a></li>
                                            <li><a href="#"><img src="images/car2.png" alt="" class="img-fluid"></a></li>
                                        </ul>
                                    </div>
                                </div>
                                <h3><a href="productTemplate.html?id=${product._id}">${product.name.en}</a></h3>
                                <p class="price">${product.price} KD</p>
                            </div>
                        </div>
                    `;
                } else {
                    console.warn('Invalid product data:', product);
                }
            });

            featuredProductsContainer.html(featuredProductsHtml);
        })
        .catch(error => console.error('Error fetching featured products:', error));
});



document.addEventListener('DOMContentLoaded', async () => {
    // Extract the productId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');

    if (!productId) {
        console.error("No product ID found in the URL.");
        return;
    }

    console.log("Extracted productId:", productId);

    // Fetch product details
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            console.error("Fetch response status:", response.status);
            throw new Error("Failed to fetch product details.");
        }

        const product = await response.json();
        console.log("Fetched product details:", product);

        // Update the DOM elements
        document.getElementById("product-title").textContent = product.name || "Product Name Not Available";
        document.getElementById("product-price").textContent = product["Sell Price"]
            ? `${product["Sell Price"]} KD`
            : "Price Not Available";
        document.getElementById("product-description").textContent = product.Description_English || "Description Not Available";

        // Update the main image
        if (product.Picture) {
            const mainImage = document.getElementById("mainImage");
            mainImage.src = product.Picture;
            mainImage.alt = product.name || "Product Image";
        } else {
            console.warn("Product image not available.");
        }

        // Update thumbnails (if applicable)
        const thumbnailsContainer = document.getElementById("thumbnails");
        if (thumbnailsContainer) {
            // Assuming thumbnails are in an array product.images (if applicable)
            if (product.images && product.images.length > 0) {
                thumbnailsContainer.innerHTML = product.images
                    .map(image => `<img src="${image}" class="thumbnail" alt="${product.name} Thumbnail">`)
                    .join("");
            } else {
                thumbnailsContainer.textContent = "No additional images.";
            }
        }
    } catch (error) {
        console.error("Error fetching or displaying product details:", error);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const productIdElement = document.getElementById('product-id');
    if (productIdElement) {
        const productId = productIdElement.value;
        console.log("Extracted productId:", productId);
    } else {
        console.error("productId element not found");
    }
});


const productId = document.getElementById('product-id')?.value; // Replace 'product-id' with the correct ID of the element containing the productId

if (productId) {
    console.log("Extracted productId:", productId);
} else {
    console.error("productId is not defined or could not be extracted.");
}

// Check for DOM elements
const elements = [
    'product-title',
    'mainImage',
    'categories-container',
    'thumbnails'
];

elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        console.log(`Element ${id} found`);
    } else {
        console.error(`Element ${id} not found`);
    }
});


