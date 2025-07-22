document.getElementById("otpsendbtn").addEventListener("click", async function () {
    const email = document.getElementById("email").value.trim();
    if (!email) {
        alert("Please enter email id first");
        return;
    }
    try {
        const res = await fetch("/user/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json(); // ✅ fixed here

        if (res.ok) {
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("submit").style.display = "block";
            this.style.display = "none";
            // document.getElementById("otpsendbtn").style.display = "none";

            const otpMsg = document.getElementById("otpMessage");
            otpMsg.style.display = "block";

            setTimeout(() => {
                otpMsg.style.display = "none";
            }, 3000);
        } else {
            alert("Failed to send OTP");
        }
    } catch (err) {
        // console.log("❌ AJAX error:", err);
        console.log(err);
        alert("Already exist");
    }
});
