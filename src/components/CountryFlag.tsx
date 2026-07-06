// Renders a country as a country-flag-icons (catamphetamine) SVG flag component.
// The 14 flags below cover every value in the CSV's free-text `Country` column;
// unmapped values fall back to text so a future dataset addition degrades
// gracefully instead of showing nothing.
//
// These are React SVG components imported per-flag so the bundler only includes
// the 14 we use, and Vite inlines them — nothing is fetched at runtime, so it
// works offline under the `/fh6/` base path. If you add a new country to the CSV,
// add its ISO 3166-1 alpha-2 code here (uppercase, matching the subpath).
import type { ComponentType } from 'react'
import AU from 'country-flag-icons/react/3x2/AU'
import AT from 'country-flag-icons/react/3x2/AT'
import CA from 'country-flag-icons/react/3x2/CA'
import CN from 'country-flag-icons/react/3x2/CN'
import HR from 'country-flag-icons/react/3x2/HR'
import DK from 'country-flag-icons/react/3x2/DK'
import FR from 'country-flag-icons/react/3x2/FR'
import DE from 'country-flag-icons/react/3x2/DE'
import IT from 'country-flag-icons/react/3x2/IT'
import JP from 'country-flag-icons/react/3x2/JP'
import KR from 'country-flag-icons/react/3x2/KR'
import SE from 'country-flag-icons/react/3x2/SE'
import GB from 'country-flag-icons/react/3x2/GB'
import US from 'country-flag-icons/react/3x2/US'

type FlagComponent = ComponentType<{ className?: string; title?: string }>

const FLAG_BY_COUNTRY: Record<string, FlagComponent> = {
  Australia: AU,
  Austria: AT,
  Canada: CA,
  China: CN,
  Croatia: HR,
  Denmark: DK,
  France: FR,
  Germany: DE,
  Italy: IT,
  Japan: JP,
  Korea: KR,
  Sweden: SE,
  UK: GB,
  USA: US,
}

export function CountryFlag({ country, className = '' }: { country: string; className?: string }) {
  const Flag = FLAG_BY_COUNTRY[country]
  if (!Flag) return <span className={className}>{country}</span>
  return (
    <Flag
      title={country}
      className={`inline-block h-[14px] w-[21px] shrink-0 align-middle ring-1 ring-white/10 ${className}`}
    />
  )
}
