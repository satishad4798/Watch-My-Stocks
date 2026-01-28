# Contributing to Stock Watchlist

Thank you for your interest in contributing! Here's how you can help.

## 🐛 Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, open a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

## 💡 Feature Requests

Open an issue with the tag `enhancement` and describe:
- What feature you'd like
- Why it would be useful
- Any implementation ideas

## 🔧 Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/stock-watchlist.git
cd stock-watchlist

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📝 Making Changes

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages: `git commit -m "Add amazing feature"`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 🎨 Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow existing patterns in the codebase
- Keep components small and focused

## 📁 Project Structure

- `server/` - Backend Express.js API
- `src/components/` - React components
- `src/index.css` - All styles (design tokens at top)

## 🧪 Testing

Before submitting:
1. Ensure the app starts without errors
2. Test adding/removing stocks
3. Verify notes save correctly
4. Check mobile responsiveness

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
