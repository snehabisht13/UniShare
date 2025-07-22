document.querySelectorAll(".star-rating").forEach(ratingDiv => {
    const stars = ratingDiv.querySelectorAll("i");
    const isDisabled = ratingDiv.getAttribute("data-disabled") === "true";

    if (isDisabled) return;

    stars.forEach((star, idx) => {
        // Hover effect
        star.addEventListener("mouseover", () => {
            stars.forEach((s, i) => {
                s.classList.toggle("hovered", i <= idx);
            });
        });

        star.addEventListener("mouseout", () => {
            stars.forEach(s => s.classList.remove("hovered"));
        });

        // Click to rate
        star.addEventListener("click", async () => {
            const rating = idx + 1;
            const noteId = ratingDiv.getAttribute("data-note-id");

            // Visually select stars
            stars.forEach((s, i) => {
                s.classList.toggle("selected", i <= idx);
            });

            try {
                const res = await fetch("/notes/rate-note", {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ noteId, rating })
                });

                const data = await res.json();


                // Show toast or alert
                showNotification(data.message, data.type);
                if (data.type === "success") {
                    // Disable all stars so user cannot re-rate
                    stars.forEach(star => {
                        star.classList.add("disabled");
                        star.style.pointerEvents = "none";
                    });
                   
                }

            } catch (err) {
                console.error("Error:", err);
                showNotification("Failed to submit rating.", "error");
            }
        });
    });
});
