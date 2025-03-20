import { useState } from 'react'
import { TodoList, Calculator } from './pages/index'
import './App.css'

type Page = string

function App() {
  const [activePage, setActivePage] = useState<Page>('todos')

  return (
    <div className="app">
      <nav className="nav-menu">
        <button
          className={activePage === 'todos' ? 'active' : ''}
          onClick={() => setActivePage('todos')}
        >
          Todo List
        </button>
        <button
          className={activePage === 'calculator' ? 'active' : ''}
          onClick={() => setActivePage('calculator')}
        >
          Calculator
        </button>
      </nav>

      <main className="main-content">
        {activePage === 'todos' ? <TodoList /> : <Calculator />}
      </main>
    </div>
  )
}

export default App
