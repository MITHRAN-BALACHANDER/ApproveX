# React Vite Template

A modern React application template with Vite, React Router, Tailwind CSS, and Prettier.

## Features

- ⚡ **Vite** - Lightning fast build tool and dev server
- ⚛️ **React 18** - Latest React with modern hooks
- 🧭 **React Router** - Client-side routing
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- ✨ **Prettier** - Code formatting
- 📦 **ESLint** - Code linting and formatting
- 🔧 **PostCSS** - CSS processing with autoprefixer

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:5173) to view it in the browser.

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Code Formatting and Linting

Format your code with Prettier:

```bash
npm run format
```

Check code formatting:

```bash
npm run format:check
```

Lint your code:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

## Project Structure

```
src/
├── components/     # Reusable components
│   └── Navbar.jsx
├── pages/          # Page components
│   ├── Home.jsx
│   ├── About.jsx
│   └── Contact.jsx
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Customization

### Code Style

This template uses Prettier for code formatting. You can customize the formatting rules by editing `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Update the navigation in `src/components/Navbar.jsx`

### Styling

This template uses Tailwind CSS. You can customize the design system by editing `tailwind.config.js`.

## License

MIT
