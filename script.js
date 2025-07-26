// Initialize the completion status from localStorage
let completionStatus = JSON.parse(localStorage.getItem('completionStatus')) || {};

// Function to save completion status
function saveCompletionStatus() {
    localStorage.setItem('completionStatus', JSON.stringify(completionStatus));
}

// Function to update progress counter for a pattern
function updateProgress(patternId, questionsCount, progressElement) {
    let completedQuestions = 0;
    const pattern = patternsData[patternId];
    
    pattern.problems.forEach(problem => {
        if (completionStatus[`${patternId}-${problem.id}`]) {
            completedQuestions++;
        }
    });
    
    if (progressElement) {
        progressElement.textContent = `${completedQuestions}/${questionsCount} completed`;
    }
}

// Function to load patterns data
async function loadPatternsData() {
    try {
        // Try multiple possible paths for patterns.json
        const possiblePaths = [
            'content/patterns.json',  // Original path
            '/content/patterns.json', // With leading slash
            'patterns.json',          // In root directory
            '/patterns.json'          // Root with leading slash
        ];
        
        let response = null;
        let successPath = null;
        
        // Try each path until one works
        for (const path of possiblePaths) {
            console.log(`Attempting to load patterns data from ${path}`);
            try {
                const tempResponse = await fetch(path);
                console.log(`Fetch response for ${path}:`, tempResponse.status, tempResponse.statusText);
                
                if (tempResponse.ok) {
                    response = tempResponse;
                    successPath = path;
                    console.log(`Successfully fetched patterns data from ${path}`);
                    break;
                }
            } catch (fetchError) {
                console.error(`Network error during fetch from ${path}:`, fetchError);
                // Continue to next path
            }
        }
        
        if (!response) {
            throw new Error(`Failed to load patterns data from any of the attempted paths: ${possiblePaths.join(', ')}`);
        }
        
        // Try to parse JSON with more detailed error handling
        let data;
        try {
            const text = await response.text();
            console.log(`Response text received from ${successPath}, length:`, text.length);
            console.log('First 100 characters:', text.substring(0, 100));
            data = JSON.parse(text);
        } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            throw new Error(`JSON parsing error: ${jsonError.message}`);
        }
        
        if (!data || typeof data !== 'object') {
            console.error('Invalid data format received:', data);
            throw new Error('Invalid data format: Expected an object');
        }
        
        console.log('Patterns data loaded successfully:', Object.keys(data).length, 'patterns found');
        return data;
    } catch (error) {
        console.error('Error loading patterns:', error);
        // Display error in the UI
        const patternsList = document.getElementById('patternsList');
        if (patternsList) {
            patternsList.innerHTML = `<div class="error-message">Failed to load patterns data: ${error.message}</div>`;
        }
        return {};
    }
}

