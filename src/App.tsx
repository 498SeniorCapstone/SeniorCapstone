import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Stats from './User_Stats/Stats'
import Calendar from './Calendar/Calendar'
import './App.css'
import './questionarre/styles.css'
import './signin/styles.css'
import Discover from './Discover/Discover'
import Shopping_List from './Shopping_List/Shopping_List'
import My_Recipes from './User_Recipes/My_Receips'
import User_Info from './User_Info/User_Info'
import Notifications from './Notifications/Notifications'
import Settings from './Settings/Settings'
import Search_Engine from './Search_Engine'
import { AccountUpgrade, DemoSignin, finishAnonymousAccountUpgrade, getCurrentAuthUser, restoreDemoProfile, selectDemoProfile, signInWithPassword, signOutDemo, signUpWithPassword, syncOwnedProfileIdentity, upgradeAnonymousAccount } from './signin'
import type { DemoProfile } from './signin'
import type { AccountUpgradeResult, AuthFlowResult, SignInValues, SignUpValues } from './signin'
import { Questionnaire, clearDraft, submitDemoPreferences } from './questionarre'
import type { MealPreferences } from './questionarre'
import { supabase, supabaseConfigurationError } from './lib/supabase'

function demoDraftScope(profileId: number) { return `demo-profile:${profileId}` }

type RestoreState = 'loading' | 'ready' | 'error'

