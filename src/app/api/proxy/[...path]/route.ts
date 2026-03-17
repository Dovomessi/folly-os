import { NextRequest, NextResponse } from 'next/server'

const SERVICE_MAP: Record<string, string> = {
  plane: process.env.NEXT_PUBLIC_PLANE_URL || 'https://plane-web-production-c63d.up.railway.app',
  docmost: process.env.NEXT_PUBLIC_DOCMOST_URL || 'https://docmost-production-3a43.up.railway.app',
  vault: process.env.NEXT_PUBLIC_VAULTWARDEN_URL || 'https://vaultwarden-production-39da.up.railway.app',
  calcom: process.env.NEXT_PUBLIC_CALCOM_URL || 'https://app.cal.com',
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}
export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}
export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}
export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path)
}

async function proxyRequest(request: NextRequest, pathParts: string[]) {
  const [service, ...rest] = pathParts
  const targetBase = SERVICE_MAP[service]

  if (!targetBase) {
    return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 })
  }

  const targetPath = rest.length > 0 ? `/${rest.join('/')}` : '/'
  const targetUrl = `${targetBase}${targetPath}`

  try {
    const headers = new Headers()
    request.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (['host', 'connection', 'transfer-encoding', 'accept-encoding'].includes(lower)) return
      headers.set(key, value)
    })
    // Set the correct host for the upstream
    const targetHost = new URL(targetBase).host
    headers.set('host', targetHost)

    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual', // Handle redirects ourselves
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      fetchOptions.body = await request.arrayBuffer()
    }

    const response = await fetch(targetUrl, fetchOptions)

    // Handle redirects - rewrite Location header to go through proxy
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (location) {
        let newLocation = location
        // Rewrite absolute URL redirects to proxy path
        if (location.startsWith(targetBase)) {
          newLocation = `/api/proxy/${service}${location.slice(targetBase.length)}`
        } else if (location.startsWith('/')) {
          newLocation = `/api/proxy/${service}${location}`
        }
        return NextResponse.redirect(new URL(newLocation, request.url), response.status as 301 | 302 | 303 | 307 | 308)
      }
    }

    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (lower === 'x-frame-options') return
      if (lower === 'content-encoding') return
      if (lower === 'content-length') return
      if (lower === 'transfer-encoding') return
      if (lower === 'content-security-policy') {
        // Relax CSP for iframe embedding
        let newValue = value
          .replace(/frame-ancestors[^;]*/i, "frame-ancestors *")
          .replace(/script-src[^;]*/i, "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:")
          .replace(/style-src[^;]*/i, "style-src 'self' 'unsafe-inline'")
          .replace(/connect-src[^;]*/i, "connect-src 'self' * ws: wss:")
          .replace(/default-src[^;]*/i, "default-src 'self' 'unsafe-inline'")
        responseHeaders.set(key, newValue)
        return
      }
      responseHeaders.set(key, value)
    })

    const contentType = response.headers.get('content-type') || ''
    const isHtml = contentType.includes('text/html')

    if (isHtml) {
      let html = await response.text()
      const proxyBase = `/api/proxy/${service}`

      // Rewrite absolute paths: href="/xxx" → href="/api/proxy/service/xxx"
      html = html.replace(
        /(href|src|action)="\/(?!\/|api\/proxy)/g,
        `$1="${proxyBase}/`
      )

      // Rewrite relative paths: src="app/main.js" → src="/api/proxy/service/app/main.js"
      html = html.replace(
        /(href|src)="(?!\/|http|https|data:|blob:|#|mailto:|javascript:)([^"]+)"/g,
        `$1="${proxyBase}/$2"`
      )

      // Rewrite url() in CSS
      html = html.replace(
        /url\(["']?\/(?!\/|api\/proxy)([^"')]+)["']?\)/g,
        `url("${proxyBase}/$1")`
      )

      return new NextResponse(html, {
        status: response.status,
        headers: responseHeaders,
      })
    }

    const body = await response.arrayBuffer()
    return new NextResponse(body, {
      status: response.status,
      headers: responseHeaders,
    })
  } catch (error) {
    return NextResponse.json(
      { error: `Proxy error: ${error instanceof Error ? error.message : 'unknown'}` },
      { status: 502 }
    )
  }
}
