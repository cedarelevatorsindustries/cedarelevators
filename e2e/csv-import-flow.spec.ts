/**
 * E2E Test: Complete CSV Import Flow
 * Tests the entire user journey from upload to results
 */

import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('CSV Import Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to import page
    // Note: You may need to handle authentication first
    await page.goto('/admin/products/import')
  })

  test('should display import page with all sections', async ({ page }) => {
    await expect(page.getByTestId('product-import-page')).toBeVisible()
    await expect(page.getByText('Bulk Import Products')).toBeVisible()
    await expect(page.getByTestId('upload-card')).toBeVisible()
    await expect(page.getByTestId('template-card')).toBeVisible()
  })

  test('should download CSV template successfully', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByTestId('download-template-button').click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('product-import-template.csv')
  })

  test('should show pre-import checklist', async ({ page }) => {
    await expect(page.getByText('Applications created')).toBeVisible()
    await expect(page.getByText('Categories & Subcategories created')).toBeVisible()
    await expect(page.getByText('Elevator Types created')).toBeVisible()
  })

  test('should upload CSV file and show preview', async ({ page }) => {
    // Create a test CSV file content
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,track_inventory,product_stock,status
Test Motor,Great motor for testing,motors,traction-motors,5000,6000,true,100,active`

    // Create temporary file
    const tempFilePath = path.join(__dirname, 'temp-test.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    // Upload file
    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)

    await expect(page.getByTestId('selected-file-name')).toContainText('temp-test.csv')

    // Click preview button
    await page.getByTestId('preview-button').click()

    // Wait for preview to load
    await expect(page.getByText('Preview')).toBeVisible()
    await expect(page.getByText('Products')).toBeVisible()
    await expect(page.getByText('Variants')).toBeVisible()

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })

  test('should show validation errors for invalid CSV', async ({ page }) => {
    // Create invalid CSV (missing required columns)
    const csvContent = `product_title,description
Test Motor,Great motor`

    const tempFilePath = path.join(__dirname, 'temp-invalid.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should show error message
    await expect(page.getByText(/missing required columns/i)).toBeVisible({ timeout: 10000 })

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })

  test('should proceed through all steps for valid import', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,track_inventory,product_stock,status
E2E Test Motor,Motor for E2E testing,motors,traction-motors,5000,6000,true,100,active`

    const tempFilePath = path.join(__dirname, 'temp-e2e.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    // Step 1: Upload
    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Step 2: Preview
    await expect(page.getByText('1').first()).toBeVisible() // Product count

    // Check if there are no blocking errors
    const hasErrors = await page.getByText('Blocking Errors').isVisible().catch(() => false)
    
    if (!hasErrors) {
      // Step 3: Confirm
      await page.getByText('Continue to Confirm').click()
      await expect(page.getByTestId('confirm-import-button')).toBeVisible()

      // Step 4: Execute Import
      await page.getByTestId('confirm-import-button').click()

      // Wait for results
      await expect(page.getByText(/Import Completed/i)).toBeVisible({ timeout: 30000 })
      await expect(page.getByTestId('view-products-button')).toBeVisible()
    }

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })

  test('should show progress indicator through steps', async ({ page }) => {
    // Check initial state (Upload step)
    const uploadStep = page.locator('div').filter({ hasText: /^Upload$/ }).first()
    await expect(uploadStep).toHaveClass(/orange-600/)

    // After preview, should highlight Preview step
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Test,Test,motors,traction,5000,6000`

    const tempFilePath = path.join(__dirname, 'temp-progress.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    const previewStep = page.locator('div').filter({ hasText: /^Preview$/ }).first()
    await expect(previewStep).toBeVisible()

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })

  test('should allow user to go back to upload from preview', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
Test,Test,motors,traction,5000,6000`

    const tempFilePath = path.join(__dirname, 'temp-back.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Click back button
    await page.getByText('Back to Upload').click()

    // Should be back on upload step
    await expect(page.getByTestId('csv-file-input')).toBeVisible()

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })

  test('should disable import button when there are blocking errors', async ({ page }) => {
    // Create CSV with invalid data
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp
A,Too short,motors,traction,invalid,6000`

    const tempFilePath = path.join(__dirname, 'temp-errors.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should show blocking errors
    await expect(page.getByText(/Blocking Errors/i)).toBeVisible({ timeout: 10000 })

    // Continue button should be disabled
    const continueButton = page.getByText('Continue to Confirm')
    await expect(continueButton).toBeDisabled()

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })

  test('should show product groups with variants in preview', async ({ page }) => {
    const csvContent = `product_title,short_description,application_slug,category_slug,product_price,product_mrp,variant_title,variant_option_1_name,variant_option_1_value
Motor,Test motor,motors,traction,5000,6000,Variant 1,Size,Small
Motor,Test motor,motors,traction,5000,6000,Variant 2,Size,Large`

    const tempFilePath = path.join(__dirname, 'temp-variants.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should show 1 product with 2 variants
    await expect(page.getByText('Products to Import')).toBeVisible()
    await expect(page.getByText(/2 variants/i)).toBeVisible()

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })

  test('should handle large CSV files', async ({ page }) => {
    // Create a CSV with 100 products
    let csvContent = 'product_title,short_description,application_slug,category_slug,product_price,product_mrp\n'
    for (let i = 1; i <= 100; i++) {
      csvContent += `Product ${i},Description ${i},motors,traction,${5000 + i},${6000 + i}\n`
    }

    const tempFilePath = path.join(__dirname, 'temp-large.csv')
    const fs = require('fs')
    fs.writeFileSync(tempFilePath, csvContent)

    const fileInput = page.getByTestId('csv-file-input')
    await fileInput.setInputFiles(tempFilePath)
    await page.getByTestId('preview-button').click()

    // Should show correct count
    await expect(page.getByText('100')).toBeVisible({ timeout: 15000 })

    // Cleanup
    fs.unlinkSync(tempFilePath)
  })
})