// Function to create sidebar content
async function createSidebar() {
    console.log('createSidebar function called');
    
    const patternsList = document.getElementById('patternsList');
    if (!patternsList) {
        console.error('patternsList element not found');
        // Try to find the sidebar element to display an error
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.innerHTML += '<div style="color: red; padding: 1rem;">Error: patternsList element not found</div>';
        } else {
            console.error('sidebar element also not found');
            document.body.innerHTML += '<div style="color: red; padding: 1rem; position: fixed; top: 0; left: 0; background: white; z-index: 9999;">Error: Critical UI elements not found</div>';
        }
        return;
    }
    
    // Show loading indicator
    patternsList.innerHTML = '<div class="loading-indicator">Loading patterns...</div>';
    
    // Load patterns data
    console.log('About to call loadPatternsData()');
    const patternsData = await loadPatternsData();
    console.log('loadPatternsData() returned:', patternsData ? `Object with ${Object.keys(patternsData).length} keys` : 'null or undefined');
    
    if (!patternsData || Object.keys(patternsData).length === 0) {
        console.error('Failed to load patterns data or empty data received');
        patternsList.innerHTML = '<div class="error-message">Failed to load patterns data. Please check the console for details.</div>';
        return;
    }
    
    // Store for global access
    console.log('Setting window.patternsData');
    window.patternsData = patternsData;
    
    // Sort patterns by number
    const sortedPatterns = Object.values(patternsData).sort((a, b) => a.number - b.number);
    
    sortedPatterns.forEach(pattern => {
        // Create pattern container
        const patternContainer = document.createElement('div');
        patternContainer.className = 'pattern-item';
        
        // Create pattern header
        const patternHeader = document.createElement('div');
        patternHeader.className = 'pattern-header';
        patternHeader.innerHTML = `
            <span>${pattern.name}</span>
            <span class="pattern-progress">0/${pattern.problems.length} completed</span>
        `;
        
        // Create questions list
        const questionsList = document.createElement('div');
        questionsList.className = 'questions-list';
        
        // Sort problems by number
        const sortedProblems = pattern.problems.sort((a, b) => a.number - b.number);
        
        sortedProblems.forEach(problem => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            
            // Create checkbox wrapper
            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkbox-wrapper';
            
            // Create checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            const problemKey = `${pattern.id}-${problem.id}`;
            checkbox.checked = completionStatus[problemKey] || false;
            checkbox.addEventListener('change', (e) => {
                completionStatus[problemKey] = e.target.checked;
                saveCompletionStatus();
                updateProgress(pattern.id, pattern.problems.length, patternHeader.querySelector('.pattern-progress'));
            });
            
            // Create question title
            const questionTitle = document.createElement('span');
            questionTitle.textContent = problem.name;
            questionTitle.style.cursor = 'pointer';
            
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(questionTitle);
            questionItem.appendChild(checkboxWrapper);
            
            // Create language options
            const languageOptions = document.createElement('div');
            languageOptions.className = 'language-options';
            
            // Add language options
            ['JavaScript', 'C++'].forEach(lang => {
                const langLink = document.createElement('a');
                langLink.className = 'language-option';
                langLink.textContent = lang;
                langLink.href = '#';
                langLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Remove active class from all language options
                    document.querySelectorAll('.language-option').forEach(opt => opt.classList.remove('active'));
                    // Add active class to clicked option
                    langLink.classList.add('active');
                    loadContent(pattern.id, problem.id);
                });
                languageOptions.appendChild(langLink);
            });
            
            questionItem.appendChild(languageOptions);
            questionsList.appendChild(questionItem);
            
            // Add click event to question title
            questionTitle.addEventListener('click', () => {
                const wasHidden = languageOptions.style.display === 'none' || !languageOptions.style.display;
                const allLanguageOptions = document.querySelectorAll('.language-options');
                allLanguageOptions.forEach(opt => opt.style.display = 'none');
                languageOptions.style.display = wasHidden ? 'block' : 'none';
            });
        });
        
        patternContainer.appendChild(patternHeader);
        patternContainer.appendChild(questionsList);
        patternsList.appendChild(patternContainer);
        
        // Add click event to pattern header
        patternHeader.addEventListener('click', () => {
            const wasHidden = questionsList.style.display === 'none' || !questionsList.style.display;
            questionsList.style.display = wasHidden ? 'block' : 'none';
        });
        
        // Update initial progress
        updateProgress(pattern.id, pattern.problems.length, patternHeader.querySelector('.pattern-progress'));
    });
}

