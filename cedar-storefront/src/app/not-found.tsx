import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-semibold text-gray-900">Page not found</h1>
      <p className="text-gray-600">
        The page you tried to access does not exist.
      </p>
      <Link
        className="text-blue-600 hover:text-blue-800 underline"
        href="/"
      >
        Go to frontpage
      </Link>
    </div>
  )
}
