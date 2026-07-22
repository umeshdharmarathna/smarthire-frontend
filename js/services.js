// BASE_URL එක js/config.js එකෙන් load වෙනවා

// ================= BROWSE SERVICES (Customer View) =================
const servicesContainer = document.getElementById('services-container');

if (servicesContainer) {
    const fetchServices = async (query = '', categoryFilter = '') => {
        try {
            // URL එක තීරණය කිරීම (Search හෝ Category Filter)
            let url = `${BASE_URL}/services`;

            if (categoryFilter) {
                // Category එකක් තෝරා ඇත්නම් ඒ හරහා filter කිරීම
                url = `${BASE_URL}/services/search?category=${encodeURIComponent(categoryFilter)}`;
            } else if (query) {
                // Search query එකක් ඇතුළත් නම් එය හරහා filter කිරීම
                url = `${BASE_URL}/services/search?query=${encodeURIComponent(query)}`;
            }

            const response = await fetch(url);
            const services = await response.json();

            servicesContainer.innerHTML = '';

            if (services.length === 0) {
                servicesContainer.innerHTML = '<p>No services found.</p>';
                return;
            }

            services.forEach(service => {
                const card = document.createElement('div');
                card.className = 'service-card';
                card.innerHTML = `
                    <div>
                        <h3>${service.title}</h3>
                        <p class="text-light">${service.category}</p>
                        <p>${service.description ? service.description.substring(0, 80) : ''}...</p>
                    </div>
                    <div>
                        <div class="price">$${service.price}</div>
                        <a href="service-detail.html?id=${service.id}" class="btn-primary btn-block" style="text-align:center; display:block;">Book Now</a>
                    </div>
                `;
                servicesContainer.appendChild(card);
            });
        } catch (err) {
            console.error('Error fetching services:', err);
            servicesContainer.innerHTML = '<p>Failed to load services.</p>';
        }
    };

    // පිටුව ලෝඩ් වූ විගස URL එකේ category එකක් ඇත්දැයි බැලීම
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');

    if (categoryFromUrl) {
        fetchServices('', categoryFromUrl); // Category එකක් ඇත්නම් එය පෙන්වීම
    } else {
        fetchServices(); // නැත්නම් සාමාන්‍ය පරිදි සියලු සර්විස් පෙන්වීම
    }

    // Search button event (Search box එකේ ID 'search-btn' ලෙස තිබිය යුතුය)
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = document.getElementById('search-input').value;
            fetchServices(query);
        });
    }
}

// ================= POST NEW SERVICE & GET ACTIVE SERVICES (Provider View) =================
const addServiceForm = document.getElementById('add-service-form');
if (addServiceForm) {
    const token = localStorage.getItem('token');

    // Service එකක් අලුතින් එකතු කිරීම
    addServiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('service-title').value;
        const category = document.getElementById('service-category').value;
        // FIX: price එක Number() එකකට convert කරලා යවනවා - කලින් string විදිහට
        // යවපු නිසා backend Pydantic model එකේ price: float validation එකට fail වෙන්න පුළුවන්.
        const price = Number(document.getElementById('service-price').value);
        const description = document.getElementById('service-desc').value;

        try {
            const response = await fetch(`${BASE_URL}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, category, price, description })
            });

            if (response.ok) {
                alert('Service posted successfully!');
                addServiceForm.reset();
                fetchProviderServices(); // ලැයිස්තුව Refresh කිරීම
            } else {
                alert('Failed to post service.');
            }
        } catch (err) {
            console.error('Error posting service:', err);
        }
    });

    // Provider ගේ දැනට ඇති සර්විස් ලැයිස්තුව ලබා ගැනීම
    const fetchProviderServices = async () => {
        const myServicesList = document.getElementById('my-services-list');
        try {
            const response = await fetch(`${BASE_URL}/services?provider_id=${localStorage.getItem('userId')}`);
            const services = await response.json();

            myServicesList.innerHTML = '';
            if (services.length === 0) {
                myServicesList.innerHTML = '<p>No services posted yet.</p>';
                return;
            }

            services.forEach(service => {
                const div = document.createElement('div');
                div.style.padding = '1rem';
                div.style.borderBottom = '1px solid #e2e8f0';
                div.innerHTML = `
                    <h4>${service.title}</h4>
                    <p class="text-light">$${service.price} | ${service.category}</p>
                `;
                myServicesList.appendChild(div);
            });
        } catch (err) {
            console.error('Error fetching provider services:', err);
        }
    };

    fetchProviderServices();
}
