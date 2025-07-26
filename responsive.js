// Responsive features for the learning platform

document.addEventListener('DOMContentLoaded', function() {
    // Initialize responsive features
    initMobileSidebar();
    initBackToTopButton();
    initStartLearningButton();
    enhanceCodeBlocks();
    fixHighlightJsSecurity();
});

/**
 * Initialize mobile sidebar toggle functionality
 */
function initMobileSidebar() {
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileSidebarToggle && sidebar) {
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar when clicking outside of it on mobile
        document.addEventListener('click', function(event) {
            const isMobile = window.innerWidth <= 768;
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggle = mobileSidebarToggle.contains(event.target);
            
            if (isMobile && !isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }
    
    // Keep the original sidebar toggle working too
    const toggleSidebar = document.getElementById('toggleSidebar');
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

/**
 * Initialize back to top button functionality
 */
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    
    if (backToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Initialize start learning button functionality
 */
function initStartLearningButton() {
    const startLearningBtn = document.getElementById('startLearningBtn');
    const patternsList = document.getElementById('patternsList');
    const disclaimer = document.getElementById('disclaimer');
    
    if (startLearningBtn && patternsList && disclaimer) {
        startLearningBtn.addEventListener('click', function() {
            // Hide disclaimer and show first pattern
            disclaimer.style.display = 'none';
            
            // If on mobile, show the sidebar
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.add('active');
                }
            }
            
            // Try to click the first pattern if available
            setTimeout(() => {
                const firstPattern = patternsList.querySelector('.pattern-item');
                if (firstPattern) {
                    firstPattern.click();
                }
            }, 100);
        });
    }
}

/**
 * Enhance code blocks for better mobile viewing
 */
function enhanceCodeBlocks() {
    // Add observers to enhance code blocks when they're loaded
    const contentFrame = document.getElementById('contentFrame');
    
    if (contentFrame) {
        // Use MutationObserver to detect when new content is loaded
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Look for pre and code elements
                    const codeBlocks = contentFrame.querySelectorAll('pre, code');
                    
                    codeBlocks.forEach(function(block) {
                        // Make code blocks responsive
                        block.style.maxWidth = '100%';
                        block.style.overflowX = 'auto';
                        block.style.whiteSpace = 'pre-wrap';
                        block.style.wordBreak = 'break-word';
                        
                        // Add touch scrolling hint for mobile
                        if (window.innerWidth <= 768 && block.scrollWidth > block.clientWidth) {
                            const scrollHint = document.createElement('div');
                            scrollHint.className = 'scroll-hint';
                            scrollHint.textContent = 'Swipe to scroll →';
                            scrollHint.style.fontSize = '12px';
                            scrollHint.style.color = '#666';
                            scrollHint.style.textAlign = 'right';
                            scrollHint.style.padding = '4px';
                            block.parentNode.insertBefore(scrollHint, block);
                            
                            // Remove the hint after user has scrolled
                            block.addEventListener('scroll', function() {
                                if (scrollHint.parentNode) {
                                    scrollHint.parentNode.removeChild(scrollHint);
                                }
                            }, { once: true });
                        }
                    });
                }
            });
        });
        
        // Start observing the content frame
        observer.observe(contentFrame, { childList: true, subtree: true });
    }
}

/**
 * Fix highlight.js security warnings by properly escaping HTML in code blocks
 */
function fixHighlightJsSecurity() {
    // Configure highlight.js to ignore unescaped HTML if possible
    if (window.hljs && typeof hljs.configure === 'function') {
        hljs.configure({
            ignoreUnescapedHTML: true
        });
    }
    
    // Add observer to escape HTML in code blocks before they're highlighted
    const contentFrame = document.getElementById('contentFrame');
    
    if (contentFrame) {
        // Use MutationObserver to detect when new content is loaded
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // Look for code blocks that haven't been processed yet
                    const codeBlocks = contentFrame.querySelectorAll('pre code:not([data-escaped="true"])');
                    
                    codeBlocks.forEach(function(block) {
                        // Get the original content
                        const originalContent = block.innerHTML;
                        
                        // Escape HTML entities if not already escaped
                        if (originalContent.includes('<') && !originalContent.includes('&lt;')) {
                            const escapedContent = escapeHtml(originalContent);
                            block.innerHTML = escapedContent;
                            
                            // Mark as processed
                            block.setAttribute('data-escaped', 'true');
                            
                            // Re-highlight if highlight.js is available
                            if (window.hljs && typeof hljs.highlightBlock === 'function') {
                                try {
                                    hljs.highlightBlock(block);
                                } catch (e) {
                                    console.error('Error re-highlighting code block:', e);
                                }
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the content frame
        observer.observe(contentFrame, { childList: true, subtree: true });
    }
}

/**
 * Helper function to escape HTML entities
 */
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}