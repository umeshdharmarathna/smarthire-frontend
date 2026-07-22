// NOTE: මේ file එකේ නම දැන් "bookings.js" (කලින් "booking.js" - HTML ෆයිල් වල
// src="js/bookings.js" කියලා තිබ්බත් actual file එක "booking.js" නිසා 404 error එකක් වුනා).
// BASE_URL එක js/config.js එකෙන් load වෙනවා.

const token = localStorage.getItem('token');
const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get('id');

// LOAD DETAILS AND BOOK SERVICE
const detailCard = document.getElementById('service-detail-card');
if (detailCard && serviceId) {
    const fetchServiceDetail = async () => {
        try {
            const response = await fetch(`${BASE_URL}/services/${serviceId}`);
            const service = await response.json();

            detailCard.innerHTML = `
                <h2>${service.title}</h2>
                <p class="price" style="font-size:1.5rem; color:#2563eb; margin: 1rem 0;">Price: $${service.price}</p>
                <p><strong>Category:</strong> ${service.category}</p>
                <p style="margin-top:1rem;"><strong>Description:</strong><br>${service.description}</p>
            `;
        } catch (err) {
            console.error('Error loading service details:', err);
            detailCard.innerHTML = '<p>Failed to load service details.</p>';
        }
    };
    fetchServiceDetail();

    // Handle Booking Form Submission
    const bookingForm = document.getElementById('booking-form');

    // අද දවසට කලින් දවසක් වෙන් කරගන්න බැරි වෙන්න date field එකට min attribute එකක් දාමු
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!token) {
            alert('Please login first to make a booking.');
            window.location.href = 'login.html';
            return;
        }

        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;

        try {
            const response = await fetch(`${BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ service_id: serviceId, date, time })
            });

            if (response.ok) {
                alert('Booking successfully placed!');
                window.location.href = 'my-bookings.html';
            } else {
                alert('Booking failed. Try again.');
            }
        } catch (err) {
            console.error('Error saving booking:', err);
        }
    });
}

// GET USER BOOKINGS (CUSTOMER & PROVIDER VIEW)
const bookingsContainer = document.getElementById('bookings-container');
if (bookingsContainer) {
    const fetchBookings = async () => {
        if (!token) {
            bookingsContainer.innerHTML = '<p>Please login to view bookings.</p>';
            return;
        }

        const role = localStorage.getItem('role');
        // Construct filter parameters based on logged in user's role
        const queryParam = role === 'provider' ? `provider_id=${localStorage.getItem('userId')}` : `user_id=${localStorage.getItem('userId')}`;

        try {
            const response = await fetch(`${BASE_URL}/bookings?${queryParam}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const bookings = await response.json();

            bookingsContainer.innerHTML = '';
            if (bookings.length === 0) {
                bookingsContainer.innerHTML = '<p>No bookings found.</p>';
                return;
            }

            bookings.forEach(booking => {
                const card = document.createElement('div');
                card.className = 'booking-card';
                card.innerHTML = `
                    <div>
                        <h4>Booking for: ${booking.service_title}</h4>
                        <p class="text-light">Scheduled: ${booking.date} at ${booking.time}</p>
                    </div>
                    <div>
                        <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
                    </div>
                `;
                bookingsContainer.appendChild(card);
            });
        } catch (err) {
            console.error('Error listing bookings:', err);
            bookingsContainer.innerHTML = '<p>Failed to load bookings.</p>';
        }
    };
    fetchBookings();
}
