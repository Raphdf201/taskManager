let lastScroll = 0;
const header = document.querySelector('.header');

function checkVisibility() {
    const tasks = document.querySelectorAll('.task-card');
    tasks.forEach((task, index) => {
        const taskTop = task.getBoundingClientRect().top;
        const taskBottom = task.getBoundingClientRect().bottom;
        const windowHeight = window.innerHeight;

        // Show when scrolling into view
        if (taskTop < windowHeight - 1 && taskBottom > 0) {
            setTimeout(() => {
                task.classList.add('visible');
            }, index * 75);
        }
        // Hide when scrolling out of view
        else if (taskBottom < 0 || taskTop > windowHeight) {
            task.classList.remove('visible');
        }
    });
}

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll && currentScroll > 100) {
        header.classList.add('hidden');
    } else {
        header.classList.remove('hidden');
    }

    lastScroll = currentScroll;
    checkVisibility();
});

function openModal() {
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

lucide.createIcons();
