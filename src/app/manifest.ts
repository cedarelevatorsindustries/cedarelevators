import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cedar Elevators - Premium Lift Components',
    short_name: 'Cedar Elevators',
    description: "India's leading B2B marketplace for premium elevator components. Shop high-quality lift parts, motors, controllers, and accessories.",
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
        purpose: 'any maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['business', 'shopping'],
    lang: 'en-IN',
    dir: 'ltr',
  }
}
