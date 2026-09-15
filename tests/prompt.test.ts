import assert from 'node:assert/strict'
import test from 'node:test'

import { getPromptOrder, getPromptTypeLabel } from '../src/utils/prompt.ts'

test('백엔드의 네 가지 프롬프트 타입을 서로 다른 이름으로 표시한다', () => {
  assert.equal(getPromptTypeLabel('DEEP_QUESTION'), '심화 질문 (V1)')
  assert.equal(getPromptTypeLabel('SUMMARY'), '회고 요약 (V1)')
  assert.equal(getPromptTypeLabel('CONVERSATION_V2'), '회고 대화 (V2)')
  assert.equal(getPromptTypeLabel('RESULT_V2'), '정보 구조화 (V2)')
})

test('프롬프트를 직업별로 묶고 타입 순서대로 정렬할 수 있다', () => {
  assert.deepEqual(
    [
      ['PLANNER', 'DEEP_QUESTION'],
      ['DEVELOPER', 'RESULT_V2'],
      ['DEVELOPER', 'SUMMARY'],
      ['DEVELOPER', 'CONVERSATION_V2'],
      ['DEVELOPER', 'DEEP_QUESTION'],
    ].sort((a, b) => getPromptOrder(a[0], a[1]) - getPromptOrder(b[0], b[1])),
    [
      ['DEVELOPER', 'DEEP_QUESTION'],
      ['DEVELOPER', 'SUMMARY'],
      ['DEVELOPER', 'CONVERSATION_V2'],
      ['DEVELOPER', 'RESULT_V2'],
      ['PLANNER', 'DEEP_QUESTION'],
    ],
  )
})
