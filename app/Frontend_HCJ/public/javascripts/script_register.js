const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        const formData = new FormData(registerForm);
        const username = String(formData.get("username") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const password = String(formData.get("password") || "");
        const role = String(formData.get("role")||"user")


         if (!username || !email || !password) {
            alert("Username, email, and password are required.");
            return;
        }

        const payload = { username, email, password, role };

           try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            });

            const result = await parseResponse(response);

            if (!response.ok) {
                alert(result.message || "Registration failed.");
                return;
            }
                if(result.user.role === "artist"){
                window.location.href = "/artist";
                return;
            }
            window.location.href = "/home";
        } catch (error) {
            console.error("Registration error:", error);
            alert("Something went wrong. Try again.");
        }
    });

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
}