document.addEventListener('DOMContentLoaded', function () {
    const abstractLinks = document.querySelectorAll('.abstract-link');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const publicationCards = document.querySelectorAll('.publication-card');

    abstractLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const abstractContent = this.closest('.publication-card').querySelector('.abstract-content');
            abstractContent.style.display = abstractContent.style.display === 'none' ? 'block' : 'none';
        });
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('active');
            filterPublications();
        });
    });

    function filterPublications() {
        const activeFilters = {
            year: Array.from(filterButtons).filter(btn => btn.dataset.filter === 'year' && btn.classList.contains('active')).map(btn => btn.dataset.value),
            conference: Array.from(filterButtons).filter(btn => btn.dataset.filter === 'conference' && btn.classList.contains('active')).map(btn => btn.dataset.value),
            area: Array.from(filterButtons).filter(btn => btn.dataset.filter === 'area' && btn.classList.contains('active')).map(btn => btn.dataset.value)
        };

        publicationCards.forEach(card => {
            const matchYear = activeFilters.year.length === 0 || activeFilters.year.includes(card.dataset.year);
            const matchConference = activeFilters.conference.length === 0 || activeFilters.conference.includes(card.dataset.conference);
            const matchArea = activeFilters.area.length === 0 || activeFilters.area.includes(card.dataset.area);

            if (matchYear && matchConference && matchArea) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
});
