import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import './App.css'

function App() {
  const [targetNumber, setTargetNumber] = useState(() => Math.floor(Math.random() * 100) + 1)
  const [attempts, setAttempts] = useState(0)
  const [guessInput, setGuessInput] = useState('')
  const [hint, setHint] = useState({ message: 'Waiting for your first guess...', style: 'hint-start' })
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('highScore')
    return saved ? parseInt(saved, 10) : null
  })

  // Reference to the audio element
  const audioRef = useRef(null)
  
  // Auto-focus input reference
  const inputRef = useRef(null)

  // Keep focus on the input unless game is over
  useEffect(() => {
    if (!gameOver && inputRef.current) {
        inputRef.current.focus()
    }
  }, [attempts, gameOver])

  const saveHighScore = (score) => {
    localStorage.setItem('highScore', score.toString())
    setHighScore(score)
  }

  const restartGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1)
    setAttempts(0)
    setGameOver(false)
    setGuessInput('')
    setHint({ message: "I'm thinking of a number from 1 to 100...", style: 'hint-start' })
  }

  const handleGuessSubmit = (e) => {
    e.preventDefault()
    
    // Convert to number safely
    const guess = parseInt(guessInput, 10)

    if (gameOver) return

    if (isNaN(guess) || guess < 1 || guess > 100) {
      setHint({ message: '⚠️ Please enter a valid guess (1-100).', style: 'hint-error' })
      setGuessInput('') // Auto-clear
      return
    }

    const currentAttempt = attempts + 1
    setAttempts(currentAttempt)
    
    // Clear the input instantly
    setGuessInput('')

    const diff = Math.abs(guess - targetNumber)
    
    // --- HIGHER OR LOWER HINT FEATURE ---
    const dir = guess < targetNumber ? "Higher" : "Lower"

    // Dynamic Hint Colors & Win Condition
    if (diff === 0) {
      setHint({ message: `🎉 YOU GOT IT! ${guess} is correct! 🎉`, style: 'hint-win' })
      setGameOver(true)
      
      // Fire Confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)
        
        const particleCount = 50 * (timeLeft / duration)
        // since particles fall down, start a bit higher than random
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }))
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }))
      }, 250)

      // Play Sound
      if (audioRef.current) {
          audioRef.current.volume = 0.5
          audioRef.current.play().catch(e => console.log("Audio play prevented:", e))
      }

      // Check Highscore
      if (highScore === null || currentAttempt < highScore) {
        saveHighScore(currentAttempt)
      }
      
    } else if (diff <= 5) {
      setHint({ message: `${guess} is pretty close! Go ${dir}.`, style: 'hint-red' })
    } else if (diff <= 10) {
      setHint({ message: `${guess} is close. Go ${dir}.`, style: 'hint-orange' })
    } else if (diff <= 20) {
      setHint({ message: `${guess} is not that close. Go ${dir}.`, style: 'hint-yellow' })
    } else {
      setHint({ message: `${guess} is way off! Go ${dir}.`, style: 'hint-blue' })
    }
  }

  return (
    <div className="game-container">
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=tada-fanfare-a-6313.mp3" preload="auto"></audio>

      <h1>🔥 Hot & Cold Number Guesser ❄️</h1>
      
      <div className="metrics-row">
        <div className="metric">
          <h3>🏆 High Score: {highScore !== null ? highScore : 'None'}</h3>
        </div>
        <div className="metric">
          <h3>🎯 Attempts: {attempts}</h3>
        </div>
      </div>

      <form className="guess-form" onSubmit={handleGuessSubmit}>
          <div className="input-group">
            <label htmlFor="guessInput">Enter your guess (1-100):</label>
            <div className="input-row">
                <input 
                  type="number" 
                  id="guessInput"
                  ref={inputRef}
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  min="1" 
                  max="100" 
                  disabled={gameOver}
                  autoComplete="off"
                />
                <button type="submit" className="btn-guess" disabled={gameOver || guessInput === ''}>
                  Guess
                </button>
            </div>
          </div>
      </form>

      <div className={`hint-box ${hint.style}`}>
        {hint.message}
      </div>

      <div className="divider"></div>

      <button className="btn-restart" onClick={restartGame}>Start New Game</button>
      
    </div>
  )
}

export default App
