/**
 * Coming Soon Check System
 * Redirects users to coming-soon.html if store is in coming soon mode
 * Bypasses check for logged-in admins
 */

(function() {
    'use strict';
    
    // Don't run on admin pages or coming soon page itself
    const currentPath = window.location.pathname;
    const isAdminPage = currentPath.includes('admin-') || currentPath.includes('/admin/');
    const isComingSoonPage = currentPath.includes('coming-soon.html');
    
    if (isAdminPage || isComingSoonPage) {
        console.log('🏪 Coming Soon check: Skipping admin or coming-soon page');
        return;
    }
    
    // Check if user is authenticated admin
    function isAdminAuthenticated() {
        try {
            // Check both sessionStorage and localStorage for admin auth
            // sessionStorage for current tab, localStorage for cross-tab access
            let adminAuth = sessionStorage.getItem('adminAuthenticated');
            let loginTime = sessionStorage.getItem('adminLoginTime');
            let adminUser = sessionStorage.getItem('adminUser');
            
            // If not found in sessionStorage, check localStorage (for cross-tab access)
            if (adminAuth !== 'true' || !loginTime) {
                adminAuth = localStorage.getItem('adminAuthenticated');
                loginTime = localStorage.getItem('adminLoginTime');
                adminUser = localStorage.getItem('adminUser');
            }
            
            console.log('🏪 Auth check - adminAuth:', adminAuth, 'loginTime:', loginTime, 'user:', adminUser);
            
            if (adminAuth !== 'true' || !loginTime) {
                console.log('🏪 Admin not authenticated or missing login time');
                return false;
            }
            
            // Check if login is still valid (2 hours, matching admin-login session duration)
            const loginTimeMs = parseInt(loginTime);
            const currentTime = Date.now();
            const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
            const timeDiff = currentTime - loginTimeMs;
            
            console.log('🏪 Session age:', Math.floor(timeDiff / (1000 * 60)), 'minutes');
            
            if (timeDiff > sessionDuration) {
                console.log('🏪 Admin session expired');
                // Clear both session and localStorage
                sessionStorage.removeItem('adminAuthenticated');
                sessionStorage.removeItem('adminLoginTime');
                sessionStorage.removeItem('adminUser');
                localStorage.removeItem('adminAuthenticated');
                localStorage.removeItem('adminLoginTime');
                localStorage.removeItem('adminUser');
                return false;
            }
            
            console.log('🏪 Admin authenticated successfully');
            return true;
        } catch (error) {
            console.error('🏪 Error checking admin auth:', error);
            return false;
        }
    }
    
    // Check store status and redirect if needed
    async function checkStoreStatus() {
        try {
            console.log('🏪 Checking store status...');
            
            // First check admin authentication with retry logic
            let isAdmin = false;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (!isAdmin && retryCount < maxRetries) {
                isAdmin = isAdminAuthenticated();
                if (!isAdmin && retryCount < maxRetries - 1) {
                    console.log(`🏪 Admin check attempt ${retryCount + 1} failed, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                retryCount++;
            }
            
            // If admin is authenticated, allow access but show indicator
            if (isAdmin) {
                console.log('🏪 Admin authenticated - allowing access');
                showAdminIndicator();
                return;
            }
            
            // Fetch store status
            const response = await fetch('store-status.json?v=' + Date.now(), {
                cache: 'no-cache'
            });
            
            if (!response.ok) {
                console.log('🏪 No store status file found - store is live by default');
                return;
            }
            
            const storeStatus = await response.json();
            console.log('🏪 Store status:', storeStatus);
            
            // Check if store is in coming soon mode
            if (storeStatus.isComingSoon) {
                // Check if it's scheduled to open
                if (storeStatus.openDateTime) {
                    const openDate = new Date(storeStatus.openDateTime);
                    const now = new Date();
                    
                    if (now >= openDate) {
                        console.log('🏪 Store scheduled opening time has passed - allowing access');
                        return;
                    }
                    
                    console.log('🏪 Store is scheduled to open at:', openDate);
                }
                
                console.log('🏪 Store is in Coming Soon mode - redirecting...');
                window.location.replace('spinning-logo.html');
                return;
            }
            
            console.log('🏪 Store is live - allowing access');
            
        } catch (error) {
            console.error('🏪 Error checking store status:', error);
            // If there's an error, allow access (fail open)
            console.log('🏪 Error occurred - allowing access by default');
        }
    }
    
    // Show admin indicator when admin is logged in but store is in coming soon mode
    function showAdminIndicator() {
        // Create admin indicator
        const indicator = document.createElement('div');
        indicator.id = 'admin-coming-soon-indicator';
        indicator.innerHTML = '🔧 ADMIN VIEW - Store may be in Coming Soon mode for other users';
        indicator.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #8b7355, #6d5a43);
            color: white;
            text-align: center;
            padding: 10px;
            font-family: 'Workbench', Arial, sans-serif;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            letter-spacing: 0.5px;
        `;
        
        // Add to page when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(indicator);
                // Adjust body padding to account for indicator
                document.body.style.paddingTop = (document.body.style.paddingTop || '0').replace('px', '') + 50 + 'px';
            });
        } else {
            document.body.appendChild(indicator);
            document.body.style.paddingTop = (document.body.style.paddingTop || '0').replace('px', '') + 50 + 'px';
        }
    }
    
    // Run the check when page loads with a small delay to ensure proper authentication
    function runStoreCheck() {
        // Small delay to ensure sessionStorage is fully accessible
        setTimeout(checkStoreStatus, 100);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runStoreCheck);
    } else {
        runStoreCheck();
    }
    
})();