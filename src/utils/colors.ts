export const primary = {
  10: '#ECFBF5',
  20: '#E2FAF0',
  30: '#C3F4DF',
  50: '#3DDB99',
  55: '#37C58A',
  60: '#31AF7A',
  70: '#2EA473',
  80: '#25835C',
  90: '#1B6345',
  95: '#154D36',
} as const

export const neutral = {
  0:   '#FFFFFF',
  5:   '#FDFDFD',
  10:  '#F6F6F6',
  20:  '#F1F1F1',
  30:  '#E6E6E6',
  40:  '#C6C6C6',
  50:  '#989898',
  60:  '#6A6A6A',
  70:  '#575757',
  80:  '#3C3C3C',
  90:  '#353535',
  95:  '#2B2B2B',
  100: '#191919',
} as const

export const system = {
  danger50: '#FF5C5C',
  danger60: '#F73838',
  accent50:  '#FF6E58',
} as const

export const colors = { primary, neutral, system } as const
