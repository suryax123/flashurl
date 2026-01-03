// Ad Blocker Detection Script
(function() {
    // Flag to track if blocker is detected
    var adBlockEnabled = false;
    
    // Method 1: Create a bait element
    var bait = document.createElement('div');
    bait.innerHTML = '&nbsp;';
    bait.className = 'adsbox ad-banner ad-placeholder pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
    bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;';
    
    document.body.appendChild(bait);
    
    // Method 2: Check for Brave browser
    function isBrave() {
        return navigator.brave && navigator.brave.isBrave;
    }
    
    // Check after a short delay
    setTimeout(function() {
        // Check if bait is hidden (ad blocker)
        if (bait.offsetParent === null || 
            bait.offsetHeight === 0 || 
            bait.offsetWidth === 0 || 
            bait.clientHeight === 0 || 
            bait.clientWidth === 0) {
            adBlockEnabled = true;
        }
        
        // Method 2: Try to load a fake ad script
        var testScript = document.createElement('script');
        testScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        testScript.onerror = function() {
            adBlockEnabled = true;
            showBlockerWarning();
        };
        testScript.onload = function() {
            if (adBlockEnabled || isBrave()) {
                showBlockerWarning();
            }
        };
        
        // If already detected, show warning
        if (adBlockEnabled || isBrave()) {
            showBlockerWarning();
        }
        
        // Clean up
        if (bait.parentNode) {
            bait.parentNode.removeChild(bait);
        }
    }, 100);
    
    function showBlockerWarning() {
        // Check if warning already exists
        if (document.getElementById('adblock-warning')) return;
        
        // Create warning overlay
        var overlay = document.createElement('div');
        overlay.id = 'adblock-warning';
        overlay.innerHTML = '<div class="adblock-modal">' +
            '<div class="adblock-icon">🛡️</div>' +
            '<h2>Ad Blocker Detected</h2>' +
            '<p>We noticed you\'re using an ad blocker. Our service is free because of ads.</p>' +
            '<p>Please disable your ad blocker and refresh the page to continue.</p>' +
            '<div class="adblock-steps">' +
                '<h4>How to disable:</h4>' +
                '<ol>' +
                    '<li>Click on your ad blocker icon in the browser toolbar</li>' +
                    '<li>Select "Disable on this site" or "Pause"</li>' +
                    '<li>Refresh this page</li>' +
                '</ol>' +
            '</div>' +
            '<button id="refreshBtn" class="btn btn-primary">I\'ve Disabled It - Refresh</button>' +
        '</div>';
        
        // Add styles
        var style = document.createElement('style');
        style.textContent = `
            #adblock-warning {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            }
            .adblock-modal {
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 500px;
                text-align: center;
                animation: fadeIn 0.3s ease;
            }
            .adblock-icon {
                font-size: 60px;
                margin-bottom: 20px;
            }
            .adblock-modal h2 {
                color: #d63031;
                margin-bottom: 15px;
            }
            .adblock-modal p {
                color: #636e72;
                margin-bottom: 10px;
            }
            .adblock-steps {
                background: #f5f6fa;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: left;
            }
            .adblock-steps h4 {
                margin-bottom: 10px;
                color: #2d3436;
            }
            .adblock-steps ol {
                margin: 0;
                padding-left: 20px;
                color: #636e72;
            }
            .adblock-steps li {
                margin-bottom: 5px;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            .btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px 24px;
                border: none;
                border-radius: 10px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s;
                text-decoration: none;
            }
            .btn-primary {
                background: linear-gradient(135deg, #6c5ce7, #00cec9);
                color: white;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(108, 92, 231, 0.4);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        
        // Add event listener to refresh button
        document.getElementById('refreshBtn').addEventListener('click', function() {
            window.location.reload();
        });
        
        // Prevent scrolling
        document.body.style.overflow = 'hidden';
    }
    
    // Expose function globally
    window.checkAdBlock = function(callback) {
        setTimeout(function() {
            callback(adBlockEnabled || (navigator.brave && navigator.brave.isBrave));
        }, 200);
    };
})();
