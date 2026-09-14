import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createEmptyAnalysisItems,
  createPreviewRequestConfig,
  createPreviewRequest,
  isTestConfigurationLocked,
} from '../src/utils/retrospectiveTest.ts'
import { MESSAGE_RELEVANCES } from '../src/types/retrospectiveTest.ts'

test('저장된 프롬프트 요청에는 초안 대신 이전 상태를 전달한다', () => {
  const priorState = {
    messages: [],
    analysisItems: createEmptyAnalysisItems(),
  }

  const request = createPreviewRequest({
    job: 'DEVELOPER',
    experience: 'YEARS_3_TO_5',
    promptSource: 'SAVED',
    draftPrompt: '무시할 초안',
    priorState,
    userMessageId: 'message-1',
    message: ' 배포 오류를 해결했어요. ',
  })

  assert.deepEqual(request, {
    job: 'DEVELOPER',
    experience: 'YEARS_3_TO_5',
    promptSource: 'SAVED',
    draftPrompt: null,
    priorState,
    userMessageId: 'message-1',
    message: '배포 오류를 해결했어요.',
  })
})

test('새 프롬프트 요청에는 공백을 제거한 초안을 전달한다', () => {
  const request = createPreviewRequest({
    job: 'DESIGNER',
    experience: 'LESS_THAN_1_YEAR',
    promptSource: 'DRAFT',
    draftPrompt: ' 새 회고 프롬프트 ',
    priorState: null,
    userMessageId: 'message-2',
    message: '첫 회고 내용',
  })

  assert.equal(request.draftPrompt, '새 회고 프롬프트')
  assert.equal(request.priorState, null)
})

test('초기 구조화 정보는 일곱 항목이 모두 비어 있다', () => {
  assert.deepEqual(createEmptyAnalysisItems(), [
    { itemType: 'FACT', status: 'EMPTY', summary: null },
    { itemType: 'FEEL', status: 'EMPTY', summary: null },
    { itemType: 'STRENGTH', status: 'EMPTY', summary: null },
    { itemType: 'BLOCK', status: 'EMPTY', summary: null },
    { itemType: 'PROCESS', status: 'EMPTY', summary: null },
    { itemType: 'LEARN', status: 'EMPTY', summary: null },
    { itemType: 'ACTION', status: 'EMPTY', summary: null },
  ])
})

test('메시지 관련성 선택지는 백엔드 V2 계약과 일치한다', () => {
  assert.deepEqual(MESSAGE_RELEVANCES, [
    'RETROSPECTIVE',
    'BRIDGEABLE',
    'OFF_TOPIC',
    'SERVICE_HELP',
  ])
})

test('첫 응답을 기다리는 동안에도 테스트 설정을 잠근다', () => {
  assert.equal(isTestConfigurationLocked(null, true), true)
  assert.equal(isTestConfigurationLocked(null, false), false)
})

test('AI 미리보기 요청은 취소 신호와 유한한 제한 시간을 사용한다', () => {
  const controller = new AbortController()

  assert.deepEqual(createPreviewRequestConfig(controller.signal), {
    signal: controller.signal,
    timeout: 120_000,
  })
})