// Function to load content
async function loadContent(pattern, problem) {
    console.log(`Loading content for pattern: ${pattern}, problem: ${problem}`);
    const contentFrame = document.getElementById('contentFrame');
    const disclaimer = document.getElementById('disclaimer');
    
    if (!contentFrame) {
        console.error('contentFrame element not found');
        return;
    }
    
    if (!disclaimer) {
        console.error('disclaimer element not found');
        return;
    }
    
    // Store current pattern and problem for navigation
    window.currentPattern = pattern;
    window.currentProblem = problem;
    
    try {
        const activeLanguageOption = document.querySelector('.language-option.active');
        console.log('Active language option:', activeLanguageOption ? activeLanguageOption.textContent : 'none');
        
        const language = activeLanguageOption ? 
            activeLanguageOption.textContent.toLowerCase() === 'c++' ? 'cpp' : 'javascript' 
            : 'cpp';
        
        console.log(`Selected language: ${language}`);
        
        // Construct paths for both possible formats
        const paths = [
            `content/${pattern}/${problem}/${language}.html`,  // without difficulty
            `content/${pattern}/${problem}-(easy)/${language}.html`,
            `content/${pattern}/${problem}-(medium)/${language}.html`,
            `content/${pattern}/${problem}-(hard)/${language}.html`
        ];
        
        console.log('Trying paths:', paths);
        
        // Try each path until one works
        let content = null;
        let response = null;
        let successPath = null;
        
        for (const path of paths) {
            try {
                console.log(`Attempting to fetch: ${path}`);
                response = await fetch(path);
                if (response.ok) {
                    console.log(`Successfully loaded content from: ${path}`);
                    content = await response.text();
                    successPath = path;
                    break;
                } else {
                    console.log(`Failed to load from ${path}: ${response.status} ${response.statusText}`);
                }
            } catch (e) {
                console.error(`Error fetching ${path}:`, e);
                continue;
            }
        }
        
        if (!content) {
            console.error('No content found for any of the attempted paths');
            throw new Error('Content not found');
        }
        
        console.log('Hiding disclaimer and displaying content');
        disclaimer.style.display = 'none';
        
        // Create a temporary container to parse the HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        
        // Extract the content div if it exists
        const contentDiv = tempContainer.querySelector('.content');
        if (contentDiv) {
            console.log('Content div found in the loaded HTML');
            contentFrame.innerHTML = contentDiv.innerHTML;
        } else {
            console.log('No content div found, using full HTML');
            contentFrame.innerHTML = content;
        }
        
        // Initialize syntax highlighting
        if (window.hljs) {
            const codeBlocks = contentFrame.querySelectorAll('pre code');
            
            // Process code blocks to escape HTML before highlighting
            codeBlocks.forEach((block) => {
                try {
                    // Get the original content
                    const originalContent = block.innerHTML;
                    
                    // Only escape if not already escaped
                    if (originalContent.includes('<') && !originalContent.includes('&lt;')) {
                        // Escape HTML entities
                        const escapedContent = originalContent
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;');
                        
                        // Set the escaped content
                        block.innerHTML = escapedContent;
                    }
                    
                    // Mark as processed
                    block.setAttribute('data-escaped', 'true');
                    
                    // Apply syntax highlighting
                    hljs.highlightBlock(block);
                } catch (e) {
                    console.error('Error highlighting code block:', e);
                }
            });
        } else {
            console.warn('highlight.js not found, syntax highlighting skipped');
        }
        
        // Add navigation buttons
        addNavigationButtons(pattern, problem);
        
    } catch (error) {
        console.error('Error loading content:', error);
        contentFrame.innerHTML = `
            <div class="error-message" style="color: red; padding: 2rem; text-align: center;">
                <h3>Error loading content</h3>
                <p>The requested content could not be loaded. Please try again later.</p>
                <p>Error details: ${error.message}</p>
                <p>Pattern: ${pattern}, Problem: ${problem}</p>
                <div style="margin-top: 1rem; text-align: left; background: #f5f5f5; padding: 1rem; border-radius: 4px; max-width: 600px; margin: 1rem auto;">
                    <p><strong>Debugging Information:</strong></p>
                    <p>If you're seeing this error, please check the following:</p>
                    <ol>
                        <li>Make sure the content directory structure is correct</li>
                        <li>Check that the pattern and problem IDs match the directory names</li>
                        <li>Verify that the HTML files exist in the expected locations</li>
                        <li>Check the browser console for more detailed error messages</li>
                    </ol>
                </div>
            </div>
        `;
        // Show the disclaimer if content loading fails
        if (disclaimer) {
            disclaimer.style.display = 'block';
        }
    }
}

