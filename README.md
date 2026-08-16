# Welcome to Perscript!

*Formally known as FRC Programming Practice*

A web-based programming practice site built with React and Monaco Editor to help students learn and improve FRC (FIRST Robotics Competition) programming skills.

Huge thanks to [@Zw96042](https://github.com/Zw96042) for the frontend!

## About

FRC Programming Practice is designed to help beginner and intermediate robotics programmers strengthen their programming fundamentals.

The platform provides FRC-style (Command Based) Java, C++, and Python programming challenges. Students can write and test code directly in the browser using the Monaco Editor.

The goal of this project is to make learning FRC programming more accessible by providing guided practice, debugging support, tutorials, and AI-powered assistance to help mentors and students.

## Features

### Interactive Coding Environment
- Browser-based coding workspace powered by Monaco Editor
- Support for:
  - Java
  - C++
  - Python
- Real-time code editing experience.

### Learning Resources
- Java tutorials
- Python tutorials
- C++ tutorials
- Debugging exercises for Java, Python, and C++

### AI Programming Assistant
- AI-powered assistance for programming questions and debugging
- Backend built in JavaScript
- Uses OpenAI-compatible AI services through a Groq-hosted model routing system
- Helps students understand errors, improve code, and learn programming concepts

### Team Numbers
- Team number collection through a modal system
- Suggestions and feedback collection
- Data stored securely using MongoDB

## Project Structure

*Only the main pages are included*

```
├── BACKEND/
│   ├── AI/             
│       ├── generate.js         # Backend for AI Assist
│   ├── Suggestions
│        ├── suggest.js         # The code to save suggestion
│        └── suggestSchema.js   # Structure for suggestions
│   ├── TeamNumber
│        ├── store.js          # The code to save team numbers
│        └── schema.js         # Structure for Team Numbers
│    ├── database.js           # Connect to MongoDB
│    ├── routes.js             # Routes for Mongo
│    ├── server.js             # To start local server used for testing
│
├── FRONTEND/
│   ├── JSON/
│   │   ├── debugProblems.json  # Debug problems
│   │   └── problems.json       # Live coding problems
│   ├── SideFiles/
│   │   ├── Bug.jsx             # Debugging page
│   │   ├── PP.tsx              # Privacy policy page
│   │   ├── Program.jsx         # Live programming page
│   │   ├── Sug.jsx             # Suggestions page
│   │   └── Tut.tsx             # Tutorial page
│   ├── components/
│   │   ├── FeedbackPopover.tsx # Popover for user feedback
│   │   ├── Footer.tsx          # Footer
│   │   ├── Header.tsx          # Header
│   │   ├── Nav.tsx             # Navigation (mobile only)
│   │   └── Spinner.tsx         # Spinner
│   ├── App.tsx                 # Landing page
│   ├── GA.jsx                  # Google Analytics setup
│   ├── RoutesPage.jsx          # Routes page
│   ├── Team.jsx                # Team modal
│   ├── Template.jsx            # Template
│   ├── index.css               # Styles
│   ├── main.jsx                # Redirects to RoutesPage
│
└── README.md
```

## Technology Stack

### Frontend
- React
- JSX and TSX components
- Vite development environment
- Tailwind and CSS combination
- Monaco Editor
- Responsive web interface

### Backend
- JavaScript backend services
- MongoDB database integration
- Handles:
  - Team number submissions
  - Suggestions/feedback
  - AI assistant requests

### AI Integration
- OpenAI-compatible API integration
- Requests routed through Groq AI models for AI assistance functionality

### Deployment
Planned deployment using:
- Render for backend hosting
- GitHub Pages for frontend hosting

## Who This Is For

- FRC students learning programming
- Beginner programmers interested in robotics
- FIRST Robotics Competition teams improving programming skills
- Mentors teaching Command-Based Programming
- Students preparing to work with real robot code

## Planned Updates

- Advanced subsystem programming problems
- More FRC-specific examples and question
- Anything else people suggest!

## Feedback / Suggestions

Have ideas, feature requests, or improvements?

You can submit feedback directly through the Suggestions page located in the website footer.

Please leave a suggestion so we can continue to improve the website!

Feel free to fork this Github repositories. All ideas and changes help!
