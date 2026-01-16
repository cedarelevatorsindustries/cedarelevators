"use client"

import { SocialIcons } from "./social-icons"

export function FollowUsColumn() {
    return (
        <div className="col-span-2">
            <h4 className="font-semibold text-gray-900 mb-2">FOLLOW US</h4>
            <p className="text-sm text-gray-600 mb-4">Stay connected with us</p>
            <SocialIcons />
        </div>
    )
}
