document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin page loaded');

    // Navigation
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const target = event.target.getAttribute('id').replace('-link', '-section');
            const targetElement = document.getElementById(target);
            if (targetElement) {
                document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
                targetElement.classList.add('active');
                if (target === 'view-invoices-section') {
                    fetchInvoices();
                } else if (target === 'products-section') {
                    fetchProducts();
                }
            } else {
                console.error(`Section with ID ${target} not found.`);
            }
        });
    });

    // Event listener for Add New Product button
    document.getElementById('add-product-btn').addEventListener('click', function() {
        document.querySelectorAll('.admin-section').forEach(section => section.classList.remove('active'));
        document.getElementById('add-product-section').classList.add('active');
    });

    document.getElementById('addCategoryForm')?.addEventListener('submit', handleAddCategory);
    document.getElementById('addSubcategoryForm')?.addEventListener('submit', handleAddSubcategory);
    document.getElementById('addProductForm')?.addEventListener('submit', handleAddProduct);
    document.getElementById('deleteForm')?.addEventListener('submit', handleDelete);

    document.getElementById('deleteType')?.addEventListener('change', handleDeleteTypeChange);


    function setupFilterOptions(categories) {
        const filterCategorySelect = document.getElementById('filter-category');
        const filterSubcategorySelect = document.getElementById('filter-subcategory');

        if (!filterCategorySelect || !filterSubcategorySelect) {
            console.error('Filter category or subcategory select element not found.');
            return;
        }

        filterCategorySelect.innerHTML = '<option value="">All Categories</option>';
        filterSubcategorySelect.innerHTML = '<option value="">All Subcategories</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.name.en;
            filterCategorySelect.appendChild(option);
        });

        filterCategorySelect.addEventListener('change', function() {
            const selectedCategoryId = this.value;
            filterSubcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
            if (selectedCategoryId) {
                const category = categories.find(cat => cat._id === selectedCategoryId);
                category.subcategories.forEach(subcategory => {
                    const option = document.createElement('option');
                    option.value = subcategory._id;
                    option.textContent = subcategory.name.en;
                    filterSubcategorySelect.appendChild(option);
                });
            }
            filterProducts();
        });

        filterSubcategorySelect.addEventListener('change', filterProducts);
        document.getElementById('product-search').addEventListener('input', filterProducts);
    }

    fetchCategories();

    document.getElementById('addCategoryForm')?.addEventListener('submit', handleAddCategory);
    document.getElementById('addSubcategoryForm')?.addEventListener('submit', handleAddSubcategory);
    document.getElementById('addProductForm')?.addEventListener('submit', handleAddProduct);
    document.getElementById('deleteForm')?.addEventListener('submit', handleDelete);

    document.getElementById('deleteType')?.addEventListener('change', handleDeleteTypeChange);

    function handleAddCategory(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        fetch('/api/categories', {
            method: 'POST',
            body: JSON.stringify({
                name: {
                    en: formData.get('categoryNameEn'),
                    ar: formData.get('categoryNameAr')
                }
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Category added:', data);
            fetchCategories();
        })
        .catch(error => console.error('Error adding category:', error));
    }

    function handleAddSubcategory(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const categoryId = formData.get('parentCategory');
        fetch(`/api/categories/${categoryId}/subcategories`, {
            method: 'POST',
            body: JSON.stringify({
                name: {
                    en: formData.get('subcategoryNameEn'),
                    ar: formData.get('subcategoryNameAr')
                }
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Subcategory added:', data);
            fetchCategories();
        })
        .catch(error => console.error('Error adding subcategory:', error));
    }

    function handleAddProduct(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const categoryId = formData.get('category');
        const subcategoryId = formData.get('subcategory');
        
        formData.set('name.en', formData.get('productNameEn'));
        formData.set('name.ar', formData.get('productNameAr'));
        formData.set('description.en', formData.get('productDescriptionEn'));
        formData.set('description.ar', formData.get('productDescriptionAr'));

        fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}/products`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error adding product:', data.error);
            } else {
                console.log('Product added:', data);
                fetchCategories();
                document.getElementById('edit-product-form-container').style.display = 'none';
                document.getElementById('product-list').style.display = 'block';
                fetchProducts();
            }
        })
        .catch(error => console.error('Error adding product:', error));
    }

    function handleDelete(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const deleteType = formData.get('deleteType');
        const categoryId = formData.get('deleteCategory');
        const subcategoryId = formData.get('deleteSubcategory');
        const productId = formData.get('deleteProduct');
        let url = '';
        let options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (deleteType === 'category') {
            url = `/api/categories/${categoryId}`;
        } else if (deleteType === 'subcategory') {
            url = `/api/categories/${categoryId}/subcategories/${subcategoryId}`;
        } else if (deleteType === 'product') {
            url = `/api/categories/${categoryId}/subcategories/${subcategoryId}/products/${productId}`;
        }
        console.log(`Deleting ${deleteType} with URL: ${url}`);
        fetch(url, options)
        .then(response => {
            if (response.ok) {
                console.log(`${deleteType} deleted successfully`);
                fetchCategories();
            } else {
                console.error(`Error deleting ${deleteType}`);
            }
        })
        .catch(error => console.error(`Error deleting ${deleteType}:`, error));
    }

    function handleDeleteTypeChange() {
        const deleteType = this.value;
        const deleteSubcategoryContainer = document.getElementById('deleteSubcategoryContainer');
        const deleteProductContainer = document.getElementById('deleteProductContainer');
        if (deleteType === 'category') {
            deleteSubcategoryContainer.style.display = 'none';
            deleteProductContainer.style.display = 'none';
        } else if (deleteType === 'subcategory') {
            deleteSubcategoryContainer.style.display = 'block';
            deleteProductContainer.style.display = 'none';
        } else if (deleteType === 'product') {
            deleteSubcategoryContainer.style.display = 'block';
            deleteProductContainer.style.display = 'block';
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
    
            // Check if data is an array
            if (!Array.isArray(data)) {
                console.error('Expected an array but got:', data);
                return;
            }
    
            // Display categories
            displayCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }
    
    function displayCategories(categories) {
        const container = document.getElementById('categoriesContainer');
        if (!container) {
            console.error('Container element not found');
            return;
        }
    
        container.innerHTML = ''; // Clear previous content
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.textContent = category.name;
            container.appendChild(categoryElement);
        });
    }
    
    // Call the function
    fetchCategories();
    

    function populateCategorySelects(categories) {
        console.log('Populating category selects...');
        const categorySelects = document.querySelectorAll('select[name="category"], select[name="parentCategory"], select[name="deleteCategory"], select[name="editCategorySelect"], select[name="editParentCategorySelect"], select[name="editProductCategorySelect"]');
        categorySelects.forEach(select => {
            if (select) {
                select.innerHTML = '';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id;
                    option.textContent = category.name.en;
                    select.appendChild(option);
                });
            }
        });
        console.log('Category selects populated:', categorySelects);
        setupSubcategoryPopulation(categories);
    }

    function setupSubcategoryPopulation(categories) {
        console.log('Setting up subcategory population...');
        const categorySelects = document.querySelectorAll('select[name="category"], select[name="parentCategory"], select[name="editCategorySelect"], select[name="editParentCategorySelect"], select[name="editProductCategorySelect"]');
        categorySelects.forEach(select => {
            if (select) {
                select.addEventListener('change', function() {
                    populateSubcategories(this.value, categories);
                });
            }
        });

        const deleteCategorySelect = document.getElementById('deleteCategory');
        if (deleteCategorySelect) {
            deleteCategorySelect.addEventListener('change', function() {
                populateSubcategoriesForDeletion(this.value);
            });
        }

        const editProductCategorySelect = document.getElementById('editProductCategorySelect');
        if (editProductCategorySelect) {
            editProductCategorySelect.addEventListener('change', function() {
                populateSubcategories(this.value, categories);
            });
        }
    }

    function populateSubcategories(categoryId, categories) {
        console.log('Populating subcategories for category:', categoryId);
        const category = categories.find(cat => cat._id === categoryId);
        console.log('Selected category:', category);
        const subcategorySelects = document.querySelectorAll(`select[name="subcategory"], select[name="deleteSubcategory"], select[name="editSubcategorySelect"], select[name="editProductSubcategorySelect"]`);
        subcategorySelects.forEach(subSelect => {
            if (subSelect) {
                subSelect.innerHTML = '';
                if (category && category.subcategories) {
                    category.subcategories.forEach(subcategory => {
                        const option = document.createElement('option');
                        option.value = subcategory._id;
                        option.textContent = subcategory.name.en;
                        subSelect.appendChild(option);
                    });
                }
            }
        });
        console.log('Subcategory selects populated:', subcategorySelects);
        if (category && category.subcategories.length > 0) {
            populateProducts(categoryId, category.subcategories[0]._id, categories);
        }
        subcategorySelects.forEach(subSelect => {
            if (subSelect) {
                subSelect.addEventListener('change', function() {
                    populateProducts(categoryId, this.value, categories);
                });
            }
        });
    }

    function populateProducts(categoryId, subcategoryId, categories) {
        console.log('Populating products for category:', categoryId, ' and subcategory:', subcategoryId);
        const category = categories.find(cat => cat._id === categoryId);
        const subcategory = category ? category.subcategories.find(sub => sub._id === subcategoryId) : null;
        console.log('Selected category:', category);
        console.log('Selected subcategory:', subcategory);
        const productSelects = document.querySelectorAll(`select[name="product"], select[name="deleteProduct"], select[name="editProductSelect"]`);
        productSelects.forEach(prodSelect => {
            if (prodSelect) {
                prodSelect.innerHTML = '';
                if (subcategory && subcategory.products) {
                    subcategory.products.forEach(product => {
                        console.log('Adding product to select:', product);
                        const option = document.createElement('option');
                        option.value = product._id;
                        option.textContent = product.name?.en || product.name || 'Unnamed Product';
                        prodSelect.appendChild(option);
                    });
                }
            }
        });
        console.log('Product selects populated:', productSelects);
    }

    function populateSubcategoriesForDeletion(categoryId) {
        fetch(`/api/categories/${categoryId}`)
            .then(response => response.json())
            .then(category => {
                const deleteSubcategorySelect = document.getElementById('deleteSubcategory');
                if (deleteSubcategorySelect) {
                    deleteSubcategorySelect.innerHTML = '';

                    if (category && category.subcategories) {
                        category.subcategories.forEach(subcategory => {
                            const option = document.createElement('option');
                            option.value = subcategory._id;
                            option.textContent = subcategory.name.en;
                            deleteSubcategorySelect.appendChild(option);
                        });
                    }
                    if (category && category.subcategories.length > 0) {
                        populateProductsForDeletion(categoryId, category.subcategories[0]._id);
                    }
                    deleteSubcategorySelect.addEventListener('change', function() {
                        populateProductsForDeletion(categoryId, this.value);
                    });
                }
            })
            .catch(error => console.error('Error fetching subcategories:', error));
    }

    function populateProductsForDeletion(categoryId, subcategoryId) {
        fetch(`/api/categories/${categoryId}`)
            .then(response => response.json())
            .then(category => {
                const deleteProductSelect = document.getElementById('deleteProduct');
                if (deleteProductSelect) {
                    deleteProductSelect.innerHTML = '';

                    if (category && category.subcategories) {
                        const subcategory = category.subcategories.find(sub => sub._id === subcategoryId);
                        if (subcategory && subcategory.products) {
                            subcategory.products.forEach(product => {
                                const option = document.createElement('option');
                                option.value = product._id;
                                option.textContent = product.name.en;
                                deleteProductSelect.appendChild(option);
                            });
                        }
                    }
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    function filterProducts() {
        const searchQuery = document.getElementById('product-search').value.toLowerCase();
        const filterCategory = document.getElementById('filter-category').value;
        const filterSubcategory = document.getElementById('filter-subcategory').value;

        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                const filteredProducts = [];
                categories.forEach(category => {
                    if (filterCategory && category._id !== filterCategory) return;
                    category.subcategories.forEach(subcategory => {
                        if (filterSubcategory && subcategory._id !== filterSubcategory) return;
                        subcategory.products.forEach(product => {
                            const productName = product.name?.en?.toLowerCase() || '';
                            const productDescription = product.description?.en?.toLowerCase() || '';
                            if (productName.includes(searchQuery) || productDescription.includes(searchQuery) || product.price.toString().includes(searchQuery)) {
                                filteredProducts.push({
                                    ...product,
                                    categoryId: category._id,
                                    categoryName: category.name.en,
                                    subcategoryId: subcategory._id,
                                    subcategoryName: subcategory.name.en
                                });
                            }
                        });
                    });
                });
                displayProducts(filteredProducts);
            })
            .catch(error => console.error('Error filtering products:', error));
    }

    function fetchProducts() {
        console.log('Fetching products...');
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                const products = [];
                categories.forEach(category => {
                    category.subcategories.forEach(subcategory => {
                        subcategory.products.forEach(product => {
                            products.push({
                                ...product,
                                categoryId: category._id,
                                categoryName: category.name.en,
                                subcategoryId: subcategory._id,
                                subcategoryName: subcategory.name.en
                            });
                        });
                    });
                });
                displayProducts(products);
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    function displayProducts(products) {
        const productList = document.getElementById('product-list');
        if (productList) {
            productList.innerHTML = '';

            products.forEach(product => {
                const hasValidName = product.name && product.name.en;
                const hasValidImages = product.images && product.images.length > 0;

                if (hasValidName && hasValidImages) {
                    const productDiv = document.createElement('div');
                    productDiv.classList.add('product-item');
                    productDiv.innerHTML = `
                        <img src="${product.images[0]}" alt="${product.name.en}">
                        <h3>${product.name.en}</h3>
                        <p>Price: ${product.price} KD</p>
                        <p>Category: ${product.categoryName}</p>
                        <p>Subcategory: ${product.subcategoryName}</p>
                        <button class="edit-product-btn" data-product-id="${product._id}">Edit</button>
                        <button class="delete-product-btn" data-product-id="${product._id}">Delete</button>
                    `;
                    productList.appendChild(productDiv);
                } else {
                    console.warn('Invalid product data:', product);
                }
            });

            document.querySelectorAll('.edit-product-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-product-id');
                    fetchProductDetails(productId);
                });
            });

            document.querySelectorAll('.delete-product-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-product-id');
                    deleteProduct(productId);
                });
            });
        }
    }

    function fetchProductDetails(productId) {
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                if (product) {
                    const formContainer = document.getElementById('edit-product-form-container');
                    if (formContainer) {
                        formContainer.innerHTML = `
                            <form id="editProductForm" enctype="multipart/form-data" data-product-id="${productId}">
                                <h2>Edit Product</h2>
                                <label for="editProductNameEn">Product Name (English):</label>
                                <input type="text" id="editProductNameEn" name="editProductNameEn" value="${product.name.en}" required>
                                <label for="editProductNameAr">Product Name (Arabic):</label>
                                <input type="text" id="editProductNameAr" name="editProductNameAr" value="${product.name.ar}" required>
                                <label for="editProductPrice">Price:</label>
                                <input type="number" id="editProductPrice" name="editProductPrice" value="${product.price}" required>
                                <label for="editProductDescriptionEn">Description (English):</label>
                                <textarea id="editProductDescriptionEn" name="editProductDescriptionEn" required>${product.description.en}</textarea>
                                <label for="editProductDescriptionAr">Description (Arabic):</label>
                                <textarea id="editProductDescriptionAr" name="editProductDescriptionAr" required>${product.description.ar}</textarea>
                                <label for="editProductImages">Images:</label>
                                <input type="file" id="editProductImages" name="editProductImages" multiple>
                                <div id="existingImagesContainer"></div>
                                <label for="editProductFeatured">Featured:</label>
                                <input type="checkbox" id="editProductFeatured" name="editProductFeatured" ${product.featured ? 'checked' : ''}>
                                <button type="submit">Save</button>
                                <button type="button" id="backToProductsBtn">Back to Products</button>
                            </form>
                        `;
                        const existingImagesContainer = document.getElementById('existingImagesContainer');
                        if (existingImagesContainer) {
                            existingImagesContainer.innerHTML = '';
                            if (product.images && product.images.length > 0) {
                                product.images.forEach(image => {
                                    const imgElement = document.createElement('img');
                                    imgElement.src = image;
                                    imgElement.alt = 'Product Image';
                                    imgElement.style.maxWidth = '100px';
                                    imgElement.style.margin = '5px';
                                    
                                    const checkbox = document.createElement('input');
                                    checkbox.type = 'checkbox';
                                    checkbox.name = 'deleteImages';
                                    checkbox.value = image;
                                    checkbox.id = `delete-${image}`;
                                    
                                    const label = document.createElement('label');
                                    label.htmlFor = `delete-${image}`;
                                    label.innerText = 'Delete';
    
                                    const imgContainer = document.createElement('div');
                                    imgContainer.appendChild(imgElement);
                                    imgContainer.appendChild(checkbox);
                                    imgContainer.appendChild(label);
    
                                    existingImagesContainer.appendChild(imgContainer);
                                });
                            }
                        }
                        document.getElementById('editProductForm').addEventListener('submit', handleEditProduct);
                        document.getElementById('backToProductsBtn').addEventListener('click', () => {
                            document.getElementById('edit-product-form-container').style.display = 'none';
                            document.getElementById('product-list').style.display = 'flex';  // Ensure it uses flexbox layout
                            fetchProducts();
                        });
                        document.getElementById('product-list').style.display = 'none';
                        document.getElementById('edit-product-form-container').style.display = 'block';
                    }
                }
            })
            .catch(error => console.error('Error fetching product details:', error));
    }
    

    function handleEditProduct(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const productId = event.target.getAttribute('data-product-id');
    
        const deleteImages = Array.from(document.querySelectorAll('input[name="deleteImages"]:checked')).map(input => input.value);
        formData.append('deleteImages', JSON.stringify(deleteImages));
        formData.append('featured', document.getElementById('editProductFeatured').checked);
    
        const nameEn = document.getElementById('editProductNameEn').value;
        const nameAr = document.getElementById('editProductNameAr').value;
        const descriptionEn = document.getElementById('editProductDescriptionEn').value;
        const descriptionAr = document.getElementById('editProductDescriptionAr').value;
        const price = parseFloat(document.getElementById('editProductPrice').value);
    
        if (!nameEn || !nameAr || !descriptionEn || !descriptionAr || isNaN(price)) {
            alert('All fields are required and price must be a valid number.');
            return;
        }
    
        formData.set('name.en', nameEn);
        formData.set('name.ar', nameAr);
        formData.set('description.en', descriptionEn);
        formData.set('description.ar', descriptionAr);
        formData.set('price', price);
    
        const apiUrl = `/api/products/${productId}`;
        console.log('Submitting edit for product:', productId, 'to URL:', apiUrl);
    
        fetch(apiUrl, {
            method: 'PUT',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error('Error editing product:', data.error);
                alert('Error editing product: ' + data.error);
            } else {
                console.log('Product edited:', data);
                const continueEditing = confirm('Product updated successfully. Do you want to stay on the same product?');
                if (!continueEditing) {
                    document.getElementById('edit-product-form-container').style.display = 'none';
                    document.getElementById('product-list').style.display = 'block';
                    fetchProducts();
                } else {
                    alert('Product updated successfully.');
                }
            }
        })
        .catch(error => {
            console.error('Error editing product:', error);
            alert('Error editing product: ' + error.message);
        });
    }

    function deleteProduct(productId) {
        const apiUrl = `/api/products/${productId}`;
        console.log('Deleting product:', productId, 'from URL:', apiUrl);

        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok. Status: ${response.status}`);
            }
            console.log('Product deleted:', productId);
            fetchProducts();
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            alert('Error deleting product: ' + error.message);
        });
    }

    function fetchInvoices() {
        fetch('/api/invoices')
            .then(response => response.json())
            .then(data => {
                const invoicesContainer = document.getElementById('invoices-container');
                if (invoicesContainer) {
                    invoicesContainer.innerHTML = '';
                    data.forEach(invoice => {
                        const invoiceDiv = document.createElement('div');
                        invoiceDiv.classList.add('invoice');
                        invoiceDiv.innerHTML = `
                            <h3>Invoice ID: ${invoice._id}</h3>
                            <p><strong>Shipping Method:</strong> ${invoice.shippingMethod}</p>
                            <p><strong>Payment Method:</strong> ${invoice.paymentMethod}</p>
                            <p><strong>First Name:</strong> ${invoice.shippingMethod === 'pickup' ? invoice.pickupDetails.firstName : invoice.deliveryDetails.firstName}</p>
                            <p><strong>Last Name:</strong> ${invoice.shippingMethod === 'pickup' ? invoice.pickupDetails.lastName : invoice.deliveryDetails.lastName}</p>
                            <p><strong>Phone:</strong> ${invoice.shippingMethod === 'pickup' ? invoice.pickupDetails.phone : invoice.deliveryDetails.phone}</p>
                            <p><strong>Email:</strong> ${invoice.shippingMethod === 'pickup' ? invoice.pickupDetails.email : invoice.deliveryDetails.email}</p>
                            <p><strong>Civil ID:</strong> ${invoice.shippingMethod === 'pickup' ? invoice.pickupDetails.civilId : invoice.deliveryDetails.civilId}</p>
                            ${invoice.shippingMethod === 'delivery' ? `
                            <p><strong>Area:</strong> ${invoice.deliveryDetails.area}</p>
                            <p><strong>Block:</strong> ${invoice.deliveryDetails.block}</p>
                            <p><strong>Street:</strong> ${invoice.deliveryDetails.street}</p>
                            <p><strong>House:</strong> ${invoice.deliveryDetails.house}</p>
                            <p><strong>Floor:</strong> ${invoice.deliveryDetails.floor}</p>
                            <p><strong>Flat:</strong> ${invoice.deliveryDetails.flat}</p>
                            ${invoice.deliveryDetails.civilIdImages ? `<p><strong>Civil ID Images:</strong></p>${invoice.deliveryDetails.civilIdImages.map(image => `<img src="${image}" alt="Civil ID Image" style="max-width: 100px; margin: 5px;">`).join('')}` : ''}
                            ` : ''}
                            <h4>Items</h4>
                            <ul>
                                ${invoice.cart.map(item => `<li>${item.name.en} x ${item.quantity} - ${item.price} KD each</li>`).join('')}
                            </ul>
                            <p><strong>Total:</strong> ${invoice.cart.reduce((total, item) => total + item.price * item.quantity, 0)} KD</p>
                        `;
                        invoicesContainer.appendChild(invoiceDiv);
                    });
                }
            })
            .catch(error => console.error('Error fetching invoices:', error));
    }
});
