const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const username = String(formData.get("username") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");

        if (!password || (!username && !email)) {
            alert("Enter username or email, and your password.");
            return;
        }

        const payload = { password };

        if (email) {
            payload.email = email;
        } else {
            payload.username = username;
        }

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            const result = await parseResponse(response);

            if (!response.ok) {
                alert(result.message || "Login failed.");
                return;
            }
            if(result.user.role === "artist"){
                window.location.href = "/artist";
                return;
            }
            window.location.href = "/home";
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Try again.");
        }
    });
}

async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();
    return {
        message: text || `Request failed with status ${response.status}`
    };
}
