
function showNotification(message, type="info"){
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.className = `notification ${type}`;
    notification.style.display= "block";

    setTimeout(() => {
        notification.style.display = "none";
    }, 4000);
};