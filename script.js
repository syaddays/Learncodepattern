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
        const response = await fetch('content/patterns.json');
        if (!response.ok) throw new Error('Failed to load patterns data');
        return await response.json();
    } catch (error) {
        console.error('Error loading patterns:', error);
        return {};
    }
}

// Function to create sidebar content
async function createSidebar() {
    const patternsList = document.getElementById('patternsList');
    patternsList.innerHTML = ''; // Clear existing content
    
    // Load patterns data
    const patternsData = await loadPatternsData();
    window.patternsData = patternsData; // Store for global access
    
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
    const contentFrame = document.getElementById('contentFrame');
    const disclaimer = document.getElementById('disclaimer');
    
    try {
        const language = document.querySelector('.language-option.active') ? 
            document.querySelector('.language-option.active').textContent.toLowerCase() === 'c++' ? 'cpp' : 'javascript' 
            : 'cpp';
        
        // Construct paths for both possible formats
        const paths = [
            `content/${pattern}/${problem}/${language}.html`,  // without difficulty
            `content/${pattern}/${problem}-(easy)/${language}.html`,
            `content/${pattern}/${problem}-(medium)/${language}.html`,
            `content/${pattern}/${problem}-(hard)/${language}.html`
        ];
        
        // Try each path until one works
        let content = null;
        let response = null;
        
        for (const path of paths) {
            try {
                response = await fetch(path);
                if (response.ok) {
                    content = await response.text();
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!content) {
            throw new Error('Content not found');
        }
        
        disclaimer.style.display = 'none';
        
        // Create a temporary container to parse the HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        
        // Extract the content div if it exists
        const contentDiv = tempContainer.querySelector('.content');
        contentFrame.innerHTML = contentDiv ? contentDiv.innerHTML : content;
        
        // Initialize syntax highlighting
        if (window.hljs) {
            contentFrame.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
        contentFrame.innerHTML = `
            <div class="error-message" style="color: red; padding: 2rem; text-align: center;">
                <h3>Error loading content</h3>
                <p>The requested content could not be loaded. Please try again later.</p>
                <p>Error details: ${error.message}</p>
            </div>
        `;
    }
}

// Toggle sidebar on mobile
document.getElementById('toggleSidebar').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
});

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createSidebar();
});

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const patternList = document.getElementById('patternList');
    const content = document.getElementById('content');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const cppBtn = document.getElementById('cppBtn');
    const jsBtn = document.getElementById('jsBtn');

    let currentPattern = '';
    let currentProblem = '';
    let currentLanguage = 'cpp';

    // Toggle sidebar
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Language switching
    cppBtn.addEventListener('click', () => {
        if (currentLanguage !== 'cpp') {
            currentLanguage = 'cpp';
            cppBtn.classList.add('active');
            jsBtn.classList.remove('active');
            if (currentPattern && currentProblem) {
                loadContent(currentPattern, currentProblem);
            }
        }
    });

    jsBtn.addEventListener('click', () => {
        if (currentLanguage !== 'javascript') {
            currentLanguage = 'javascript';
            jsBtn.classList.add('active');
            cppBtn.classList.remove('active');
            if (currentPattern && currentProblem) {
                loadContent(currentPattern, currentProblem);
            }
        }
    });

    // Load patterns
    async function loadPatterns() {
        try {
            const response = await fetch('content');
            if (!response.ok) throw new Error('Failed to load patterns');
            
            const patterns = await response.json();
            patterns.sort();
            
            patternList.innerHTML = '';
            patterns.forEach(pattern => {
                if (pattern !== '.' && pattern !== '..') {
                    const patternDiv = document.createElement('div');
                    patternDiv.className = 'pattern';
                    
                    const patternHeader = document.createElement('div');
                    patternHeader.className = 'pattern-header';
                    patternHeader.textContent = formatPatternName(pattern);
                    patternHeader.addEventListener('click', () => togglePattern(patternDiv));
                    
                    const problemsList = document.createElement('div');
                    problemsList.className = 'problems-list hidden';
                    
                    patternDiv.appendChild(patternHeader);
                    patternDiv.appendChild(problemsList);
                    patternList.appendChild(patternDiv);
                    
                    loadProblems(pattern, problemsList);
                }
            });
        } catch (err) {
            console.error('Error loading patterns:', err);
            patternList.innerHTML = '<div class="error">Failed to load patterns</div>';
        }
    }

    // Load problems for a pattern
    async function loadProblems(pattern, problemsList) {
        try {
            const response = await fetch(`content/${pattern}`);
            if (!response.ok) throw new Error('Failed to load problems');
            
            const problems = await response.json();
            problems.sort();
            
            problems.forEach(problem => {
                if (problem !== '.' && problem !== '..' && !problem.endsWith('.html')) {
                    const problemDiv = document.createElement('div');
                    problemDiv.className = 'problem';
                    problemDiv.textContent = formatProblemName(problem);
                    problemDiv.addEventListener('click', () => {
                        currentPattern = pattern;
                        currentProblem = problem;
                        loadContent(pattern, problem);
                        
                        // Remove active class from all problems
                        document.querySelectorAll('.problem').forEach(p => p.classList.remove('active'));
                        // Add active class to clicked problem
                        problemDiv.classList.add('active');
                    });
                    problemsList.appendChild(problemDiv);
                }
            });
        } catch (err) {
            console.error('Error loading problems:', err);
            problemsList.innerHTML = '<div class="error">Failed to load problems</div>';
        }
    }

    // Helper functions
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

    function togglePattern(patternDiv) {
        const problemsList = patternDiv.querySelector('.problems-list');
        problemsList.classList.toggle('hidden');
    }

    // Initialize
    loadPatterns();
}); 