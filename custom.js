// Custom JavaScript to fix navigation buttons and make them work with local file structure

document.addEventListener('DOMContentLoaded', function() {
    // Add a class to the body to indicate that custom JS is loaded
    document.body.classList.add('custom-js-loaded');
    
    // Configure highlight.js to handle unescaped HTML
    if (window.hljs) {
        hljs.configure({
            ignoreUnescapedHTML: true
        });
    }
    
    // Wait for script.js to initialize
    const waitForScriptJs = function() {
        if (window.patternsData) {
            initCustomJs();
        } else {
            setTimeout(waitForScriptJs, 100);
        }
    };
    
    // Initialize custom.js functionality
    function initCustomJs() {
    
    // Function to observe DOM changes and fix navigation buttons when they appear
    function observeDOM() {
        // Create a MutationObserver to watch for changes in the DOM
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // Check if new nodes were added
                if (mutation.addedNodes.length) {
                    // Fix navigation buttons if they exist
                    fixNavigationButtons();
                }
            });
        });
        
        // Start observing the content frame for changes
        const contentFrame = document.getElementById('contentFrame');
        if (contentFrame) {
            observer.observe(contentFrame, { childList: true, subtree: true });
        }
    }
    
    // Function to fix navigation buttons
    function fixNavigationButtons() {
        // Get all navigation links
        const prevLink = document.querySelector('.styles__PreviousLink-sc-1j2nu8t-10');
        const nextLink = document.querySelector('.styles__NextLink-sc-1j2nu8t-9');
        
        // Fix the links if they exist
        if (prevLink) {
            fixNavigationLink(prevLink);
        }
        
        if (nextLink) {
            fixNavigationLink(nextLink);
        }
        
        // Fix the "Mark as Completed" checkbox
        const checkbox = document.querySelector('.styles__Checkbox-sc-1j2nu8t-1');
        if (checkbox) {
            checkbox.addEventListener('click', function() {
                // Toggle the checkbox state
                const svg = checkbox.querySelector('svg');
                const polyline = svg.querySelector('polyline');
                
                if (polyline) {
                    // If polyline exists, remove it (uncheck)
                    polyline.remove();
                } else {
                    // If polyline doesn't exist, add it (check)
                    const newPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
                    newPolyline.setAttribute('points', '4 10.6 6.30769231 13 14 5');
                    newPolyline.setAttribute('stroke', '#208705');
                    newPolyline.setAttribute('stroke-width', '2.5');
                    svg.querySelector('g > g > g').appendChild(newPolyline);
                }
            });
        }
    }
    
    // Function to fix a navigation link
    function fixNavigationLink(link) {
        // Get the original href
        const originalHref = link.getAttribute('href');
        
        // Extract the pattern and problem from the URL
        if (originalHref && originalHref.includes('educative.io/courses/')) {
            // Get the current pattern and problem from the URL
            const currentUrl = window.location.pathname;
            const urlParts = currentUrl.split('/');
            
            // Get the title of the target page
            const titleElement = link.nextElementSibling;
            const targetTitle = titleElement ? titleElement.textContent.trim() : '';
            
            // Find the corresponding pattern and problem in the sidebar
            const patternItems = document.querySelectorAll('.pattern-item');
            
            patternItems.forEach(function(patternItem) {
                const patternHeader = patternItem.querySelector('.pattern-header');
                const patternName = patternHeader ? patternHeader.querySelector('span').textContent.trim() : '';
                
                const questionItems = patternItem.querySelectorAll('.question-item');
                
                questionItems.forEach(function(questionItem) {
                    const questionTitle = questionItem.querySelector('span').textContent.trim();
                    
                    // If the question title matches the target title, use this link
                    if (questionTitle === targetTitle) {
                        // Simulate a click on this question
                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            questionItem.querySelector('span').click();
                            
                            // Click the first language option (JavaScript or C++)
                            setTimeout(function() {
                                const languageOption = questionItem.querySelector('.language-option');
                                if (languageOption) {
                                    languageOption.click();
                                }
                            }, 100);
                        });
                    }
                });
            });
        }
    }
    
        // Start observing DOM changes
        observeDOM();
    }
    
    // Start waiting for script.js to initialize
    waitForScriptJs();
});