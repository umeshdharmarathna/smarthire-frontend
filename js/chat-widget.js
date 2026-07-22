// BASE_URL එක js/config.js එකෙන් load වෙනවා - මේ file එකට කලින් include කරන්න ඕන
const CHAT_API_URL = `${BASE_URL}/chat`;

document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById("chat-container");
    if (!chatContainer) return;

    // Inject Widget HTML into the current container page dynamically
    chatContainer.innerHTML = `
        <div class="chat-widget">
            <button class="chat-button" id="chat-toggle">💬</button>
            <div class="chat-window" id="chat-window">
                <div class="chat-header">Smart Hire Support</div>
                <div class="chat-messages" id="chat-messages">
                    <div class="chat-msg bot">Hi! How can I help you book a service today?</div>
                </div>
                <form class="chat-input-area" id="chat-form">
                    <input type="text" id="chat-input" placeholder="Type a message..." required>
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    `;

    const chatToggle = document.getElementById("chat-toggle");
    const chatWindow = document.getElementById("chat-window");
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    // Toggle widget opening
    chatToggle.addEventListener("click", () => {
        if (chatWindow.style.display === "none" || !chatWindow.style.display) {
            chatWindow.style.display = "flex";
        } else {
            chatWindow.style.display = "none";
        }
    });

    // Send chat messages to OpenAI backend router API
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // Display user message in UI
        appendMessage(message, "user");
        chatInput.value = "";

        // Send backend POST request
        try {
            const response = await fetch(CHAT_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            if (response.ok) {
                const data = await response.json();
                appendMessage(data.reply, "bot"); // Append response from Assistant
            } else {
                appendMessage("Sorry, I'm having trouble connecting right now.", "bot");
            }
        } catch (err) {
            console.error("AI chat error:", err);
            appendMessage("Unable to connect to assistant.", "bot");
        }
    });

    function appendMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerText = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll down
    }
});
