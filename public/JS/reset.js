document.getElementById("otpsendbtn").addEventListener("click", async function () {
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;
    if (!email) {
        alert("Please enter email id first");
        return;
    }
    if(!role){
         alert("Select role");
    }
    console.log(role);
    try {
        const res = await fetch("/user/send-otp-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, role }) // ✅ Only sending email
        });

        const data = await res.json();

        if (res.ok) {
            showNotification(data.message, "success");
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("submit").style.display = "block";
            document.getElementById("otpsendbtn").style.display = "none";
        } else {
            showNotification(data.message || "Failed to send OTP", "error");
        }
    } catch (err) {
        console.log(err);
        alert("Something went wrong");
    }
});
