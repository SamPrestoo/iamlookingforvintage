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
            const adminAuth = localStorage.getItem('adminAuthenticated');
            const loginTime = localStorage.getItem('adminLoginTime');
            
            if (adminAuth !== 'true' || !loginTime) {
                return false;
            }
            
            // Check if login is still valid (24 hours)
            const loginTimeMs = parseInt(loginTime);
            const currentTime = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (currentTime - loginTimeMs > twentyFourHours) {
                console.log('🏪 Admin session expired');
                localStorage.removeItem('adminAuthenticated');
                localStorage.removeItem('adminLoginTime');
                return false;
            }
            
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
            
            // If admin is authenticated, allow access but show indicator
            if (isAdminAuthenticated()) {
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
                window.location.replace('coming-soon.html');
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
    
    // Run the check when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkStoreStatus);
    } else {
        checkStoreStatus();
    }
    
})();