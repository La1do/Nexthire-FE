import { useContext, useEffect } from 'react'
import { UNSAFE_NavigationContext } from 'react-router-dom'

// Register before BrowserRouter's first render/listener. Window POP listeners
// run in registration order; adding one only when dirty is too late to block
// the router. The listener is inert unless this editor has an active guard.
let activePopGuard: ((event: PopStateEvent) => void) | null = null
if (typeof window !== 'undefined') window.addEventListener('popstate', event => activePopGuard?.(event), true)

// BrowserRouter (not a data router) cannot use useBlocker. Keep this guard
// scoped to this mounted editor. Wrap its navigator for Links/useNavigate and
// intercept POP in capture phase before BrowserRouter sees a cancelled move.
export function usePlanNavigationGuard(enabled: boolean, message: string) {
  const context = useContext(UNSAFE_NavigationContext)
  useEffect(() => {
    if (!enabled) return
    const navigator = context?.navigator
    const push = navigator?.push
    const replace = navigator?.replace
    const shouldLeave = () => window.confirm(message)
    const current = () => window.location.pathname + window.location.search
    function targetPath(to: Parameters<NonNullable<typeof push>>[0]) {
      return typeof to === 'string' ? new URL(to, window.location.href).pathname + new URL(to, window.location.href).search
        : (to.pathname ?? window.location.pathname) + (to.search ?? '')
    }
    const guardedPush: NonNullable<typeof push> = (to, state, options) => {
      if (targetPath(to) === current() || shouldLeave()) push!.call(navigator, to, state, options)
    }
    const guardedReplace: NonNullable<typeof replace> = (to, state, options) => {
      if (targetPath(to) === current() || shouldLeave()) replace!.call(navigator, to, state, options)
    }
    if (navigator) { navigator.push = guardedPush; navigator.replace = guardedReplace }
    let index = window.history.state?.idx as number | undefined
    let restoring = false
    const pop = (event: PopStateEvent) => {
      if (restoring) { restoring = false; event.stopImmediatePropagation(); return }
      const next = event.state?.idx as number | undefined
      if (shouldLeave()) { index = next; return }
      if (typeof index === 'number' && typeof next === 'number' && next !== index) {
        event.stopImmediatePropagation(); restoring = true; window.history.go(index - next)
      }
    }
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    activePopGuard = pop
    window.addEventListener('beforeunload', unload)
    return () => {
      if (navigator?.push === guardedPush) navigator.push = push!
      if (navigator?.replace === guardedReplace) navigator.replace = replace!
      if (activePopGuard === pop) activePopGuard = null
      window.removeEventListener('beforeunload', unload)
    }
  }, [enabled, message, context?.navigator])
}