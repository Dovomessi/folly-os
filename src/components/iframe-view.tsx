'use client'

interface IframeViewProps {
  src: string
  title: string
}

export function IframeView({ src, title }: IframeViewProps) {
  return (
    <div className="w-full h-full overflow-hidden bg-[#0F1115]">
      <iframe
        src={src}
        title={title}
        className="w-full h-full border-0"
        style={{ minHeight: 'calc(100vh - 180px)' }}
        allow="fullscreen; clipboard-write; clipboard-read"
      />
    </div>
  )
}
