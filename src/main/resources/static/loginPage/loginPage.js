const API_URL = 'https://commtasks.raphdf201.net';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (sessionStorage.getItem('isLoggedIn')) {
             window.location.href = '../menu/menu.html';
        return;
    }

    // Handle Google login button click
    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            // Redirect to your API's Google login endpoint
            window.location.href = API_URL + '/login';
        });
    }
});