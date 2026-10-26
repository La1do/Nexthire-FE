import { useEffect, useId, useRef, useState } from 'react'
import type { PlannedRequirement, PlanImportance } from '../../../../types/requirement-plan.types'
import { removePlanComponent, validatePlanEdits } from '../../../../types/requirement-plan.types'
import type { PlanCopy } from './planCopy'

function ruleText(row: PlannedRequirement, copy: PlanCopy) {
  if (validatePlanEdits([row], [row]).length) return copy.incomplete
  return row.all_of.map(group => {
    const text = group.map(id => row.components.find(c => c.id === id)!.query).join(` ${copy.orWord} `)
    return group.length > 1 && row.all_of.length > 1 ? `(${text})` : text
  }).join(` ${copy.andWord} `)
}

type Selection = { index: number; base: PlannedRequirement; row: PlannedRequirement }
export function RequirementEditor({ rows, onChange, readOnly, copy, onStagedChange }: {
  rows: PlannedRequirement[]; onChange: (rows: PlannedRequirement[]) => void; readOnly: boolean; copy: PlanCopy
  onStagedChange?: (dirty: boolean) => void
}) {
  const [selection, setSelection] = useState<Selection | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const opener = useRef<HTMLElement | null>(null)
  const stagingDirty = Boolean(selection && JSON.stringify(selection.row) !== JSON.stringify(selection.base))
  const dialogOpen = selection !== null
  useEffect(() => { onStagedChange?.(stagingDirty); return () => onStagedChange?.(false) }, [stagingDirty, onStagedChange])
  useEffect(() => {
    if (!dialogOpen || !dialog.current) return
    const element = dialog.current
    element.showModal()
    return () => { if (element.open) element.close() }
  }, [dialogOpen])
  function dismiss() {
    if (dialog.current?.open) dialog.current.close()
    setSelection(null)
    opener.current?.focus()
  }
  const row = selection?.row
  const stale = Boolean(selection && JSON.stringify(rows[selection.index]) !== JSON.stringify(selection.base))
  const disabled = readOnly || stale
  const errors = row ? validatePlanEdits([row], [selection!.base]) : []
  function update(next: PlannedRequirement) {
    if (!disabled && selection) setSelection({ ...selection, row: next })
  }
  function partChange(id: string, value: Partial<PlannedRequirement['components'][number]>) {
    if (row) update({ ...row, components: row.components.map(c => c.id === id ? { ...c, ...value } : c) })
  }
  // A partition is a simple AND of OR choices. Display existing group order;
  // never normalize stored groups just to render or open the editor.
  const flat = row?.all_of.flat() ?? []
  const partition = Boolean(row && flat.length === row.components.length && new Set(flat).size === flat.length
    && row.all_of.every(g => g.length) && row.components.every(c => flat.includes(c.id)))
  const ordered = row ? (partition ? flat.map(id => row.components.find(c => c.id === id)!) : row.components) : []
  function connect(position: number, relation: string) {
    if (!row || !partition || position < 1) return
    const ids = ordered.map(c => c.id)
    const starts = new Set(row.all_of.slice(1).map(g => g[0]))
    if (relation === 'and') starts.add(ids[position]); else starts.delete(ids[position])
    const groups: string[][] = []
    ids.forEach((id, i) => { if (!i || starts.has(id)) groups.push([id]); else groups[groups.length - 1].push(id) })
    update({ ...row, all_of: groups })
  }
  return <>
    <div className="jd-plan__table-wrap"><table className="jd-plan__summary-table">
      <thead><tr><th>{copy.requirement}</th><th>{copy.importanceLabel}</th><th><span className="jd-plan__sr-only">{copy.actionsLabel}</span></th></tr></thead>
      <tbody>{rows.map((r, index) => <tr key={r.requirement_id}>
        <td><span className="jd-plan__row-number">{index + 1}</span><span>{r.original_text}</span>{r.components.length > 1 && <small className="jd-plan__table-rule">{ruleText(r, copy)}</small>}</td>
        <td>{r.components.length === 1 ? (readOnly ? copy.importance[r.components[0].importance] : <select aria-label={`${copy.importanceLabel} · ${index + 1}`} value={r.components[0].importance} onChange={e => onChange(rows.map((value, i) => i === index ? { ...r, components: [{ ...r.components[0], importance: e.target.value as PlanImportance }] } : value))}>{Object.entries(copy.importance).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>) : <span>{r.components.length} {copy.itemsCount}</span>}</td>
        <td><button type="button" onClick={event => { opener.current = event.currentTarget; setSelection({ index, base: structuredClone(r), row: structuredClone(r) }) }}>{readOnly ? copy.viewCriteria : copy.editCriteria}</button></td>
      </tr>)}</tbody>
    </table></div>
    {selection && row && <dialog ref={dialog} className="jd-plan__dialog" aria-labelledby={titleId} onKeyDown={event => {
      if (event.key !== 'Tab') return
      const element = event.currentTarget
      const controls = [...element.querySelectorAll<HTMLElement>('button, input, select, textarea, summary, a[href], [tabindex]')]
        .filter(control => !control.matches(':disabled') && control.tabIndex >= 0 && control.getClientRects().length > 0)
      const first = controls[0], last = controls[controls.length - 1]
      if (!first || !last) { event.preventDefault(); element.focus(); return }
      const active = document.activeElement
      if (event.shiftKey && (active === first || !element.contains(active))) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && (active === last || !element.contains(active))) { event.preventDefault(); first.focus() }
    }} onCancel={e => { e.preventDefault(); dismiss() }} onClick={e => { if (e.target === e.currentTarget) dismiss() }}>
      <div className="jd-plan__dialog-content">
        <header className="jd-plan__dialog-header"><h3 id={titleId}>{copy.requirement} {selection.index + 1}</h3><button type="button" aria-label={copy.closeDialog} onClick={() => dismiss()}>×</button></header>
        <p className="jd-plan__dialog-source">{row.original_text}</p>
        {stale && <p role="alert" className="jd-plan__notice">{copy.conflict}</p>}
        <div className="jd-plan__dialog-body"><fieldset disabled={disabled} className="jd-plan__fields jd-plan__dialog-fields">
          {row.components.length > 1 && <p className="jd-plan__relation-hint">{copy.relationHint}</p>}
          <div className="jd-plan__edit-table-wrap"><table className="jd-plan__edit-table"><thead><tr>{row.components.length > 1 && <th>{copy.connection}</th>}<th>{copy.itemText}</th><th>{copy.importanceLabel}</th>{!disabled && <th><span className="jd-plan__sr-only">{copy.actionsLabel}</span></th>}</tr></thead>
            <tbody>{ordered.map((c, index) => <tr className="jd-plan__component" key={c.id}>
              {row.components.length > 1 && <td data-label={copy.connection}>{partition && index > 0 ? (disabled ? <span>{row.all_of.some(g => g[0] === c.id) ? copy.andChoice : copy.orChoice}</span> : <select aria-label={`${copy.connection} · ${index + 1}`} value={row.all_of.some(g => g[0] === c.id) ? 'and' : 'or'} onChange={e => connect(index, e.target.value)}><option value="and">{copy.andChoice}</option><option value="or">{copy.orChoice}</option></select>) : <span>{index === 0 ? '—' : copy.customLogic}</span>}</td>}
              <td data-label={copy.itemText}>{disabled ? <span>{c.query}</span> : <input aria-label={`${copy.itemText} · ${index + 1}`} maxLength={5000} value={c.query} onChange={e => {
                const query = e.target.value
                // Keep source binding automatic only for a literal slice of this JD.
                partChange(c.id, { query, ...(query.trim() && row.original_text.includes(query) ? { source_quote: query } : {}) })
              }} />}
                <details className="jd-plan__source-binding" open={!c.source_quote.trim()}><summary>{copy.sourceExcerpt}</summary>{disabled ? <p>{c.source_quote}</p> : <><textarea aria-label={`${copy.sourceExcerpt} · ${index + 1}`} rows={2} maxLength={5000} value={c.source_quote} onChange={e => partChange(c.id, { source_quote: e.target.value })} /><small>{copy.quoteHint}</small></>}</details>
              </td>
              <td data-label={copy.importanceLabel}>{disabled ? <span>{copy.importance[c.importance]}</span> : <select aria-label={`${copy.importanceLabel} · ${index + 1}`} value={c.importance} onChange={e => partChange(c.id, { importance: e.target.value as PlanImportance })}>{Object.entries(copy.importance).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>}</td>
              {!disabled && <td><button type="button" aria-label={`${copy.remove} · ${index + 1}`} disabled={row.components.length === 1} onClick={() => update(removePlanComponent(row, c.id))}>×</button></td>}
            </tr>)}</tbody>
          </table></div>
          {!disabled && <button type="button" disabled={row.components.length >= 8 || row.all_of.length >= 8} onClick={() => {
            const id = `item_${crypto.randomUUID().replaceAll('-', '')}`
            update({ ...row, components: [...row.components, { id, query: '', source_quote: '', importance: 'unknown' }], all_of: [...row.all_of, [id]] })
          }}>{copy.addItem}</button>}

          {!partition && row.components.length > 1 && <details className="jd-plan__custom-logic"><summary>{copy.customLogic}</summary><p>{copy.keepCustom}</p>
            {row.all_of.map((group, i) => <p key={i}>{group.map(id => row.components.find(c => c.id === id)?.query ?? copy.incomplete).join(` ${copy.orWord} `)}</p>)}
            {!disabled && <div className="jd-plan__actions"><button type="button" onClick={() => update({ ...row, all_of: row.components.map(c => [c.id]) })}>{copy.useAll}</button><button type="button" onClick={() => update({ ...row, all_of: [row.components.map(c => c.id)] })}>{copy.useAny}</button></div>}
          </details>}
          {row.components.length > 1 && <details className="jd-plan__context-settings"><summary>{copy.contextSettings}</summary><p>{copy.contextHint}</p><label className="jd-plan__check"><input type="checkbox" checked={row.joint_context_required} onChange={e => update({ ...row, joint_context_required: e.target.checked })} /><span>{copy.joint}</span></label></details>}
          {errors.length > 0 && <ul className="jd-plan__validation" aria-live="polite">{errors.map(issue => <li key={issue}>{copy.errors[issue]}</li>)}</ul>}
        </fieldset></div>
        {row.components.length > 1 && <div className="jd-plan__rule jd-plan__dialog-preview"><strong>{copy.previewLabel}</strong><p>{ruleText(row, copy)}</p></div>}
        <footer className="jd-plan__dialog-footer"><span>{disabled ? copy.readOnlyHint : copy.localApplyHint}</span><button type="button" onClick={() => dismiss()}>{disabled ? copy.closeDialog : copy.cancelDialog}</button>{!disabled && <button type="button" className="jd-plan__apply" disabled={errors.length > 0 || !stagingDirty} onClick={() => {
          if (disabled || errors.length || stale) return
          onChange(rows.map((r, i) => i === selection.index ? row : r)); dismiss()
        }}>{copy.applyDialog}</button>}</footer>
      </div>
    </dialog>}
  </>
}
