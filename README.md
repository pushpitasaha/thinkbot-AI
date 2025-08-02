# ThinkBot AI - R Support Assistant

A modern, interactive chatbot interface designed specifically for R programming support and education. Built with vanilla JavaScript, HTML5, and CSS3, featuring beautiful animations and a student-friendly design.

![ThinkBot AI Interface](https://img.shields.io/badge/Status-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

## 🚀 Live Demo

Visit the live application: [ThinkBot AI Demo](https://pushpitasaha.github.io/thinkbot-AI/)

## ✨ Features

### 🗨️ **Interactive Chat Interface**
- Real-time messaging with AI responses
- Code block syntax highlighting with copy functionality
- Support for file attachments (images, documents)
- Audio recording and playback capabilities
- Minimal, ChatGPT-style interface design

### 📚 **R Support Academy**
- 4 comprehensive video modules covering:
  - Bibliometric Analysis and RStudio (17 min 41s)
  - Data Collection and Preparation (18 min 52s)
  - Bibliometric Analysis and Techniques (19 min 1s)
  - Data Visualization and Interpretation (28 min 57s)
- Direct links to ThinkNeuro YouTube channel
- Animated SplitText effects for enhanced UX

### 🎯 **Student-Friendly Features**
- Welcome screen with animated suggestion cards
- GSAP-powered particle effects and 3D animations
- Quick access to frequently asked questions
- Search functionality across chat history
- Responsive design for all devices

### 📱 **Modern UI/UX**
- Apple-inspired design principles
- Gilroy font for premium typography
- Smooth animations and transitions
- Glass-morphism effects
- Dark sidebar with vibrant accents

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Animations**: GSAP (GreenSock Animation Platform)
- **Icons**: Font Awesome 6.4.0
- **Typography**: Gilroy Font
- **Design**: Custom CSS with CSS Variables
- **Storage**: LocalStorage for chat history

## 📁 Project Structure

```
thinkbot-AI/
├── index.html              # Main HTML file
├── styles.css              # Complete CSS styling
├── script.js               # JavaScript functionality
├── think-neuro-logo.png    # Brand logo
├── Design.json             # Design system specifications
├── README.md               # Project documentation
└── .gitignore              # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/thinkbot-AI.git
   cd thinkbot-AI
   ```

2. **Open the application**
   ```bash
   # Using Python (if installed)
   python -m http.server 8000
   
   # Using Node.js (if installed)
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **Access the application**
   - Navigate to `http://localhost:8000` (if using server)
   - Or open `index.html` directly in your browser

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#3B82F6` (Accent color)
- **Background**: `#F8FAFC` (Light, clean)
- **Sidebar**: `#1E293B` (Dark, professional)
- **Text**: `#1E293B` (Primary), `#64748B` (Secondary)

### Typography
- **Font Family**: Gilroy (with system fallbacks)
- **Font Weights**: 400 (Normal), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Responsive sizing** with CSS custom properties

### Animations
- **GSAP-powered** particle effects
- **3D tilt and magnetism** on interactive elements
- **SplitText animations** for text reveals
- **Smooth transitions** with cubic-bezier easing

## 🔧 Customization

### Adding New Modules
1. Update the modules array in `script.js`
2. Add corresponding HTML in `index.html`
3. Update CSS styling in `styles.css`

### Modifying Colors
Edit CSS custom properties in `:root` selector in `styles.css`:
```css
:root {
    --accent: #3B82F6;
    --background: #F8FAFC;
    /* ... other variables */
}
```

### Adding New Features
The modular JavaScript architecture makes it easy to extend:
- Add new tab functionality in `switchTab()`
- Implement new message types in `createMessageElement()`
- Extend animation system in `initializeWelcomeAnimations()`

## 📱 Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ Internet Explorer (Not supported)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ThinkNeuro** for the R programming content and branding
- **GSAP** for the powerful animation library
- **Font Awesome** for the comprehensive icon set
- **Gilroy Font** for the beautiful typography

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/thinkbot-AI/issues)
- **Email**: your-email@example.com
- **Documentation**: [Wiki](https://github.com/your-username/thinkbot-AI/wiki)

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - Interactive chat interface
  - R Support Academy modules
  - GSAP animations
  - Responsive design

---

**Built with ❤️ for the R programming community** 
