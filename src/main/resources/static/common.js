async function checkAuthentication() {
    try {
        const response = await fetch('/isLoggedIn', {
            method: 'GET',
            credentials: 'include', // Include cookies if needed
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // User is not authenticated, redirect to login
            window.location.href = '/login';
            return false;
        }

        if (!response.ok) {
            console.error('Authentication check failed:', response.status);
            return false;
        }

        // User is authenticated
        return true;
    } catch (error) {
        console.error('Error checking authentication:', error);
        // Optionally redirect on network errors too
        // window.location.href = '/login';
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
        console.log('User not authenticated');
        // Additional cleanup if needed before redirect
    } else {
        console.log('User authenticated');
        // Initialize your app here
    }
});

lucide.createIcons();
