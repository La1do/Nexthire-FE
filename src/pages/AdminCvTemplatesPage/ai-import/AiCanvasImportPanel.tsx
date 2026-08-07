import { AlertTriangle, Loader2, RotateCcw, Sparkles, Upload, Wand2 } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'

import { Button } from '../../_components'
import type { AdminCvTemplatesTranslations } from '../../../i18n/types'
import type { CanvasDocument } from '../../CvBuilderPage/canvas/canvas.types'
import type {
  CvTemplateDesignJob,
  CvTemplateDesignSanitizeReport,
} from '../../../types/cvTemplateDesign.types'
import { CanvasPreview } from './CanvasPreview'
import { useCanvasDesignJob } from './useCanvasDesignJob'

const fill = (template: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{{${key}}}`, String(value)),
    template,
  )

function SanitizeSummary({
  report,
  content,
}: {
  report: CvTemplateDesignSanitizeReport
  content: AdminCvTemplatesTranslations['aiImport']
}) {
  return (
    <ul className="admin-cv-template-ai__report">
      <li>
        {fill(content.elementsKept, {
          kept: report.elementsKept,
          returned: report.elementsReturned,
        })}
      </li>
      {report.dropped.length > 0 ? (
        <li>{fill(content.dropped, { count: report.dropped.length })}</li>
      ) : null}
      {report.clamped > 0 ? <li>{fill(content.clamped, { count: report.clamped })}</li> : null}
      <li>
        {fill(content.bindings, {
          resolved: report.bindingsResolved,
          cleared: report.bindingsCleared,
        })}
      </li>
      {report.piiScrubbed > 0 ? (
        <li className="admin-cv-template-ai__report--warn">
          {fill(content.piiScrubbed, { count: report.piiScrubbed })}
        </li>
      ) : null}
    </ul>
  )
}

function ParsedSummary({
  job,
  content,
}: {
  job: CvTemplateDesignJob
  content: AdminCvTemplatesTranslations['aiImport']
}) {
  const parsed = job.parsedResume
  if (!parsed) {
    return null
  }

  return (
    <div className="admin-cv-template-ai__parsed">
      <h4>{content.parsedTitle}</h4>
      <p>{parsed.profile.fullName ?? '—'}</p>
      <p>
        {fill(content.parsedSummary, {
          experiences: parsed.experiences.length,
          educations: parsed.educations.length,
          skills: parsed.skills.length,
        })}
      </p>
    </div>
  )
}

export function AiCanvasImportPanel({
  content,
  onApply,
}: {
  content: AdminCvTemplatesTranslations['aiImport']
  onApply: (canvas: CanvasDocument) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { job, isRunning, uploadError, start, reset } = useCanvasDesignJob()

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      start(file)
    }
  }

  const errorText = (): string | null => {
    if (uploadError) {
      return content.uploadFailed
    }
    if (job?.status !== 'FAILED') {
      return null
    }
    const known = job.errorCode ? content.errors[job.errorCode] : undefined
    return known ?? job.errorMessage ?? content.failed
  }

  const error = errorText()

  return (
    <section className="admin-cv-template-modal__section admin-cv-template-ai">
      <div className="admin-cv-template-modal__section-head">
        <h3>
          <Sparkles size={16} /> {content.title}
        </h3>
        <p>{content.description}</p>
      </div>

      <input accept="application/pdf" hidden onChange={handleFile} ref={inputRef} type="file" />

      {!isRunning && !job ? (
        <Button onClick={() => inputRef.current?.click()} variant="secondary">
          <Upload size={16} />
          <span>{content.uploadLabel}</span>
        </Button>
      ) : null}

      {isRunning ? (
        <p className="admin-cv-template-ai__status">
          <Loader2 className="animate-spin" size={16} />
          <span>{content.analyzing}</span>
        </p>
      ) : null}

      {error ? (
        <div className="admin-cv-template-ai__error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      ) : null}

      {job?.status === 'SUCCEEDED' && job.canvas ? (
        <div className="admin-cv-template-ai__result">
          <CanvasPreview
            canvas={job.canvas}
            pageLabel={(current, total) => fill(content.pageOf, { current, total })}
          />
          <div className="admin-cv-template-ai__side">
            {job.sanitizeReport ? (
              <SanitizeSummary content={content} report={job.sanitizeReport} />
            ) : null}
            <ParsedSummary content={content} job={job} />
          </div>
        </div>
      ) : null}

      {!isRunning && job ? (
        <div className="admin-cv-template-ai__actions">
          {job.status === 'SUCCEEDED' && job.canvas ? (
            <Button onClick={() => onApply(job.canvas as CanvasDocument)} variant="primary">
              <Wand2 size={16} />
              <span>{content.apply}</span>
            </Button>
          ) : null}
          <Button
            onClick={() => {
              reset()
              inputRef.current?.click()
            }}
            variant="ghost"
          >
            <RotateCcw size={16} />
            <span>{content.retry}</span>
          </Button>
        </div>
      ) : null}
    </section>
  )
}
