import * as pdfjsLib from 'pdfjs-dist'

let isConfigured = false

export function configurePdfJsWorker() {
  if (isConfigured || typeof window === 'undefined') return
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
    isConfigured = true
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
    isConfigured = true
  }
}
