# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Human Design Chart Generator

A free, open-source Human Design chart generator that runs entirely in your browser. No server required, no data stored externally, and completely free to use.

## Live Demo

Visit: `https://hristohstefanov-purpose.github.io/human-design-app`

## Features

- **Complete Human Design Chart Calculation**
  - Personality (Conscious) and Design (Unconscious) calculations
  - All 64 gates and 36 channels
  - 9 energy centers with proper definition
  - Type, Strategy, Authority, and Profile determination
  - Incarnation Cross calculation

- **Interactive Bodygraph Visualization**
  - SVG-based chart rendering
  - Color-coded centers and channels
  - Interactive tooltips
  - Gate activations display

- **Chart Management**
  - Save charts locally in browser
  - Share charts via URL
  - Export charts as JSON or PNG
  - Print-friendly layout

- **Privacy-First Design**
  - All calculations done in browser
  - No data sent to servers
  - Charts stored locally only
  - Shareable links contain compressed data

## Technologies Used

- **Astronomy Engine**: High-precision astronomical calculations
- **D3.js**: SVG chart visualization
- **Luxon**: Timezone handling
- **LZ-String**: URL compression for sharing
- **GitHub Pages**: Free hosting

## How It Works

1. Enter birth date, time, and location
2. App calculates planetary positions at birth
3. Converts positions to Human Design gates
4. Determines channels, centers, and type
5. Renders interactive bodygraph
6. Saves chart locally for future reference

## Installation (Local Development)

```bash
# Clone the repository
git clone https://github.com/hristohstefanov-purpose/human-design-app.git

# Navigate to directory
cd human-design-app

# Open in browser
open index.html
# or
python -m http.server 8000
# then visit http://localhost:8000
```

## Customization

You can customize the app by modifying:

- `css/styles.css` - Visual styling
- `js/renderer.js` - Chart visualization
- `js/calculator.js` - Calculation logic
- `js/app.js` - Application behavior

## Accuracy Notes

- Planetary calculations accurate to within 1 arcminute
- Gate calculations based on tropical zodiac
- Design time calculated as 88 solar degrees before birth
- Timezone estimation simplified for demo (consider integrating timezone API for production)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers supported

## Contributing

Contributions welcome! Please submit pull requests for any enhancements.

## License

MIT License - Free to use and modify

## Acknowledgments

- Human Design System created by Ra Uru Hu
- Astronomy calculations by Astronomy Engine
- Visualization powered by D3.js

## Disclaimer

This tool is for educational and entertainment purposes. For professional Human Design readings, consult a certified analyst.

## Future Enhancements

- [ ] Variable calculations
- [ ] Composite/relationship charts
- [ ] Transit calculations
- [ ] More detailed gate descriptions
- [ ] Multiple language support
- [ ] PWA offline support
- [ ] Advanced timezone API integration

## Support

Create an issue on GitHub for bug reports or feature requests.

---

Made with ❤️ for the Human Design community
