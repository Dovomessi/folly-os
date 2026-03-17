'use client'

import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, Copy, Check } from 'lucide-react'

interface PasswordGeneratorProps {
  onUse?: (password: string) => void
}

function generatePassword(
  length: number,
  useUpper: boolean,
  useLower: boolean,
  useDigits: boolean,
  useSymbols: boolean
): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let charset = ''
  const required: string[] = []

  if (useUpper) { charset += upper; required.push(upper[Math.floor(Math.random() * upper.length)]) }
  if (useLower) { charset += lower; required.push(lower[Math.floor(Math.random() * lower.length)]) }
  if (useDigits) { charset += digits; required.push(digits[Math.floor(Math.random() * digits.length)]) }
  if (useSymbols) { charset += symbols; required.push(symbols[Math.floor(Math.random() * symbols.length)]) }

  if (!charset) charset = lower

  const arr = Array.from({ length: length - required.length }, () =>
    charset[Math.floor(Math.random() * charset.length)]
  )

  const combined = [...required, ...arr]
  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]]
  }

  return combined.join('')
}

function getStrength(password: string): { label: string; color: string; width: string } {
  let score = 0
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Faible', color: '#E5484D', width: '25%' }
  if (score <= 3) return { label: 'Moyen', color: '#F5A623', width: '50%' }
  if (score <= 4) return { label: 'Fort', color: '#46A758', width: '75%' }
  return { label: 'Très fort', color: '#34D399', width: '100%' }
}

export function PasswordGenerator({ onUse }: PasswordGeneratorProps) {
  const [length, setLength] = useState(16)
  const [useUpper, setUseUpper] = useState(true)
  const [useLower, setUseLower] = useState(true)
  const [useDigits, setUseDigits] = useState(true)
  const [useSymbols, setUseSymbols] = useState(false)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = useCallback(() => {
    setPassword(generatePassword(length, useUpper, useLower, useDigits, useSymbols))
  }, [length, useUpper, useLower, useDigits, useSymbols])

  useEffect(() => {
    generate()
  }, [generate])

  const strength = password ? getStrength(password) : null

  const handleCopy = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const toggleOption = (
    current: boolean,
    setter: (v: boolean) => void,
    others: boolean[]
  ) => {
    // At least one charset must be active
    if (current && others.every(v => !v)) return
    setter(!current)
  }

  return (
    <div className="rounded-lg border border-[#2A2D37] bg-[#0F1115] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#F7F8F8]">Générateur de mot de passe</span>
        <button
          type="button"
          onClick={generate}
          className="flex items-center gap-1.5 text-xs text-[#8A8F98] hover:text-[#F7F8F8] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Générer
        </button>
      </div>

      {/* Generated password */}
      <div className="flex items-center gap-2">
        <div className="flex-1 font-mono text-sm bg-[#161922] border border-[#2A2D37] rounded-lg px-3 py-2 text-[#F7F8F8] truncate select-all">
          {password || '—'}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-none p-2 rounded-lg border border-[#2A2D37] bg-[#161922] text-[#8A8F98] hover:text-[#F7F8F8] hover:border-[#5E6AD2] transition-colors"
          title="Copier"
        >
          {copied ? <Check className="w-4 h-4 text-[#46A758]" /> : <Copy className="w-4 h-4" />}
        </button>
        {onUse && (
          <button
            type="button"
            onClick={() => password && onUse(password)}
            className="flex-none px-3 py-2 rounded-lg bg-[#5E6AD2] hover:bg-[#6B76E0] text-white text-xs font-medium transition-colors"
          >
            Utiliser
          </button>
        )}
      </div>

      {/* Strength indicator */}
      {strength && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#555A65]">Force</span>
            <span className="text-xs font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
          <div className="h-1.5 bg-[#2A2D37] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: strength.width, backgroundColor: strength.color }}
            />
          </div>
        </div>
      )}

      {/* Length slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8A8F98]">Longueur</span>
          <span className="text-xs font-mono font-medium text-[#F7F8F8] w-6 text-right">{length}</span>
        </div>
        <input
          type="range"
          min={8}
          max={64}
          value={length}
          onChange={e => setLength(Number(e.target.value))}
          className="w-full h-1.5 appearance-none bg-[#2A2D37] rounded-full cursor-pointer accent-[#5E6AD2]"
        />
        <div className="flex justify-between text-[10px] text-[#555A65]">
          <span>8</span>
          <span>64</span>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Majuscules (A-Z)', value: useUpper, setter: setUseUpper, others: [useLower, useDigits, useSymbols] },
          { label: 'Minuscules (a-z)', value: useLower, setter: setUseLower, others: [useUpper, useDigits, useSymbols] },
          { label: 'Chiffres (0-9)', value: useDigits, setter: setUseDigits, others: [useUpper, useLower, useSymbols] },
          { label: 'Symboles (!@#...)', value: useSymbols, setter: setUseSymbols, others: [useUpper, useLower, useDigits] },
        ].map(({ label, value, setter, others }) => (
          <button
            key={label}
            type="button"
            onClick={() => toggleOption(value, setter, others)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
              value
                ? 'border-[#5E6AD2] bg-[#5E6AD2]/10 text-[#8A8FE8]'
                : 'border-[#2A2D37] bg-[#161922] text-[#555A65] hover:text-[#8A8F98]'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-none transition-colors ${
              value ? 'border-[#5E6AD2] bg-[#5E6AD2]' : 'border-[#555A65]'
            }`}>
              {value && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