function App() {
  const [demoProfile, setDemoProfile] = useState<DemoProfile | null>(null)
  const [isQuestionnaireComplete, setIsQuestionnaireComplete] = useState(false)
  const [completedAnswers, setCompletedAnswers] = useState<MealPreferences | null>(null)
  const [restoreState, setRestoreState] = useState<RestoreState>('loading')
  const [restoreError, setRestoreError] = useState('')
  const restoreRequest = useRef(0)
  const activeAuthUserId = useRef<string | null>(null)

  const applyProfile = useCallback((profile: DemoProfile | null) => {
    setDemoProfile(profile)
    activeAuthUserId.current = profile?.auth_user_id ?? null
    setIsQuestionnaireComplete(profile?.questionnare_completed === true)
    setCompletedAnswers(null)
    setRestoreError('')
    setRestoreState('ready')
  }, [])

  const restore = useCallback(async () => {
    const requestId = ++restoreRequest.current
    setRestoreState('loading')
    setRestoreError('')
    try {
      const profile = await restoreDemoProfile()
      if (requestId !== restoreRequest.current) return
      applyProfile(profile)
    } catch (error) {
      if (requestId !== restoreRequest.current) return
      setDemoProfile(null)
      activeAuthUserId.current = null
      setIsQuestionnaireComplete(false)
      setCompletedAnswers(null)
      setRestoreError(error instanceof Error ? error.message : supabaseConfigurationError)
      setRestoreState('error')
    }
  }, [applyProfile])

  useEffect(() => {
    queueMicrotask(() => void restore())
  }, [restore])

  useEffect(() => {
    if (!supabase) return
    const { data: authSubscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        restoreRequest.current += 1
        activeAuthUserId.current = null
        setDemoProfile(null)
        setCompletedAnswers(null)
        setIsQuestionnaireComplete(false)
        setRestoreError('')
        setRestoreState('ready')
      } else if (activeAuthUserId.current && session.user.id !== activeAuthUserId.current) {
        void restore()
      }
    })
    return () => authSubscription.subscription.unsubscribe()
  }, [restore])

  const beginDemo = async (displayName: string) => {
    const profile = await selectDemoProfile(displayName)
    restoreRequest.current += 1
    applyProfile(profile)
  }

  const completeAuthenticatedProfile = async (displayName: string): Promise<AuthFlowResult> => {
    const profile = await selectDemoProfile(displayName)
    await syncOwnedProfileIdentity()
    restoreRequest.current += 1
    applyProfile(profile)
    return 'ready'
  }

  const handleSignIn = async (values: SignInValues): Promise<AuthFlowResult> => {
    const user = await signInWithPassword(values)
    const profile = await restoreDemoProfile()
    if (profile) {
      await syncOwnedProfileIdentity()
      restoreRequest.current += 1
      applyProfile(profile)
      return 'ready'
    }
    const metadataName = typeof user.user_metadata?.username === 'string' ? user.user_metadata.username : ''
    if (metadataName) return completeAuthenticatedProfile(metadataName)
    return 'profile-setup'
  }

  const handleSignUp = async (values: SignUpValues): Promise<AuthFlowResult> => {
    const currentUser = await getCurrentAuthUser()
    if (currentUser?.is_anonymous) {
      const upgradeResult = await upgradeAnonymousAccount(values.email, values.password)
      if (upgradeResult === 'confirmation-required') return 'confirmation-required'
      return completeAuthenticatedProfile(values.username)
    }
    if (currentUser) return completeAuthenticatedProfile(values.username)

    const response = await signUpWithPassword(values)
    if (!response.session) return 'confirmation-required'
    return completeAuthenticatedProfile(values.username)
  }

  const requestAccountUpgrade = async (email: string, password: string): Promise<AccountUpgradeResult> => {
    const result = await upgradeAnonymousAccount(email, password)
    if (result === 'complete') {
      const profile = await restoreDemoProfile()
      if (profile) {
        await syncOwnedProfileIdentity()
        restoreRequest.current += 1
        applyProfile(profile)
      }
    }
    return result
  }

  const finishAccountUpgrade = async (password: string) => {
    await finishAnonymousAccountUpgrade(password)
    await syncOwnedProfileIdentity()
    const profile = await restoreDemoProfile()
    if (profile) {
      restoreRequest.current += 1
      applyProfile(profile)
    }
  }

  const completeDemoQuestionnaire = async (answers: MealPreferences) => {
    if (!demoProfile) throw new Error('No demo profile is selected.')
    await submitDemoPreferences(demoProfile.id, answers)
    setCompletedAnswers(answers)
    setIsQuestionnaireComplete(true)
  }

  const resetDemo = async () => {
    restoreRequest.current += 1
    activeAuthUserId.current = null
    if (demoProfile) clearDraft(demoDraftScope(demoProfile.id))
    try {
      await signOutDemo()
    } finally {
      setDemoProfile(null)
      setCompletedAnswers(null)
      setIsQuestionnaireComplete(false)
      setRestoreError('')
      setRestoreState('ready')
    }
  }

  if (restoreState === 'loading') return <StatusScreen title="Restoring your demo profile…" />
  if (restoreState === 'error') {
    return <StatusScreen title="We could not restore your demo profile." detail={restoreError} action={<button type="button" onClick={() => void restore()}>Retry</button>} />
  }
  if (!demoProfile) return <DemoSignin onContinue={beginDemo} onSignIn={handleSignIn} onSignUp={handleSignUp} />
  if (!isQuestionnaireComplete) {
    return <><AccountUpgradePanel profile={demoProfile} onRequest={requestAccountUpgrade} onFinish={finishAccountUpgrade} /><Questionnaire key={demoProfile.id} draftScope={demoDraftScope(demoProfile.id)} onComplete={completeDemoQuestionnaire} /></>
  }

  return (
    <div className="main-app-root">
      <AccountUpgradePanel profile={demoProfile} onRequest={requestAccountUpgrade} onFinish={finishAccountUpgrade} />
      <Routes>
        <Route path="/" element={<Dashboard onResetDemo={() => void resetDemo()} />} />
        <Route path="/Dashboard" element={<Dashboard onResetDemo={() => void resetDemo()} />} />
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

function AccountUpgradePanel({ profile, onRequest, onFinish }: { profile: DemoProfile; onRequest: (email: string, password: string) => Promise<AccountUpgradeResult>; onFinish: (password: string) => Promise<void> }) {
  if (!profile.is_anonymous && !profile.upgrade_pending) return null
  return <AccountUpgrade onRequest={onRequest} onFinish={onFinish} />
}

function StatusScreen({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return <main className="status-screen"><h1>{title}</h1>{detail && <p>{detail}</p>}{action}</main>
}

function Dashboard({ onResetDemo }: { onResetDemo: () => void }) {
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
            <button type="button" onClick={onResetDemo}>Reset demo</button>
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
