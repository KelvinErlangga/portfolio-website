# Portfolio Website - Kelvin Erlangga

A modern, responsive portfolio website built with vanilla JavaScript and GSAP animations, featuring smooth scrolling, theme switching, and an interactive custom cursor.

## 🌟 Features

### Core Features
- **Responsive Design**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Smooth theme switching with system preference detection and localStorage persistence
- **Smooth Scrolling**: Custom smooth scrolling implementation with GSAP ScrollTrigger
- **Custom Cursor**: Interactive cursor with adaptive colors and hover effects
- **Performance Optimized**: Reduced motion support and optimized animations

### Sections & Components
1. **Hero Section**: Eye-catching landing with animated blobs and call-to-action
2. **About Section**: Personal introduction with skills showcase
3. **Experience Section**: Professional timeline with company logos and descriptions
4. **Education Section**: Academic background with institution cards
5. **Projects Section**: Filterable project grid with detailed project pages
6. **Skills Section**: Categorized skill cards with animations
7. **Contact Section**: Functional contact form with validation
8. **Footer**: Social links and copyright information

### Interactive Elements
- **Magnetic Hover Effects**: Buttons and cards with magnetic cursor attraction
- **Scroll-triggered Animations**: Elements animate in as you scroll
- **Click Ripple Effects**: Visual feedback on user interactions
- **Filter System**: Dynamic project filtering by category
- **Mobile Navigation**: Slide-out drawer menu for mobile devices

## 🛠 Tech Stack

### Frontend Technologies
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern CSS with custom properties, Grid, and Flexbox
- **JavaScript (ES6+)**: Vanilla JavaScript with modern syntax
- **GSAP (GreenSock Animation Platform)**: Professional animations and scrolling
  - GSAP Core
  - ScrollTrigger
  - ScrollToPlugin
  - TextPlugin

### Styling & Design
- **CSS Custom Properties**: Theme system with CSS variables
- **Responsive Grid System**: Custom grid layouts
- **Glass Morphism**: Modern translucent design elements
- **Custom Animations**: Tailored micro-interactions and transitions

### Development Tools
- **Font Awesome 5**: Icon library for UI elements
- **Google Fonts**: Poppins font family integration
- **JSON Data**: Dynamic content loading from JSON files

### Performance & Optimization
- **Lazy Loading**: Images load as needed
- **Reduced Motion**: Respects user's motion preferences
- **Smooth Scrolling**: Hardware-accelerated scrolling
- **Minified Assets**: Optimized production builds

## 📁 Project Structure

```
Portfolio-Website/
├── index.html                 # Main landing page
├── projects/
│   ├── index.html            # Projects showcase page
│   ├── style.css            # Projects-specific styles
│   ├── script.js            # Projects functionality
│   └── projects.json        # Projects data
├── assets/
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   └── script.js       # Main JavaScript
│   ├── images/
│   │   ├── hero2.jpg       # Hero image
│   │   ├── educat/         # Education logos
│   │   ├── experience/     # Company logos
│   │   ├── projects/       # Project screenshots
│   │   └── skills/         # Skill icons
│   └── videos/             # Background videos
└── README.md               # This file
```

## 🎨 Design System

### Color Scheme
- **Primary**: Purple (#7C5CFF) and Cyan (#00D4FF) gradients
- **Dark Mode**: Dark blue background (#070A12) with white text
- **Light Mode**: Light gray background (#f8f9fa) with dark text
- **Accent**: Warning orange (#FFB020) for highlights

### Typography
- **Font Family**: Poppins (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Responsive**: Scales appropriately across device sizes

### Layout Components
- **Container**: Max-width 1120px with responsive padding
- **Grid System**: Custom grid layouts for various content types
- **Card Components**: Consistent card design throughout
- **Button Styles**: Multiple button variants (primary, ghost, small)

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (recommended for development)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/KelvinErlangga/portfolio-website.git
   ```

2. Navigate to the project directory:
   ```bash
   cd portfolio-website
   ```

3. Start a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using Live Server (VS Code extension)
   # Right-click index.html and "Open with Live Server"
   ```

4. Open your browser and navigate to `http://localhost:8000`

## 📱 Browser Support

- **Chrome/Chromium**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+

## ⚡ Performance Features

- **Smooth Animations**: 60fps animations with GSAP
- **Optimized Images**: Lazy loading and proper sizing
- **Reduced Motion**: Respects user accessibility preferences
- **Efficient Scrolling**: Hardware-accelerated smooth scrolling
- **Theme Persistence**: LocalStorage for theme preferences

## 🔧 Customization

### Theme Customization
Edit CSS custom properties in `assets/css/style.css`:
```css
:root {
  --accent: #7C5CFF;
  --accent2: #00D4FF;
  --bg: #070A12;
  /* ... other variables */
}
```

### Adding Projects
Update `projects/projects.json` with new project data following the existing structure.

### Adding Skills
Update the skills data in `assets/js/script.js` or create a separate JSON file.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Kelvin Erlangga**
- Portfolio: https://kelvin-erlangga.com
- GitHub: https://github.com/KelvinErlangga
- LinkedIn: https://linkedin.com/in/kelvin-erlangga

---

⭐ If you like this project, please give it a star on GitHub!
