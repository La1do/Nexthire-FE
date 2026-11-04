import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../../src/pages/JobDetailPage/utils/jobContentParser.ts', import.meta.url), 'utf8')
const exports = {}
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 } }).outputText, { exports })
const parse = value => JSON.parse(JSON.stringify(exports.parseJobContent(value)))
const intro = 'We are looking for a Backend Engineer to develop services for a subscription and billing platform. You will build APIs, maintain transactional data, and integrate background processing while working closely with frontend and product teams.'
const duties = [
  'Develop and maintain backend services using Node.js and TypeScript.',
  'Build REST APIs for customer accounts, subscription plans, billing records, and access permissions.',
  'Design relational database schemas and implement transactions for subscription and payment-related operations.',
  'Implement authentication and role-based authorization for customer and administrative APIs.',
  'Integrate external payment webhooks and prevent duplicate processing of repeated events.',
  'Develop background jobs for notifications, billing reminders, and data synchronization.',
  'Write automated tests for business rules, API responses, and failure scenarios.',
  'Investigate errors and performance issues using application logs and metrics.',
  'Review code and maintain API documentation, migration instructions, and operational notes.',
]

test('uppercase section labels have hierarchy without altering their wording', () => {
  assert.deepEqual(parse('REQUIRED QUALIFICATIONS\n- Backend experience.\nPREFERRED QUALIFICATIONS — NOT REQUIRED\n- Familiarity with deployment.'), [
    { type: 'subheading', text: 'REQUIRED QUALIFICATIONS' },
    { type: 'list', items: ['Backend experience.'] },
    { type: 'subheading', text: 'PREFERRED QUALIFICATIONS — NOT REQUIRED' },
    { type: 'list', items: ['Familiarity with deployment.'] },
  ])
})
test('employer JD keeps introductory paragraph and exactly nine original bullets', () => {
  assert.deepEqual(parse(`${intro}\n\n${duties.map(text => `- ${text}`).join('\n')}`), [
    { type: 'paragraph', text: intro }, { type: 'list', items: duties },
  ])
})
test('punctuation, capitalization and technology names are never split or rewritten', () => {
  assert.deepEqual(parse('- node.js, TypeScript, and SQL; CI/CD.\n• Báo cáo, đối soát, và kiểm tra; giữ nguyên.'), [
    { type: 'list', items: ['node.js, TypeScript, and SQL; CI/CD.', 'Báo cáo, đối soát, và kiểm tra; giữ nguyên.'] },
  ])
  assert.deepEqual(parse('C++, C#, .NET; R&D.\n3.5 years of experience.'), [
    { type: 'paragraph', text: 'C++, C#, .NET; R&D.' }, { type: 'paragraph', text: '3.5 years of experience.' },
  ])
})
test('rich text paragraphs and li boundaries survive inline formatting and line breaks', () => {
  assert.deepEqual(parse('<p>Hello <strong>team</strong>, welcome.</p><ul><li><p>APIs, billing, and access.</p><p>Same responsibility.</p></li><li>Tests<br>and logs.</li></ul><h3>Benefits</h3><p>R&amp;D &#x26; &#38; learning.</p>'), [
    { type: 'paragraph', text: 'Hello team, welcome.' },
    { type: 'list', items: ['APIs, billing, and access.\nSame responsibility.', 'Tests\nand logs.'] },
    { type: 'subheading', text: 'Benefits' },
    { type: 'paragraph', text: 'R&D & & learning.' },
  ])
})
test('paragraphs separate explicit lists and numbered markers are supported', () => {
  assert.deepEqual(parse('Responsibilities:\n1. First, second, and third.\n2) Another duty.\nClosing paragraph.\n- Benefits.'), [
    { type: 'lead', text: 'Responsibilities:' }, { type: 'list', items: ['First, second, and third.', 'Another duty.'] },
    { type: 'paragraph', text: 'Closing paragraph.' }, { type: 'list', items: ['Benefits.'] },
  ])
})
test('empty content and unsafe markup are not rendered as executable HTML', () => {
  assert.deepEqual(parse(null), [])
  assert.deepEqual(parse(' \n '), [])
  assert.deepEqual(parse('<p>&lt;script&gt;literal&lt;/script&gt;</p><script>alert(1)</script>'), [{ type: 'paragraph', text: '<script>literal</script>' }])
})
