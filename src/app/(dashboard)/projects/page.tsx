'use client'

import { FolderOpen } from 'lucide-react'

export default function ProjectsIndex() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <FolderOpen className="w-16 h-16 text-[#2A2D37] mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#8A8F98] mb-2">
          Aucun projet selectionne
        </h2>
        <p className="text-[#555A65]">
          Creez un nouveau projet ou selectionnez-en un dans la sidebar
        </p>
      </div>
    </div>
  )
}
