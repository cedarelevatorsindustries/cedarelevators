/**
 * E2E Test: Edge Cases for CSV Import
 * Tests various edge cases and error scenarios
 */

import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

test.describe('CSV Import Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/products/import')
  })

  test('should handle empty CSV file', async ({ page }) => {
    const csvContent = ``
    const tempFilePath = path.join(__dirname, 'temp-empty.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    await expect(page.getByText(/empty/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle CSV with only headers', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp`
    const tempFilePath = path.join(__dirname, 'temp-headers-only.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    await expect(page.getByText(/empty/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle special characters in product names', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
"Motor @ 415V (Premium)",Special motor,motors,traction,5000,6000`
    const tempFilePath = path.join(__dirname, 'temp-special-chars.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    await expect(page.getByText('Motor @ 415V (Premium)')).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle very long descriptions', async ({ page }) => {
    const longDescription = 'A'.repeat(500)
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,"${longDescription}",motors,traction,5000,6000`
    const tempFilePath = path.join(__dirname, 'temp-long-desc.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should handle long text gracefully
    await expect(page.getByText('Motor')).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle duplicate product titles', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,First motor,motors,traction,5000,6000
Motor,Same name motor,motors,traction,7000,8000`
    const tempFilePath = path.join(__dirname, 'temp-duplicate.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should group as variants of same product
    await expect(page.getByText(/2 variants/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle missing optional fields', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,Test motor,motors,traction,5000,6000`
    const tempFilePath = path.join(__dirname, 'temp-missing-optional.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should succeed with warnings at most
    await expect(page.getByText('Motor')).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle zero prices', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,Test motor,motors,traction,0,0`
    const tempFilePath = path.join(__dirname, 'temp-zero-price.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should show error for invalid price
    await expect(page.getByText(/price must be a positive number/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle negative prices', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,Test motor,motors,traction,-5000,6000`
    const tempFilePath = path.join(__dirname, 'temp-negative-price.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    await expect(page.getByText(/price must be a positive number/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle malformed JSON in attributes', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,attributes
Motor,Test motor,motors,traction,5000,6000,"{not valid json}"`
    const tempFilePath = path.join(__dirname, 'temp-bad-json.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    await expect(page.getByText(/Invalid JSON/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle commas in product descriptions', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,"Great motor, perfect for elevators, tested quality",motors,traction,5000,6000`
    const tempFilePath = path.join(__dirname, 'temp-commas.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    await expect(page.getByText(/Great motor, perfect for elevators/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should handle invalid category references', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,Test motor,non-existent-app,non-existent-category,5000,6000`
    const tempFilePath = path.join(__dirname, 'temp-invalid-refs.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should show errors for invalid references
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })

  test('should display warning for products that will be drafted', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Motor,Test motor,invalid-app,invalid-cat,5000,6000`
    const tempFilePath = path.join(__dirname, 'temp-draft.csv')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    await expect(page.getByText(/Will import as DRAFT/i)).toBeVisible({ timeout: 10000 })

    fs.unlinkSync(tempFilePath)
  })
})
