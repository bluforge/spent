import { GLYPHS, type GlyphKey } from '../lib/glyphs'

/** Renders a category icon: a tinted monochrome glyph, or the emoji itself for legacy values. */
export default function CategoryIcon({
  icon,
  color,
  size = 18,
}: {
  icon: string
  color?: string
  size?: number
}) {
  const Glyph = GLYPHS[icon as GlyphKey]
  if (Glyph) {
    return <Glyph size={size} strokeWidth={2.2} style={color ? { color } : undefined} />
  }
  return (
    <span className="leading-none" style={{ fontSize: size }}>
      {icon}
    </span>
  )
}
