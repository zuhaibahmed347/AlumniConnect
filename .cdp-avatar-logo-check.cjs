// CDP check: verify avatar + university logo actually decode on the affected routes.
const http = require('http')

const BASE = 'http://localhost:4175'
const ROUTES = [
  { path: '/',            expect: ['/images/university-logo.jpg'] },
  { path: '/login',       expect: ['/images/university-logo.jpg'] },
  { path: '/register',    expect: ['/images/university-logo.jpg'] },
  { path: '/forgot-password', expect: ['/images/university-logo.jpg'] },
  { path: '/reset-password',  expect: ['/images/university-logo.jpg'] },
  { path: '/profile',     expect: ['/images/avatar.jpg'] },
  { path: '/dashboard',   expect: ['/images/avatar.jpg'] },
  { path: '/admin',       expect: ['/images/university-logo.jpg', '/images/avatar.jpg'] },
]

const CDP_PORT = 9222

function getJson(path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port: CDP_PORT, path }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function main() {
  const targets = await getJson('/json/list')
  const page = targets.find((t) => t.type === 'page')
  if (!page) throw new Error('no page target')

  const WebSocket = require('ws')
  const ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 })
  let id = 0
  const pending = new Map()
  const consoleErrors = []
  const failedRequests = []

  ws.on('message', (raw) => {
    const msg = JSON.parse(raw)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
      return
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(' '))
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''))
    }
    if (msg.method === 'Network.loadingFailed') {
      failedRequests.push(msg.params.errorText)
    }
  })

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id
      pending.set(mid, { resolve, reject })
      ws.send(JSON.stringify({ id: mid, method, params }))
    })

  await new Promise((r) => ws.on('open', r))
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Network.enable')

  let failures = 0
  for (const route of ROUTES) {
    consoleErrors.length = 0
    failedRequests.length = 0

    await send('Page.navigate', { url: BASE + route.path })
    await new Promise((r) => setTimeout(r, 3000))

    const result = await send('Runtime.evaluate', {
      expression: `(() => {
        const imgs = Array.from(document.images);
        return {
          href: location.pathname,
          total: imgs.length,
          images: imgs.map(i => ({
            src: i.currentSrc || i.src,
            w: i.naturalWidth,
            h: i.naturalHeight,
            complete: i.complete,
          })),
        };
      })()`,
      returnByValue: true,
    })

    const { href, images } = result.result.value
    const bad = images.filter((i) => !i.complete || i.w === 0)

    // match by filename regardless of absolute URL
    const decodedFor = (needle) =>
      images.filter((i) => i.src.includes(needle) && i.w > 0).map((i) => `${needle}:${i.w}x${i.h}`)

    const missing = route.expect.filter((needle) => decodedFor(needle).length === 0)

    const ok = missing.length === 0 && bad.length === 0 && consoleErrors.length === 0 && failedRequests.length === 0
    if (!ok) failures++

    console.log(`${ok ? 'PASS' : 'FAIL'}  ${route.path} -> ${href}`)
    for (const needle of route.expect) {
      const found = decodedFor(needle)
      console.log(`        ${found.length ? 'decoded' : 'NOT DECODED'}  ${found.join(', ') || needle}`)
    }
    console.log(`        images=${images.length} broken=${bad.length} consoleErrors=${consoleErrors.length} failedReq=${failedRequests.length}`)
    if (bad.length) console.log('        broken: ' + JSON.stringify(bad))
    if (consoleErrors.length) console.log('        console: ' + consoleErrors.slice(0, 3).join(' | '))
    if (failedRequests.length) console.log('        failed: ' + failedRequests.slice(0, 3).join(' | '))
  }

  ws.close()
  console.log(failures === 0 ? '\nCHECK_PASS' : `\nCHECK_FAIL (${failures} routes)`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error('CHECK_ERROR', e); process.exit(1) })
