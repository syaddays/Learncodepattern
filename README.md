# Coding Patterns Website

An interactive website for learning common coding patterns and algorithms. The website provides a structured approach to learning various programming patterns with examples in both C++ and JavaScript.

## Features

- Multiple coding patterns (Sliding Window, Two Pointers, etc.)
- Examples in both C++ and JavaScript
- Interactive UI with syntax highlighting
- Progress tracking
- Mobile-responsive design
- Fixed navigation buttons for seamless learning flow
- Improved code editor display and functionality
- Cleaner UI with unnecessary elements removed

## Setup

1. Clone this repository:
```bash
git clone https://github.com/syaddays/Learncodepattern
cd Learncodepattern
```

2. Start a local server:
   - Using Python (Python 3.x required):
     ```bash
     python -m http.server 8000
     ```
   - Or using any other static file server

3. Open your browser and visit:
```
http://localhost:8000
```

## Directory Structure

```
coding-patterns-website/
|-- index.html          # Main HTML file
|-- styles.css          # Stylesheet
|-- custom.css          # Custom styles for UI fixes
|-- script.js           # JavaScript functionality
|-- custom.js           # Custom JavaScript for navigation fixes
|-- content/            # Pattern content
    |-- patterns.json   # Pattern definitions
    |-- sliding-window/
    |-- two-pointers/
    |-- ...
```

## Recent Fixes

1. **Navigation Buttons**: Fixed "Back" and "Next" buttons to work with local file structure
2. **Code Editor**: Improved Monaco editor display and functionality
3. **Cleaner UI**: Removed unnecessary elements like "DISCUSS", "Send feedback", and "Recommendations"
4. **Local Navigation**: Navigation now works without external links to educative.io

## License

MIT License - feel free to use this in your own projects!
