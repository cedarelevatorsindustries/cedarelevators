import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cedar Elevators - Elevator Components & Parts',
    short_name: 'Cedar Elevators',
    description: 'Shop quality elevator components and spare parts. Find safety gear, controllers, door operators, and more for elevator maintenance and installation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#F97316',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['business', 'shopping'],
    lang: 'en-IN',
    dir: 'ltr',
  }
}
