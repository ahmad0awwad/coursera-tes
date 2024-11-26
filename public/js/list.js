document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
});

// Fetch and display categories and their subcategories
function fetchCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) {
        console.error('Element categories-container not found.');
        return;
    }
    

    fetch('/api/categories')
        .then(response => response.json())
        .then(data => {
            const categories = data.categories || [];
            if (!Array.isArray(categories)) {
                console.error('Expected categories to be an array:', categories);
                return;
            }

            let categoriesHtml = '';
            categories.forEach(category => {
                const categoryName = category.name || 'Unknown Category';
                categoriesHtml += `
                    <div class="cat-header">
                        <a href="#" data-toggle="collapse" data-target="#category-${category._id}" aria-expanded="false" aria-controls="category-${category._id}">
                            ${categoryName}
                        </a>
                    </div>
                    <div class="collapse multi-collapse" id="category-${category._id}">
                        <ul class="cat-list">
                `;

                if (Array.isArray(category.subcategories)) {
                    category.subcategories.forEach(subcategory => {
                        const subcategoryName = subcategory.name || 'Unknown Subcategory';
                        categoriesHtml += `
                            <li>
                                <a href="#" onclick="fetchSubcategoryProducts('${category._id}', '${subcategory._id}')">
                                    ${subcategoryName}
                                </a>
                            </li>
                        `;
                    });
                } else {
                    categoriesHtml += '<li>No subcategories available</li>';
                }

                categoriesHtml += `
                        </ul>
                    </div>
                `;
            });

            categoriesContainer.innerHTML = categoriesHtml;
        })
        .catch(error => console.error('Error fetching categories:', error));
}

function fetchSubcategoryProducts(categoryId, subcategoryId) {
    console.log(`Loading products for category: ${categoryId}, subcategory: ${subcategoryId}`);

    fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}/products`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error fetching subcategory products:', error);
        });
}

function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    let productsHtml = '';

    if (products.length > 0) {
        products.forEach(product => {
            const productName = product.name || 'Unknown Product';
            const productPrice = product['Sell Price'] || 'Price not available';
            const productImage = product.Picture || '/images/default-product.png';
            const productId = product._id;

            productsHtml += `
                <div class="product-item">
                    <img src="${productImage}" alt="${productName}" class="img-fluid">
                    <div class="product-details">
                        <h2>${productName}</h2>
                        <p>Price: ${productPrice} KD</p>
                        <a href="product.html?productId=${productId}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            `;
        });
    } else {
        productsHtml = '<p>No products available in this subcategory.</p>';
    }

    productsContainer.innerHTML = productsHtml;
}

