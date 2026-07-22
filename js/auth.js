// BASE_URL දැන් js/config.js එකෙන් load වෙනවා (මේ file එකට කලින් HTML එකේදී include කරන්න)

// ================= 1. REGISTER HANDLING =================
const registerForm = document.getElementById('registerForm'); // HTML Form ID එකට ගළපා ඇත
const roleSelect = document.getElementById('role');
const providerCategoryGroup = document.getElementById('providerCategoryGroup');

if (roleSelect && providerCategoryGroup) {
    roleSelect.addEventListener('change', (e) => {
        if (e.target.value === 'provider') {
            providerCategoryGroup.style.display = 'block';
        } else {
            providerCategoryGroup.style.display = 'none';
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // HTML Elements වලින් දත්ත ලබා ගැනීම
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const providerCategory = document.getElementById('providerCategory') ? document.getElementById('providerCategory').value : null;

        // UserCreate Pydantic Model එකට හරියන්නම සකසන ලද Payload එක
        const payload = {
            full_name: fullName,
            email: email,
            password: password,
            phone: phone ? phone : null, // Phone අංකයක් නොමැති නම් null ලෙස යවයි
            role: role,
            provider_category: role === 'provider' ? providerCategory : null
        };

        try {
            // නිවැරදි FastAPI endpoint එක වන /auth/register වෙත දත්ත යැවීම
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Registration successful! Please login.');
                window.location.href = 'login.html';
            } else {
                const data = await response.json();
                alert(`Registration failed: ${data.detail || 'Error occurred'}`);
            }
        } catch (err) {
            console.error('Error in registration:', err);
            alert('Could not connect to the backend server.');
        }
    });
}

// ================= 2. LOGIN HANDLING =================
// NOTE: login.html එකේ form id එකත් "loginForm" කියලා දාන්න ඕන (dash එකක් නැතුව) -
// කලින් "login-form" කියලා තිබ්බ නිසා මේ handler එකම fire වුනේම නෑ.
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // UserLogin Pydantic Model එකට අදාළ Payload එක
        const payload = {
            email: email,
            password: password
        };

        console.log("Payload ready for POST /auth/login:", payload);

        try {
            // නිවැරදි FastAPI endpoint එක වන /auth/login වෙත දත්ත යැවීම
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();

                // ලැබෙන JWT Token සහ විස්තර localStorage හි තැන්පත් කිරීම
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.user_id);

                alert('Login Successful!');

                // පරිශීලකයාගේ භූමිකාව (Role) අනුව නිවැරදි Dashboard පිටුවට යොමු කිරීම
                if (data.role === 'provider') {
                    window.location.href = 'provider-dashboard.html';
                } else if (data.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else if (data.role === 'customer') {
                    window.location.href = 'services.html'; // හෝ customer/dashboard.html
                } else {
                    window.location.href = 'index.html';
                }
            } else {
                const data = await response.json();
                alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
            }
        } catch (err) {
            console.error('Error in login:', err);
            alert('Could not connect to the backend server.');
        }
    });
}

// ================= 3. DYNAMIC NAVBAR USER PROFILE UPDATE =================
// පරිශීලකයා ලොග් වී ඇත්නම් Navbar එකේ ලින්ක්ස් ස්වයංක්‍රීයව වෙනස් කිරීමේ තර්කනය
document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.getElementById('nav-links');
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && navLinksContainer) {
        // ලොග් වී ඇත්නම් පෙන්විය යුතු Dashboard ලින්ක් එක තීරණය කිරීම
        let dashboardPage = 'services.html';
        if (role === 'provider') {
            dashboardPage = 'provider-dashboard.html';
        } else if (role === 'admin') {
            dashboardPage = 'admin-dashboard.html';
        }

        // පරණ Login/Register බොත්තම් වෙනුවට Profile, Dashboard සහ Logout බොත්තම ආදේශ කිරීම
        navLinksContainer.innerHTML = `
            <a href="index.html">Home</a>
            <a href="services.html">Services</a>
            <a href="${dashboardPage}">Dashboard</a>
            <a href="profile.html" style="font-weight:600; color:var(--primary);">My Profile</a>
            <a href="#" id="logoutBtn" class="btn-outline" style="margin-left: 1.5rem; padding: 0.4rem 1rem;">Logout</a>
        `;

        // Logout ක්‍රියාවලිය හැසිරවීම
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear(); // Token ඇතුළු සියලු දත්ත මකා දැමීම
            alert('Logged out successfully.');
            window.location.href = 'index.html';
        });
    }
});
