async function checkAuthentication() {
    try {
        const response = await fetch('/isLoggedIn', {
            method: 'GET',
            credentials: 'include', // Include cookies if needed
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return true;
        }

        if (response.status === 401) {
            // User is not authenticated, redirect to login
            window.location.href = '/login';
            return false;
        }

        if (!response.ok) {
            console.error('Authentication check failed:', response.status);
            return false;
        }

        return false;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await checkAuthentication();

    if (!isAuthenticated) {
        console.log('User not authenticated');
    } else {
        console.log('User authenticated');
    }
});

lucide.createIcons();
