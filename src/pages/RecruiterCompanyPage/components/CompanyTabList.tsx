import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { Lock } from 'lucide-react'
import { getCompanyPanelId, getCompanyTabId } from '../companyTabs'
import type { CompanyTabId } from '../types'

export type CompanyTabItem = {
  id: CompanyTabId
  isPlanLocked: boolean
  label: string
}

type CompanyTabListProps = {
  activeId: CompanyTabId
  label: string
  lockedLabel: string
  onSelect: (id: CompanyTabId) => void
  tabs: ReadonlyArray<CompanyTabItem>
}

export function CompanyTabList({ activeId, label, lockedLabel, onSelect, tabs }: CompanyTabListProps) {
  const tabRefs = useRef(new Map<CompanyTabId, HTMLButtonElement>())

  function focusTab(index: number) {
    const tab = tabs[(index + tabs.length) % tabs.length]
    if (!tab) return

    onSelect(tab.id)
    tabRefs.current.get(tab.id)?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keyActions: Record<string, () => void> = {
      ArrowLeft: () => focusTab(index - 1),
      ArrowRight: () => focusTab(index + 1),
      End: () => focusTab(tabs.length - 1),
      Home: () => focusTab(0),
    }
    const action = keyActions[event.key]
    if (!action) return

    event.preventDefault()
    action()
  }

  return (
    <div aria-label={label} className="recruiter-company-tabs" role="tablist">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId

        return (
          <button
            aria-controls={isActive ? getCompanyPanelId(tab.id) : undefined}
            aria-selected={isActive}
            className={`recruiter-company-tab ${isActive ? 'is-active' : ''}`.trim()}
            id={getCompanyTabId(tab.id)}
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(node) => {
              if (node) tabRefs.current.set(tab.id, node)
              else tabRefs.current.delete(tab.id)
            }}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            <span>{tab.label}</span>
            {tab.isPlanLocked ? (
              <span className="recruiter-company-tab__lock">
                <Lock aria-hidden="true" focusable="false" />
                <span className="sr-only">{lockedLabel}</span>
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
