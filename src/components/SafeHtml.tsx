import DOMPurify from "dompurify"
import type { SafeHtmlProps } from "@/interfaces/common"

// The only place allowed to render HTML strings. Plain text never needs this —
// React already escapes it. ESLint blocks dangerouslySetInnerHTML everywhere else.
export const SafeHtml = ({ html, className }: SafeHtmlProps) => {
  return <div className={className} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
}
