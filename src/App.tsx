import { useState } from 'react'
import Game from './components/Game'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [gameStarted, setGameStarted] = useState(false)

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      setGameStarted(true)
    }
  }

  const handleBackToMenu = () => {
    setGameStarted(false)
  }

  if (gameStarted) {
    return <Game username={username} onBackToMenu={handleBackToMenu} />
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Card Game</h1>
        <p>Enter your username to start playing!</p>
      </header>
      
      <main className="app-main">
        <div className="game-container">
          <form onSubmit={handleStartGame} className="username-form">
            <div className="input-group">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                minLength={2}
                maxLength={20}
                className="username-input"
              />
            </div>
            <button 
              type="submit" 
              className="start-button"
              disabled={!username.trim()}
            >
              Start Game
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default App
