'use client'

import Pusher from 'pusher-js'

// Enable logging in development
if (process.env.NODE_ENV === 'development') {
  Pusher.logToConsole = true
}

let pusherInstance: Pusher | null = null

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY || 'aad9545ead3e5677b29e',
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
        forceTLS: true,
      }
    )
  }
  return pusherInstance
}

export { pusherInstance }
