document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const searchInput = document.querySelector('#search input[type="text"]');
    const searchButton = document.querySelector('#search button');
    const popularSearches = document.querySelectorAll('#search .flex-wrap a');
    const searchResults = document.getElementById('searchResults');
    const searchContainer = document.querySelector('#search .relative');
    let debounceTimer;
    
    // Function to fetch products from FakeStoreAPI
    async function fetchProducts(searchTerm = '') {
        try {
            let url = 'https://fakestoreapi.com/products';
            const response = await fetch(url);
            const products = await response.json();
            
            if (searchTerm) {
                return products.filter(product => 
                    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }
    
    // Function to display search results in dropdown
    function displayResults(products) {
        searchResults.innerHTML = '';
        
        if (products.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No products found matching your search</div>';
            searchResults.classList.add('show');
            return;
        }
        
        products.slice(0, 10).forEach(product => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <img src="${product.image}" alt="${product.title}">
                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-category">${product.category}</div>
                </div>
                <i class="fas fa-chevron-right text-gray-400 ml-2"></i>
            `;
            item.addEventListener('click', () => {
                searchInput.value = product.title;
                searchResults.classList.remove('show');
                // You could redirect to product page or do something else here
                console.log('Selected product:', product);
            });
            searchResults.appendChild(item);
        });
        
        searchResults.classList.add('show');
        
        // Adjust position if near bottom of viewport
        const inputRect = searchInput.getBoundingClientRect();
        const spaceBelow = window.innerHeight - inputRect.bottom;
        const resultsHeight = Math.min(500, spaceBelow - 20);
        
        searchResults.style.maxHeight = `${resultsHeight}px`;
    }
    
    // Debounced search function
    function performSearch() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length >= 2) {
                const products = await fetchProducts(searchTerm);
                displayResults(products);
            } else {
                searchResults.classList.remove('show');
            }
        }, 300);
    }
    
    // Handle search button click
    searchButton.addEventListener('click', async function() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Set loading state
            const originalContent = searchButton.innerHTML;
            searchButton.innerHTML = '<span>Searching</span><i class="fas fa-spinner fa-spin ml-2"></i>';
            searchButton.disabled = true;
            
            const products = await fetchProducts(searchTerm);
            
            // Remove loading state
            searchButton.innerHTML = originalContent;
            searchButton.disabled = false;
            
            displayResults(products);
        } else {
            searchResults.classList.remove('show');
        }
    });
    
    // Real-time search as user types
    searchInput.addEventListener('input', performSearch);
    
    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });
    
    // Handle popular search clicks
    popularSearches.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const searchText = this.textContent.trim();
            const cleanText = searchText.replace(/^[^\w]+/, '').trim();
            searchInput.value = cleanText;
            searchInput.focus();
            performSearch();
        });
    });
    
    // Close results when pressing Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.classList.remove('show');
        } else if (e.key === 'Enter') {
            searchButton.click();
        }
    });
    
    // Handle window resize to adjust dropdown position
    window.addEventListener('resize', () => {
        if (searchResults.classList.contains('show')) {
            const inputRect = searchInput.getBoundingClientRect();
            const spaceBelow = window.innerHeight - inputRect.bottom;
            const resultsHeight = Math.min(500, spaceBelow - 20);
            searchResults.style.maxHeight = `${resultsHeight}px`;
        }
    });
});