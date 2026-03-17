'use client'

import { ExternalLink } from 'lucide-react'

interface IframeToolbarProps {
  serviceName: string
  serviceIcon: React.ReactNode
  projectName: string
  externalUrl: string
  actions?: { label: string; onClick: () => void }[]
}

export function IframeToolbar({
  serviceName,
  serviceIcon,
  projectName,
  externalUrl,
  actions = [],
}: IframeToolbarProps) {
  return (
    <div className="flex items-center justify-between px-7 py-2 bg-[#161922] border-b border-[#2A2D37] text-xs text-[#555A65]">
      <span className="flex items-center gap-2">
        {serviceIcon}
        {serviceName} — {projectName}
      </span>
      <div className="flex gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="px-2.5 py-1 bg-[#1F232E] border border-[#2A2D37] rounded text-[#8A8F98] hover:border-[#5E6AD2] hover:text-white transition-colors"
          >
            {action.label}
          </button>
        ))}
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1 bg-[#1F232E] border border-[#2A2D37] rounded text-[#8A8F98] hover:border-[#5E6AD2] hover:text-white transition-colors flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Ouvrir
        </a>
      </div>
    </div>
  )
}
