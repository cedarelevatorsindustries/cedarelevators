import { redirect } from 'next/navigation'

/**
 * Cedar Elevators Admin Portal - Single Entry Point Migration
 * Legacy /admin/login redirects directly to the official admin route /admin.
 */
export default function AdminLoginPage() {
  redirect('/admin')
}
