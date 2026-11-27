// Share a photo into Tribis (M25), the installed web app on Android: the web manifest's share_target sends the picture
// here (a POST to "share-target"); it is kept in the "tribis-share" cache on this device and the app opens with
// "?compartir=1" to ask "¿De quién es esta foto?" (src/features/write/SharedPhoto.tsx). Nothing leaves the device.
// Loaded by the service worker Workbox makes (vite.config.ts → workbox.importScripts).
self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'POST') return
  const scope = self.registration.scope
  if (new URL(request.url).pathname !== new URL('share-target', scope).pathname) return
  event.respondWith(
    (async () => {
      try {
        const form = await request.formData()
        const file = form.get('photo')
        if (file && typeof file !== 'string' && file.type.startsWith('image/') && file.size > 0 && file.size < 40 * 1024 * 1024) {
          const cache = await caches.open('tribis-share')
          await cache.put(new URL('shared-photo', scope).href, new Response(file, { headers: { 'content-type': file.type } }))
        }
      } catch (err) {
        console.error(err)
      }
      return Response.redirect(new URL('./?compartir=1', scope).href, 303)
    })(),
  )
})
