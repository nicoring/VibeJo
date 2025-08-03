# VibeJo

A fast-paced card game built with React and TypeScript. VibeJo is a digital implementation of the popular card game where players compete to achieve the lowest score by strategically revealing, swapping, and discarding cards.

## 🎯 How to Play

VibeJo is played with 150 cards numbered from -2 to 12. Each player starts with 12 face-down cards arranged in a 3×4 grid.

### Game Flow

1. **Setup**: Each player reveals 2 cards to start
2. **Turns**: On your turn, either:
   - Draw from the deck and choose to take or reject the card
   - Take the open card from the discard pile
3. **Actions**: When taking a card, swap it with one of your cards
4. **Scoring**: Revealed cards count toward your score, hidden cards don't
5. **Round End**: When a player reveals all their cards, the round ends
6. **Winning**: Lowest total score after multiple rounds wins!

### Special Rules

- **Three of a Kind**: When you have 3 cards of the same value in a column, they're automatically removed (score 0)
- **Card Values**: Cards range from -2 (best) to 12 (worst), with 15 zeros in the deck
- **Game End**: First player to reach 100+ points loses, others continue

## 🚀 Features

- **Single Player vs Bots**: Play against 2 AI opponents with realistic decision-making
- **Multiple Rounds**: Accumulative scoring across rounds until someone reaches 100 points
- **Smart Game Logic**: Automatic three-of-a-kind removal, proper turn management
- **Responsive Design**: Clean, modern interface that works on desktop and mobile
- **Real-time Updates**: Smooth gameplay with instant feedback

## 🛠️ Tech Stack

- ⚡️ **Vite** - Lightning fast build tool
- ⚛️ **React 19** - Latest React with modern features  
- 📝 **TypeScript** - Full type safety and better developer experience
- 🎨 **Modern CSS** - Clean, responsive design with CSS Grid and Flexbox
- 🔧 **ESLint** - Code quality and consistency

## 🏁 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vibejo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Card.tsx        # Individual card component
│   ├── Game.tsx        # Main game logic and state
│   ├── GameBoard.tsx   # Deck and discard pile
│   ├── GameControls.tsx # Turn instructions and controls
│   └── PlayerBoard.tsx # Player's card grid
├── types/
│   └── game.ts         # TypeScript type definitions
├── utils/
│   ├── gameLogic.ts    # Core game rules and state management
│   └── botLogic.ts     # AI player decision making
├── App.tsx             # Main application component
├── App.css             # Application styles
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## 🎮 Game Components

- **Game State Management**: Redux-style reducer pattern for predictable state updates
- **Bot AI**: Smart bot players that make realistic decisions based on game state
- **Card Logic**: Comprehensive card distribution matching traditional rules
- **Score Tracking**: Automatic score calculation with round-by-round accumulation
- **Visual Feedback**: Clear indicators for current player, available actions, and game state

## 🔄 Development

This project uses a modern development environment with:

- **Hot Module Replacement (HMR)** - Instant updates during development
- **TypeScript** - Full type safety across the entire codebase
- **ESLint** - Consistent code quality enforcement
- **Component Architecture** - Modular, reusable React components
- **State Management** - Predictable game state with comprehensive action handling

## 🎯 Gameplay Tips

- **Early Game**: Focus on revealing low-value cards and remember what you've seen
- **Mid Game**: Look for opportunities to create three-of-a-kind columns
- **End Game**: Consider ending the round when you have a low score
- **Strategy**: Balance between taking known low cards vs. gambling on deck draws

---

Enjoy playing VibeJo! 🎲✨