import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { ProfileTranslations } from '../../../i18n/types'
import type { CandidateProfile } from '../types'
import {
  getCvParseReviewItems,
  summarizeCvParseGroup,
  type CvParseReviewGroupId,
} from '../utils/cvParseReview'

type CvParseReviewDialogProps = {
  baselineProfile: CandidateProfile
  content: ProfileTranslations['cvParseReview']
  isApplying: boolean
  onApply: (selectedGroups: CvParseReviewGroupId[]) => void
  onKeepCurrent: () => void
  parsedProfile: CandidateProfile
}

function uniqueSelectedGroups(groups: ReadonlyArray<CvParseReviewGroupId>) {
  return [...new Set(groups)]
}

export function CvParseReviewDialog({
  baselineProfile,
  content,
  isApplying,
  onApply,
  onKeepCurrent,
  parsedProfile,
}: CvParseReviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const items = useMemo(
    () =>
      getCvParseReviewItems(baselineProfile, parsedProfile).filter(
        (item) => item.hasParsedData && item.isChanged,
      ),
    [baselineProfile, parsedProfile],
  )
  const defaultSelection = useMemo(
    () => items.filter((item) => item.defaultSelected).map((item) => item.id),
    [items],
  )
  const [selectedGroups, setSelectedGroups] = useState<CvParseReviewGroupId[]>(defaultSelection)

  useEffect(() => {
    setSelectedGroups(defaultSelection)
  }, [defaultSelection])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) {
      dialog.showModal()
    }

    return () => {
      if (dialog.open) {
        dialog.close()
      }
    }
  }, [])

  function toggleGroup(groupId: CvParseReviewGroupId) {
    setSelectedGroups((currentGroups) => {
      if (currentGroups.includes(groupId)) {
        return currentGroups.filter((group) => group !== groupId)
      }

      return uniqueSelectedGroups([...currentGroups, groupId])
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onApply(selectedGroups)
  }

  return (
    <dialog
      aria-describedby="cv-parse-review-description"
      aria-labelledby="cv-parse-review-title"
      className="cv-parse-review-dialog"
      onCancel={(event) => {
        event.preventDefault()
        onKeepCurrent()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onKeepCurrent()
        }
      }}
      ref={dialogRef}
    >
      <form className="cv-parse-review" onSubmit={handleSubmit}>
        <header className="cv-parse-review__header">
          <div>
            <p>{content.eyebrow}</p>
            <h2 id="cv-parse-review-title">{content.title}</h2>
            <span id="cv-parse-review-description">{content.description}</span>
          </div>
          <button
            aria-label={content.closeLabel}
            className="cv-parse-review__close"
            disabled={isApplying}
            onClick={onKeepCurrent}
            type="button"
          >
            ×
          </button>
        </header>

        <div className="cv-parse-review__list">
          {items.map((item, index) => {
            const checked = selectedGroups.includes(item.id)
            const currentSummary = summarizeCvParseGroup(baselineProfile, item.id, {
              emptyLabel: content.emptyValue,
              moreItemsLabel: content.moreItems,
            })
            const parsedSummary = summarizeCvParseGroup(parsedProfile, item.id, {
              emptyLabel: content.emptyValue,
              moreItemsLabel: content.moreItems,
            })

            return (
              <label className="cv-parse-review__item" data-selected={checked} key={item.id}>
                <input
                  autoFocus={index === 0}
                  checked={checked}
                  disabled={isApplying}
                  onChange={() => toggleGroup(item.id)}
                  type="checkbox"
                />
                <span className="cv-parse-review__item-main">
                  <span className="cv-parse-review__item-title">
                    {content.groupLabels[item.id]}
                    {item.defaultSelected ? <em>{content.recommendedBadge}</em> : null}
                  </span>
                  <span className="cv-parse-review__compare">
                    <span>
                      <strong>{content.currentLabel}</strong>
                      <small>{currentSummary}</small>
                    </span>
                    <span>
                      <strong>{content.parsedLabel}</strong>
                      <small>{parsedSummary}</small>
                    </span>
                  </span>
                </span>
              </label>
            )
          })}
        </div>

        <footer className="cv-parse-review__actions">
          <button
            className="cv-parse-review__secondary"
            disabled={isApplying}
            onClick={onKeepCurrent}
            type="button"
          >
            {content.keepCurrent}
          </button>
          <button className="cv-parse-review__primary" disabled={isApplying} type="submit">
            {isApplying ? content.applying : content.applySelected}
          </button>
        </footer>
      </form>
    </dialog>
  )
}
