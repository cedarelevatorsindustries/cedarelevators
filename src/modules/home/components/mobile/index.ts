// Export all mobile homepage sections from the sections folder
// Note: FeaturedProductsSection, WhyCedarSection, CustomerReviewsSection, ElevatorTypesMobile
// have been moved to @/components/shared/sections for consolidation

export { default as QuickAccessCategoriesSection } from './sections/QuickAccessCategoriesSection'
export { default as CategoryBlocksSection } from './sections/CategoryBlocksSection'
export { default as QuickQuoteSection } from './sections/QuickQuoteSection'
export { default as NeedHelpSection } from './sections/NeedHelpSection'

// Re-export from sections index
export * from './sections'