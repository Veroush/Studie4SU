document.addEventListener("DOMContentLoaded", function () {

    const track = document.querySelector(".events-track");
    const cards = document.querySelectorAll(".event-card");

    // Clone existing cards
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

});