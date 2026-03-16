'use client'

interface IframeViewProps {
  src: string
  title: string
}

export function IframeView({ src, title }: IframeViewProps) {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-[#2A2D37] bg-[#0F1115]">
      <iframe
        src={src}
        title={title}
        className="w-full h-full"
        style={{ minHeight: 'calc(100vh - 200px)' }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
        allow="fullscreen; clipboard-write; encrypted-media"
      />
    </div>
  )
}
