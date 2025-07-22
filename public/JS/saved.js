document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".toggle-save-btn");

  buttons.forEach(button => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();
      const noteId = this.getAttribute("data-note-id");
      const icon = this.querySelector("i");

      try {
        const response = await fetch(`/notes/save/${noteId}`, {
         
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          }
        });

        const result = await response.json();
        if (result.saved) {
          icon.classList.remove("bi-bookmark", "text-secondary");
          icon.classList.add("bi-bookmark-fill", "text-primary");
        } else {
          icon.classList.remove("bi-bookmark-fill", "text-primary");
          icon.classList.add("bi-bookmark", "text-secondary");
        }
      } catch (err) {
        alert("Error saving note");
        console.error(err);
      }
    });
  });
});
