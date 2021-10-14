enum FORMAT_TYPE {
    NULL = 'NULL',
    ORIGINAL_FORMAT = 'ORIGINAL_FORMAT',
    LATEST_FORMAT = 'LATEST_FORMAT',
    ORIGINAL_EXPERT_FORMAT = 'ORIGINAL_EXPERT_FORMAT'
}

interface FormatInfo {
    id: string
    text: string
    acronym: string
    acronymText: string
    hint: string
    shapes: string
    colors: string
    color: string
}

const FORMAT_INFO: Record<FORMAT_TYPE, FormatInfo> = {
  NULL: {
    id: 'NULL',
    text: 'No format selected',
    hint: 'No format selected yet for this file',
    acronym: '?',
    acronymText: 'No format selected yet for this file',
    shapes: 'aaaaa aaaaa aaaaa aaaaa aaaaa aaaaa',
    colors: '_____ _____ _____ _____ _____ _____',
    color: 'grey'
  } as FormatInfo,
  ORIGINAL_FORMAT: {
    id: 'ORIGINAL_FORMAT',
    text: 'Original format',
    hint: 'Original excel format used to calculate pareto with macros',
    acronym: 'OF',
    acronymText: 'OF for "Original Format"',
    shapes: 'a__bb a__bb cddee cffgg cffgg cffgg',
    colors: 'y____ y____ _oooo _mmgr _mmrg _mmgr',
    color: 'primary'
  } as FormatInfo,
  LATEST_FORMAT: {
    id: 'LATEST_FORMAT',
    text: 'Latest format',
    hint: 'Latest version of the file format used for the pareto calculation',
    acronymText: 'LF for "Latest Format"',
    acronym: 'LF',
    shapes: '___bb ___bb dddee fffgg fffgg fffgg',
    colors: '_____ _____ ooooo mmmmm mmmmm mmmmm',
    color: 'primary'
  } as FormatInfo,
  ORIGINAL_EXPERT_FORMAT: {
    id: 'ORIGINAL_EXPERT_FORMAT',
    text: 'Original format with expert',
    hint: 'Original excel format to manually analyse constraints with an expert',
    acronym: 'OEF',
    acronymText: 'OEF for "Original Format with Expert"',
    shapes: '_abbb cbccc cbccc d_eee d_eee d_eee',
    colors: '__ooo ommmm ommmm o_mgg o_gmg o_ggm',
    color: 'primary'
  } as FormatInfo
}

export { FORMAT_TYPE, FORMAT_INFO, FormatInfo }
