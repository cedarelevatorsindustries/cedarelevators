/**
 * Elevator Types Data Constants
 * Shared data for elevator type sections across mobile and desktop
 */

export interface ElevatorType {
    id: string
    title: string
    description: string
    image: string
    href: string
}

export const ELEVATOR_TYPES: ElevatorType[] = [
    {
        id: "residential-elevators",
        title: "Build Your Dream House Elevator",
        description: "Premium components for luxury residential installations",
        image: "/images/image.png",
        href: "/catalog?application=residential"
    },
    {
        id: "commercial-buildings",
        title: "Power Commercial Projects",
        description: "High-capacity systems for office buildings and complexes",
        image: "/images/image.png",
        href: "/catalog?application=commercial"
    },
    {
        id: "hospital-elevators",
        title: "Medical-Grade Elevator Systems",
        description: "Reliable, safe components for healthcare facilities",
        image: "/images/image.png",
        href: "/catalog?application=hospital"
    },
    {
        id: "freight-elevators",
        title: "Heavy-Duty Freight Solutions",
        description: "Industrial-strength components for cargo transport",
        image: "/images/image.png",
        href: "/catalog?application=freight"
    },
    {
        id: "modernization",
        title: "Modernize Existing Elevators",
        description: "Upgrade old systems with latest technology",
        image: "/images/image.png",
        href: "/catalog?application=modernization"
    },
    {
        id: "luxury-elevators",
        title: "Luxury Custom Installations",
        description: "Premium finishes and advanced features for high-end projects",
        image: "/images/image.png",
        href: "/catalog?application=luxury"
    }
]