// Toggle sidebar on mobile
document.getElementById('toggleSidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
});

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js: DOMContentLoaded event triggered');
    
    // Add a visible message to the body to confirm script.js is running
    const debugMessage = document.createElement('div');
    debugMessage.style.position = 'fixed';
    debugMessage.style.bottom = '10px';
    debugMessage.style.right = '10px';
    debugMessage.style.background = 'rgba(0, 0, 0, 0.7)';
    debugMessage.style.color = 'white';
    debugMessage.style.padding = '10px';
    debugMessage.style.borderRadius = '5px';
    debugMessage.style.zIndex = '9999';
    debugMessage.style.fontSize = '14px';
    debugMessage.textContent = 'script.js: DOMContentLoaded fired';
    document.body.appendChild(debugMessage);
    
    // Check if highlight.js is loaded
    if (window.hljs) {
        console.log('script.js: highlight.js is loaded');
        debugMessage.textContent += ' | hljs: ✓';
    } else {
        console.warn('script.js: highlight.js is not loaded, syntax highlighting will not work');
        debugMessage.textContent += ' | hljs: ✗';
    }
    
    // Check if required DOM elements exist
    const requiredElements = ['sidebar', 'patternsList', 'contentFrame', 'disclaimer', 'toggleSidebar'];
    const missingElements = [];
    
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missingElements.push(id);
            console.error(`script.js: Required element #${id} is missing`);
        }
    });
    
    if (missingElements.length > 0) {
        console.error(`script.js: Missing required elements: ${missingElements.join(', ')}`);
        debugMessage.textContent += ` | Missing: ${missingElements.join(', ')}`;
    } else {
        debugMessage.textContent += ' | Elements: ✓';
    }
    
    // Check if patterns.json is accessible
    fetch('content/patterns.json', { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                console.log('script.js: patterns.json is accessible');
                debugMessage.textContent += ' | patterns.json: ✓';
            } else {
                console.error(`script.js: patterns.json is not accessible: ${response.status} ${response.statusText}`);
                debugMessage.textContent += ' | patterns.json: ✗';
            }
        })
        .catch(error => {
            console.error('script.js: Error checking patterns.json:', error);
            debugMessage.textContent += ' | patterns.json: ✗';
        });
    
    // Initialize sidebar
    setTimeout(() => {
        try {
            console.log('script.js: Calling createSidebar()');
            createSidebar();
            debugMessage.textContent += ' | createSidebar: ✓';
        } catch (error) {
            console.error('script.js: Error in createSidebar:', error);
            debugMessage.textContent += ` | createSidebar: ✗ (${error.message})`;
            
            const patternsList = document.getElementById('patternsList');
            if (patternsList) {
                patternsList.innerHTML = `<div class="error-message">Error initializing sidebar: ${error.message}</div>`;
            }
        }
    }, 500); // Small delay to ensure DOM is fully ready
});

