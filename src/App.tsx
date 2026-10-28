import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { ReactNode } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Stats from './User_Stats/Stats'
import Calendar from './Calendar/Calendar'
import './App.css'
import './questionarre/styles.css'
import Discover from './Discover/Discover'
import Shopping_List from './Shopping_List/Shopping_List'
import My_Recipes from './User_Recipes/My_Receips'
import User_Info from './User_Info/User_Info'
import Notifications from './Notifications/Notifications'
import Settings from './Settings/Settings'
import Search_Engine from './Search_Engine'
import { Questionnaire, getQuestionnaireStatus, submitPreferences } from './questionarre'
import type { MealPreferences } from './questionarre'
import { supabase, supabaseConfigurationError } from './lib/supabase'

type CompletionState = 'loading' | 'ready' | 'error'

function App() {
  const [completionState, setCompletionState] = useState<CompletionState>('loading')
  const [completionError, setCompletionError] = useState('')
  const [isQuestionnaireComplete, setIsQuestionnaireComplete] = useState(false)
  const [completedAnswers, setCompletedAnswers] = useState<MealPreferences | null>(null)
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true

    const loadCurrentUserStatus = async (user: User) => {
      if (!supabase) throw new Error(supabaseConfigurationError)
      const status = await getQuestionnaireStatus()
      if (!active) return
      setAuthenticatedUser(user)
      setCompletedAnswers(null)
      setIsQuestionnaireComplete(status.isComplete)
      setCompletionState('ready')
      setCompletionError('')
    }

    const load = async () => {
      setCompletionState('loading')
      setCompletionError('')
      setIsQuestionnaireComplete(false)
      setCompletedAnswers(null)
      try {
        if (!supabase) throw new Error(supabaseConfigurationError)
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        if (!data.user) throw new Error('No authenticated user is available. Sign in and retry.')
        if (active) setAuthenticatedUser(data.user)
        await loadCurrentUserStatus(data.user)
      } catch (error) {
        if (!active) return
        setAuthenticatedUser(null)
        setCompletionState('error')
        setCompletionError(error instanceof Error ? error.message : 'Could not load questionnaire status.')
      }
    }

    void load()
    if (!supabase) return () => { active = false }

    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (!session?.user || event === 'SIGNED_OUT') {
        setAuthenticatedUser(null)
        setCompletedAnswers(null)
        setIsQuestionnaireComplete(false)
        setCompletionState('error')
        setCompletionError('No authenticated user is available. Sign in and retry.')
        return
      }
      void load()
    })

    return () => {
      active = false
      authSubscription.subscription.unsubscribe()
    }
  }, [retry])

  const completeQuestionnaire = async (answers: MealPreferences) => {
    await submitPreferences(answers)
    setCompletedAnswers(answers)
    setIsQuestionnaireComplete(true)
  }

  if (completionState === 'loading') return <StatusScreen title="Loading your account…" />
  if (completionState === 'error') {
    return <StatusScreen title="We could not load your questionnaire status." detail={completionError} action={<button type="button" onClick={() => setRetry((value) => value + 1)}>Retry</button>} />
  }
  if (!authenticatedUser) return <StatusScreen title="Sign in is required." detail="Sign in and retry to continue." />
  if (!isQuestionnaireComplete) {
    return <Questionnaire key={authenticatedUser.id} draftScope={authenticatedUser.id} onComplete={completeQuestionnaire} />
  }

  return (
    <div className="main-app-root">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/User-Profile" element={<User_Info answers={completedAnswers} />} />
        <Route path="/Notifications" element={<Notifications />} />
        <Route path="/Settings" element={<Settings />} />
        <Route path="/Stats" element={<Stats />} />
        <Route path="/Calendar" element={<Calendar />} />
        <Route path="/Discover" element={<Discover />} />
        <Route path="/Shopping-List" element={<Shopping_List />} />
        <Route path="/My-Recipes" element={<My_Recipes />} />
        <Route path="/Search" element={<Search_Engine />} />
      </Routes>
    </div>
  )
}

function StatusScreen({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <main className="status-screen"><h1>{title}</h1>{detail && <p>{detail}</p>}{action}</main>
}

function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>(() => localStorage.getItem('activeTab') || 'stats')

  useEffect(() => { localStorage.setItem('activeTab', activeTab) }, [activeTab])

  return (
    <div className="Dashboard">
      <div className="site-header-container">
        <header className="site-header">
          <a className="site-name">Website Name</a>
          <div className="header-actions">
            <button aria-label="Notifications" onClick={() => navigate('/Notifications')}>Notifications</button>
            <button aria-label="Settings" onClick={() => navigate('/Settings')}>Settings</button>
            <button aria-label="Profile" onClick={() => navigate('/User-Profile')}>Profile</button>
          </div>
          <div className="recipe-search-container">
            <form className="recipe-search" role="search">
              <label htmlFor="recipe-query">Search Recipes</label>
              <input id="recipe-query" name="search" type="search" />
              <button type="submit">Search</button>
            </form>
          </div>
        </header>
        <nav className="site-nav" aria-label="Main navigation">
          <button aria-label="stats" onClick={() => setActiveTab('stats')}>Stats</button>
          <button aria-label="calendar" onClick={() => setActiveTab('calendar')}>Calendar</button>
          <button aria-label="discover" onClick={() => setActiveTab('discover')}>Discover</button>
          <button aria-label="my-recipes" onClick={() => setActiveTab('my-recipes')}>My Recipes</button>
          <button aria-label="shopping-list" onClick={() => setActiveTab('shopping-list')}>Shopping List</button>
        </nav>
      </div>
      <main>
        {activeTab === 'stats' && <Stats />}
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'discover' && <Discover />}
        {activeTab === 'my-recipes' && <My_Recipes />}
        {activeTab === 'shopping-list' && <Shopping_List />}
        <div className="widget-grid" id="widget-grid">
          <section id="stats" className="widget"><h2>User Stats</h2></section>
          <section id="calendar" className="widget"><h2>Calendar</h2></section>
          <section id="my-recipes" className="widget"><h2>My Recipes</h2></section>
          <section id="learn" className="widget"><h2>Learn</h2></section>
          <section id="discover" className="widget discover-panel"><h2>Discover</h2></section>
        </div>
      </main>
    </div>
  )
}

export default App
