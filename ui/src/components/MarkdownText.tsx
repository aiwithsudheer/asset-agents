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

    if (/^[-*•]\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^[-*•]\s/.test(lines[i])) {
        items.push(<li key={`li${i}`}>{renderInline(lines[i].slice(2), `li${i}`)}</li>)
        i++
      }
      nodes.push(<ul key={key} className="list-disc pl-4 space-y-0.5 my-1.5">{items}</ul>)
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(<li key={`li${i}`}>{renderInline(lines[i].replace(/^\d+\.\s/, ''), `li${i}`)}</li>)
        i++
      }
      nodes.push(<ol key={key} className="list-decimal pl-4 space-y-0.5 my-1.5">{items}</ol>)
      continue
    }

    if (line.trim() === '') {
      nodes.push(<div key={key} className="h-2" />)
      i++; continue
    }

    nodes.push(<div key={key}>{renderInline(line, key)}</div>)
    i++
  }

  return <>{nodes}</>
}