// This function is no longer needed as we're using createSidebar instead
// Keeping it for reference but it's not being called
async function loadPatterns() {
    console.log('loadPatterns is deprecated, use createSidebar instead');
    // This function has been replaced by createSidebar
}

    // These functions are no longer needed as we're using createSidebar instead
    // Keeping them for reference but they're not being called
    
    // Helper functions that were previously used
    function formatPatternName(pattern) {
        return pattern
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function formatProblemName(problem) {
        return problem
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

// The event listener for language options is already handled in the createSidebar function
// Each language option already has its own click event listener

// Function to add navigation buttons
function addNavigationButtons(currentPattern, currentProblem) {
    console.log('Adding navigation buttons for', currentPattern, currentProblem);
    
    if (!window.patternsData) {
        console.error('patternsData not available for navigation');
        return;
    }
    
    // Get the current pattern data
    const patternData = window.patternsData[currentPattern];
    if (!patternData) {
        console.error('Pattern data not found for', currentPattern);
        return;
    }
    
    // Get sorted problems for the current pattern
    const sortedProblems = patternData.problems.sort((a, b) => a.number - b.number);
    
    // Find the current problem index
    const currentProblemIndex = sortedProblems.findIndex(p => p.id === currentProblem);
    if (currentProblemIndex === -1) {
        console.error('Current problem not found in pattern data');
        return;
    }
    
    // Get previous and next problems
    const prevProblem = currentProblemIndex > 0 ? sortedProblems[currentProblemIndex - 1] : null;
    const nextProblem = currentProblemIndex < sortedProblems.length - 1 ? sortedProblems[currentProblemIndex + 1] : null;
    
    // Get all patterns sorted by number
    const sortedPatterns = Object.values(window.patternsData).sort((a, b) => a.number - b.number);
    
    // Find the current pattern index
    const currentPatternIndex = sortedPatterns.findIndex(p => p.id === currentPattern);
    
    // Handle edge cases for pattern navigation
    let prevPatternLastProblem = null;
    let nextPatternFirstProblem = null;
    
    if (currentProblemIndex === 0 && currentPatternIndex > 0) {
        // If we're at the first problem of a pattern, get the last problem of the previous pattern
        const prevPattern = sortedPatterns[currentPatternIndex - 1];
        const prevPatternProblems = prevPattern.problems.sort((a, b) => a.number - b.number);
        prevPatternLastProblem = {
            pattern: prevPattern.id,
            problem: prevPatternProblems[prevPatternProblems.length - 1]
        };
    }
    
    if (currentProblemIndex === sortedProblems.length - 1 && currentPatternIndex < sortedPatterns.length - 1) {
        // If we're at the last problem of a pattern, get the first problem of the next pattern
        const nextPattern = sortedPatterns[currentPatternIndex + 1];
        const nextPatternProblems = nextPattern.problems.sort((a, b) => a.number - b.number);
        nextPatternFirstProblem = {
            pattern: nextPattern.id,
            problem: nextPatternProblems[0]
        };
    }
    
    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.className = 'navigation-buttons';
    navContainer.style.display = 'flex';
    navContainer.style.justifyContent = 'space-between';
    navContainer.style.margin = '2rem 0';
    navContainer.style.padding = '1rem';
    navContainer.style.borderTop = '1px solid #e2e8f0';
    navContainer.style.borderBottom = '1px solid #e2e8f0';
    
    // Create previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'nav-button prev-button';
    prevButton.style.padding = '0.5rem 1rem';
    prevButton.style.backgroundColor = '#2563eb';
    prevButton.style.color = 'white';
    prevButton.style.border = 'none';
    prevButton.style.borderRadius = '0.25rem';
    prevButton.style.cursor = 'pointer';
    prevButton.innerHTML = '&larr; Previous';
    
    // Create next button
    const nextButton = document.createElement('button');
    nextButton.className = 'nav-button next-button';
    nextButton.style.padding = '0.5rem 1rem';
    nextButton.style.backgroundColor = '#2563eb';
    nextButton.style.color = 'white';
    nextButton.style.border = 'none';
    nextButton.style.borderRadius = '0.25rem';
    nextButton.style.cursor = 'pointer';
    nextButton.innerHTML = 'Next &rarr;';
    
    // Add event listeners
    if (prevProblem) {
        prevButton.addEventListener('click', () => {
            navigateToContent(currentPattern, prevProblem.id);
        });
    } else if (prevPatternLastProblem) {
        prevButton.addEventListener('click', () => {
            navigateToContent(prevPatternLastProblem.pattern, prevPatternLastProblem.problem.id);
        });
    } else {
        prevButton.disabled = true;
        prevButton.style.opacity = '0.5';
        prevButton.style.cursor = 'not-allowed';
    }
    
    if (nextProblem) {
        nextButton.addEventListener('click', () => {
            navigateToContent(currentPattern, nextProblem.id);
        });
    } else if (nextPatternFirstProblem) {
        nextButton.addEventListener('click', () => {
            navigateToContent(nextPatternFirstProblem.pattern, nextPatternFirstProblem.problem.id);
        });
    } else {
        nextButton.disabled = true;
        nextButton.style.opacity = '0.5';
        nextButton.style.cursor = 'not-allowed';
    }
    
    // Add buttons to container
    navContainer.appendChild(prevButton);
    navContainer.appendChild(nextButton);
    
    // Add navigation container to content frame
    const contentFrame = document.getElementById('contentFrame');
    if (contentFrame) {
        // Remove any existing navigation buttons
        const existingNav = contentFrame.querySelector('.navigation-buttons');
        if (existingNav) {
            existingNav.remove();
        }
        
        // Add the new navigation buttons at the top and bottom
        const topNav = navContainer.cloneNode(true);
        const bottomNav = navContainer;
        
        // Add event listeners to the cloned top navigation
        if (prevProblem || prevPatternLastProblem) {
            topNav.querySelector('.prev-button').addEventListener('click', () => {
                if (prevProblem) {
                    navigateToContent(currentPattern, prevProblem.id);
                } else if (prevPatternLastProblem) {
                    navigateToContent(prevPatternLastProblem.pattern, prevPatternLastProblem.problem.id);
                }
            });
        }
        
        if (nextProblem || nextPatternFirstProblem) {
            topNav.querySelector('.next-button').addEventListener('click', () => {
                if (nextProblem) {
                    navigateToContent(currentPattern, nextProblem.id);
                } else if (nextPatternFirstProblem) {
                    navigateToContent(nextPatternFirstProblem.pattern, nextPatternFirstProblem.problem.id);
                }
            });
        }
        
        // Insert at the top and bottom
        contentFrame.insertBefore(topNav, contentFrame.firstChild);
        contentFrame.appendChild(bottomNav);
    }
}

// Function to navigate to content
function navigateToContent(pattern, problem) {
    console.log(`Navigating to pattern: ${pattern}, problem: ${problem}`);
    
    // Find the pattern item in the sidebar
    const patternItems = document.querySelectorAll('.pattern-item');
    let found = false;
    
    // First, find the pattern container by pattern ID
    let targetPatternItem = null;
    let targetQuestionItem = null;
    
    // Loop through all pattern items to find the matching pattern
    for (const patternItem of patternItems) {
        const patternHeader = patternItem.querySelector('.pattern-header span');
        if (patternHeader) {
            // Get the pattern name and check if it matches any pattern in patternsData
            const patternName = patternHeader.textContent;
            const matchingPattern = Object.values(window.patternsData).find(p => p.name === patternName && p.id === pattern);
            
            if (matchingPattern) {
                targetPatternItem = patternItem;
                
                // Now find the question item within this pattern
                const questionItems = patternItem.querySelectorAll('.question-item');
                for (const questionItem of questionItems) {
                    const questionTitle = questionItem.querySelector('.checkbox-wrapper span');
                    if (questionTitle) {
                        // Find the matching problem by name
                        const problemName = questionTitle.textContent;
                        const matchingProblem = matchingPattern.problems.find(p => p.name === problemName && p.id === problem);
                        
                        if (matchingProblem) {
                            targetQuestionItem = questionItem;
                            found = true;
                            break;
                        }
                    }
                }
                
                if (found) break;
            }
        }
    }
    
    if (found && targetPatternItem && targetQuestionItem) {
        // Expand the pattern if it's collapsed
        const questionsList = targetPatternItem.querySelector('.questions-list');
        if (questionsList && (questionsList.style.display === 'none' || !questionsList.style.display)) {
            targetPatternItem.querySelector('.pattern-header').click();
        }
        
        // Click on the question title to show language options
        const questionTitle = targetQuestionItem.querySelector('.checkbox-wrapper span');
        if (questionTitle) {
            questionTitle.click();
        }
        
        // Click on the first language option
        setTimeout(() => {
            const languageOption = targetQuestionItem.querySelector('.language-option');
            if (languageOption) {
                languageOption.click();
            }
        }, 100);
    } else {
        console.error(`Could not find question item for pattern: ${pattern}, problem: ${problem}`);
    }
}