document.addEventListener("DOMContentLoaded", () => {
    const providersContainer = document.getElementById("providers-container");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const pageTitle = document.getElementById("page-title");

    // Get category from URL query string if present
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");

    if (categoryParam) {
        pageTitle.innerText = `Providers for: ${categoryParam}`;
        searchInput.value = categoryParam;
    }

    // Initial load
    fetchProviders(categoryParam || "");

    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        fetchProviders(query);
    });

    async function fetchProviders(category) {
        providersContainer.innerHTML = '<p class="loading">Loading providers...</p>';
        try {
            let url = `${BASE_URL}/providers/search`;
            if (category) {
                url += `?category=${encodeURIComponent(category)}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const providers = await response.json();
                renderProviders(providers);
            } else {
                providersContainer.innerHTML = "<p>Failed to load providers.</p>";
            }
        } catch (err) {
            console.error("Error fetching providers:", err);
            providersContainer.innerHTML = "<p>Could not connect to the server.</p>";
        }
    }

    function renderProviders(providers) {
        if (providers.length === 0) {
            providersContainer.innerHTML = "<p>No providers found for this category.</p>";
            return;
        }

        providersContainer.innerHTML = "";
        providers.forEach(provider => {
            const card = document.createElement("div");
            card.className = "service-card";
            card.innerHTML = `
                <h3>${provider.full_name}</h3>
                <p><strong>Category:</strong> ${provider.provider_category || "General"}</p>
                <p><strong>Email:</strong> ${provider.email}</p>
                ${provider.phone ? `<p><strong>Phone:</strong> ${provider.phone}</p>` : ""}
                <br>
                <a href="services.html" class="btn-outline">View Their Services</a>
            `;
            providersContainer.appendChild(card);
        });
    }
});
