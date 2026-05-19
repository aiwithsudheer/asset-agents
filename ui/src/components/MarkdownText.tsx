import { Fragment } from 'react'

function renderInline(text: string, keyPrefix: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={`${keyPrefix}-b${i}`} className="font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={`${keyPrefix}-i${i}`}>{part.slice(1, -1)}</em>
    return <Fragment key={`${keyPrefix}-t${i}`}>{part}</Fragment>
  })
}

function isTableLine(line: string): boolean {
  return line.trim().startsWith('|') && line.trim().endsWith('|')
}

function isSeparatorLine(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim())
}

function parseRow(line: string): string[] {
  return line.trim().slice(1, -1).split('|').map(c => c.trim())
}

interface Props {
  text: string
}

export function MarkdownText({ text }: Props) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const key = `l${i}`

    // Headings
    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      const depth = heading[1].length
      const cls =
        depth === 1 ? 'font-bold text-base mt-3 mb-1' :
        depth === 2 ? 'font-semibold text-sm mt-2 mb-1' :
                     'font-semibold text-sm text-gray-700 mt-2'
      nodes.push(<div key={key} className={cls}>{renderInline(heading[2], key)}</div>)
      i++; continue
    }

    // Tables — collect all consecutive table lines
    if (isTableLine(line)) {
      const tableLines: string[] = []
      while (i < lines.length && isTableLine(lines[i])) {
        tableLines.push(lines[i])
        i++
      }
      const dataLines = tableLines.filter(l => !isSeparatorLine(l))
      if (dataLines.length >= 2) {
        const [headerLine, ...bodyLines] = dataLines
        const headers = parseRow(headerLine)
        nodes.push(
          <div key={key} className="overflow-x-auto my-3">
            <table className="min-w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-200 whitespace-nowrap">
                      {renderInline(h, `${key}-th${hi}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyLines.map((row, ri) => (
                  <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {parseRow(row).map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-gray-700 border border-gray-200">
                        {renderInline(cell, `${key}-td${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // Bullet lists
    if (/^[-*•]\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(<li key={`li${i}`}>{renderInline(lines[i].slice(2), `li${i}`)}</li>)
        i++
      }
      nodes.push(<ul key={key} className="list-disc pl-4 space-y-0.5 my-1.5">{items}</ul>)
      continue
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={`li${i}`}>{renderInline(lines[i].replace(/^\d+\.\s/, ''), `li${i}`)}</li>)
        i++
      }
      nodes.push(<ol key={key} className="list-decimal pl-4 space-y-0.5 my-1.5">{items}</ol>)
      continue
    }

    // Empty line → spacer
    if (line.trim() === '') {
      nodes.push(<div key={key} className="h-2" />)
      i++; continue
    }

    // Regular paragraph line
    nodes.push(<div key={key}>{renderInline(line, key)}</div>)
    i++
  }

  return <>{nodes}</>
}
