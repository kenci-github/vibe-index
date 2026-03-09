export const KEYWORD_MAP: Record<string, {
  taste_tags?: string[]
  intent_tags?: string[]
  moment_tags?: string[]
  category?: string
}> = {
  // ── Taste ──────────────────────────────────────────────────────────────────
  'sexy':            { taste_tags: ['sexy', 'dim', 'intimate'] },
  'romantic':        { taste_tags: ['intimate', 'dim'], intent_tags: ['date'] },
  'cozy':            { taste_tags: ['cozy', 'intimate'] },
  'quiet':           { taste_tags: [] },  // handled as negative filter (is_quiet flag)
  'dim':             { taste_tags: ['dim'] },
  'bright':          { taste_tags: ['kinetic'] },
  'elegant':         { taste_tags: ['elegant', 'chic'] },
  'chic':            { taste_tags: ['chic', 'stylish'] },
  'loud':            { taste_tags: ['loud', 'kinetic'] },
  'lively':          { taste_tags: ['loud', 'kinetic', 'playful'] },
  'fun':             { taste_tags: ['playful', 'kinetic'] },
  'playful':         { taste_tags: ['playful'] },
  'earthy':          { taste_tags: ['earthy'] },
  'luxe':            { taste_tags: ['elegant', 'chic'] },
  'low-key':         { taste_tags: ['cozy', 'intimate'] },
  'intimate':        { taste_tags: ['intimate', 'dim'] },
  'stylish':         { taste_tags: ['stylish', 'chic'] },
  'moody':           { taste_tags: ['dim', 'intimate'] },
  'airy':            { taste_tags: ['kinetic'] },
  'sunlight':        { taste_tags: ['kinetic', 'earthy'] },
  'sunny':           { taste_tags: ['kinetic'] },

  // ── Intent (multi-word first) ───────────────────────────────────────────────
  'second date':     { intent_tags: ['date'], taste_tags: ['intimate', 'dim'] },
  'date night':      { intent_tags: ['date'], moment_tags: ['late-night'] },
  'girls night':     { intent_tags: ['girls-night'] },
  'late night':      { intent_tags: ['late-night'], moment_tags: ['late-night'] },
  'solo reset':      { intent_tags: ['solo-reset'] },
  'date':            { intent_tags: ['date'] },
  'solo':            { intent_tags: ['solo'] },
  'alone':           { intent_tags: ['solo'] },
  'group':           { intent_tags: ['group'] },
  'friends':         { intent_tags: ['group'] },
  'girls':           { intent_tags: ['girls-night'] },
  'galentines':      { intent_tags: ['girls-night'] },
  'brunch':          { intent_tags: ['brunch'], category: 'food' },
  'breakfast':       { intent_tags: ['brunch'], category: 'cafe' },
  'coffee':          { category: 'cafe', intent_tags: ['solo'] },
  'work':            { intent_tags: ['solo'], taste_tags: ['cozy'] },
  'working':         { intent_tags: ['solo'], taste_tags: ['cozy'] },
  'spa':             { intent_tags: ['spa'], category: 'spa' },
  'massage':         { intent_tags: ['spa'], category: 'spa' },
  'nails':           { intent_tags: ['manicure'], category: 'nails' },
  'manicure':        { intent_tags: ['manicure'], category: 'nails' },
  'pedicure':        { intent_tags: ['manicure'], category: 'nails' },
  'dessert':         { intent_tags: ['dessert'] },
  'sweet':           { intent_tags: ['dessert'] },
  'chill':           { intent_tags: ['chill'], taste_tags: ['cozy'] },
  'relax':           { intent_tags: ['chill', 'solo-reset'] },
  'reset':           { intent_tags: ['solo-reset'] },
  'recharge':        { intent_tags: ['solo-reset'] },
  'late':            { intent_tags: ['late-night'], moment_tags: ['late-night'] },
  'drinks':          { category: 'drink' },
  'cocktails':       { category: 'drink', taste_tags: ['elegant'] },
  'wine':            { category: 'drink' },
  'bar':             { category: 'drink' },
  'dinner':          { category: 'food', moment_tags: ['before-dinner'] },
  'lunch':           { category: 'food' },
  'food':            { category: 'food' },
  'restaurant':      { category: 'food' },
  'sushi':           { category: 'food' },
  'oysters':         { category: 'food', taste_tags: ['sexy', 'elegant'] },
  'seafood':         { category: 'food' },
  'pastries':        { intent_tags: ['brunch'], category: 'cafe' },
  'pastry':          { intent_tags: ['brunch'], category: 'cafe' },
  'wellness':        { category: 'wellness', intent_tags: ['solo-reset'] },

  // ── Moment (multi-word first) ───────────────────────────────────────────────
  'after shopping':  { moment_tags: ['after-shopping'] },
  'before dinner':   { moment_tags: ['before-dinner'] },
  'pre dinner':      { moment_tags: ['before-dinner'] },
  'tonight':         { moment_tags: ['late-night'] },
  'evening':         { moment_tags: ['late-night'] },
  'morning':         { moment_tags: ['sunday-morning'] },
  'sunday':          { moment_tags: ['sunday-morning'] },
  'rainy':           { moment_tags: ['rainy-day'] },
  'raining':         { moment_tags: ['rainy-day'] },
}

export interface ParsedQuery {
  taste_tags: string[]
  intent_tags: string[]
  moment_tags: string[]
  category: string | null
  matched_keywords: string[]
  is_quiet: boolean
  raw_query: string
}

export function parseVibeQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase().trim()
  const result: ParsedQuery = {
    taste_tags: [],
    intent_tags: [],
    moment_tags: [],
    category: null,
    matched_keywords: [],
    is_quiet: false,
    raw_query: query,
  }

  // Quiet is a special negative filter — check first
  if (lower.includes('quiet') || lower.includes('not too loud') || lower.includes('low noise')) {
    result.is_quiet = true
    result.matched_keywords.push('quiet')
  }

  // Sort by key length descending so multi-word phrases match before single words
  const sortedKeys = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length)

  for (const keyword of sortedKeys) {
    if (lower.includes(keyword)) {
      const mapping = KEYWORD_MAP[keyword]
      if (mapping.taste_tags)  result.taste_tags  = [...new Set([...result.taste_tags,  ...mapping.taste_tags])]
      if (mapping.intent_tags) result.intent_tags = [...new Set([...result.intent_tags, ...mapping.intent_tags])]
      if (mapping.moment_tags) result.moment_tags = [...new Set([...result.moment_tags, ...mapping.moment_tags])]
      if (mapping.category && !result.category)   result.category = mapping.category
      result.matched_keywords.push(keyword)
    }
  }

  result.matched_keywords = [...new Set(result.matched_keywords)]
  return result
}

export function formatInterpretation(parsed: ParsedQuery): string {
  const chips = [
    ...parsed.taste_tags,
    ...parsed.intent_tags,
    ...parsed.moment_tags,
    ...(parsed.category ? [parsed.category] : []),
    ...(parsed.is_quiet ? ['quiet'] : []),
  ]
  if (!chips.length) return ''
  return chips
    .map(c => c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, ' '))
    .join(' · ')
}
