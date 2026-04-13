function toSafeText(value) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function csvEscape(value) {
  const text = toSafeText(value)
  const escaped = text.replace(/"/g, '""')
  return `"${escaped}"`
}

export function buildCsv(rows, headers) {
  const headerLine = headers.map((header) => csvEscape(header.label)).join(',')
  const bodyLines = rows.map((row) => headers.map((header) => csvEscape(row[header.key])).join(','))
  return [headerLine, ...bodyLines].join('\n')
}

export function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function toIsoDate(dateValue) {
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}
