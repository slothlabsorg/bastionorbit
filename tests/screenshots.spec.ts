/**
 * Bastion Orbit — Visual Snapshot Suite
 *
 * Captures every screen + key interaction state with mock data.
 * Run: npm run screenshots
 * View: open screenshots/ (PNG files)
 */
import { test, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// ── helpers ───────────────────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const OUT  = path.resolve(__dirname, '../screenshots')
const BASE = '/?mock=1'

function url(screen: string, extra = '') {
  return `${BASE}&screen=${screen}${extra}`
}

async function goto(page: Page, screen: string, extra = '') {
  await page.goto(url(screen, extra))
  await page.waitForSelector('.text-text-primary', { timeout: 8_000 })
  await page.waitForTimeout(400)
}

async function snap(page: Page, name: string) {
  const filePath = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: filePath, fullPage: false })
  console.log(`  ✓  ${name}.png`)
}

test.beforeAll(() => {
  fs.mkdirSync(OUT, { recursive: true })
  console.log(`\n📸  Screenshots → ${OUT}\n`)
})

// ── Home / Dashboard ──────────────────────────────────────────────────────────

test('home — bastion detail (prod-bastion selected)', async ({ page }) => {
  await goto(page, 'home')
  await snap(page, '01-home-bastion-detail')
})

test('home — sidebar collapsed', async ({ page }) => {
  await goto(page, 'home')
  const toggle = page.locator('button[title*="collapse" i], button[title*="Collapse" i]').first()
  if (await toggle.count() > 0) {
    await toggle.click()
    await page.waitForTimeout(350)
  }
  await snap(page, '02-home-sidebar-collapsed')
})

test('home — active tunnels visible on prod-bastion', async ({ page }) => {
  await goto(page, 'home')
  // prod-bastion has 2 active tunnels in mock
  await snap(page, '03-home-active-tunnels')
})

test('home — tunnel card expanded (SSH command visible)', async ({ page }) => {
  await goto(page, 'home')
  // Click the expand chevron on the first tunnel card
  const expandBtn = page.locator('[title="Show SSH command"]').first()
  if (await expandBtn.count() > 0) {
    await expandBtn.click()
    await page.waitForTimeout(300)
  }
  await snap(page, '04-home-tunnel-cmd-expanded')
})

// ── Tunnels screen ────────────────────────────────────────────────────────────

test('tunnels — active list', async ({ page }) => {
  await goto(page, 'tunnels')
  await snap(page, '05-tunnels-active-list')
})

// ── Bastion detail — staging (no active tunnels) ──────────────────────────────

test('home — staging-bastion (no tunnels)', async ({ page }) => {
  await goto(page, 'home')
  // Click staging-bastion in sidebar
  const stagingBtn = page.getByText('staging-bastion').first()
  if (await stagingBtn.count() > 0) {
    await stagingBtn.click()
    await page.waitForTimeout(300)
  }
  await snap(page, '06-home-staging-no-tunnels')
})

test('home — my-vps (offline bastion)', async ({ page }) => {
  await goto(page, 'home')
  const vpsBtn = page.getByText('my-vps').first()
  if (await vpsBtn.count() > 0) {
    await vpsBtn.click()
    await page.waitForTimeout(300)
  }
  await snap(page, '07-home-vps-offline')
})

// ── Add Bastion Wizard ────────────────────────────────────────────────────────

test('wizard — step 1: connection info', async ({ page }) => {
  await goto(page, 'home')
  const addBtn = page.getByText(/Add bastion/i).first()
  if (await addBtn.count() > 0) {
    await addBtn.click()
    await page.waitForTimeout(350)
  }
  await snap(page, '08-wizard-step1-config')
})

test('wizard — step 2: SSH key', async ({ page }) => {
  await goto(page, 'home')
  const addBtn = page.getByText(/Add bastion/i).first()
  if (await addBtn.count() > 0) {
    await addBtn.click()
    await page.waitForTimeout(350)
    const modal = page.locator('[class*="rounded-2xl"][class*="bg-bg-elevated"]').first()
    const nameInput = modal.locator('input').first()
    if (await nameInput.count() > 0) await nameInput.fill('test-bastion')
    const hostInput = modal.locator('input').nth(1)
    if (await hostInput.count() > 0) await hostInput.fill('bastion.example.com')
    await page.waitForTimeout(100)
    const continueBtn = modal.locator('button').filter({ hasText: /Continue/ }).first()
    if (await continueBtn.count() > 0) {
      await continueBtn.click()
      await page.waitForTimeout(300)
    }
  }
  await snap(page, '09-wizard-step2-key')
})

test('wizard — step 3: test connection', async ({ page }) => {
  await goto(page, 'home')
  const addBtn = page.getByText(/Add bastion/i).first()
  if (await addBtn.count() > 0) {
    await addBtn.click()
    await page.waitForTimeout(350)
    const modal = page.locator('[class*="rounded-2xl"][class*="bg-bg-elevated"]').first()
    const nameInput = modal.locator('input').first()
    if (await nameInput.count() > 0) await nameInput.fill('test-bastion')
    const hostInput = modal.locator('input').nth(1)
    if (await hostInput.count() > 0) await hostInput.fill('bastion.example.com')
    const continueBtn = modal.locator('button').filter({ hasText: /Continue/ }).first()
    if (await continueBtn.count() > 0) await continueBtn.click()
    await page.waitForTimeout(300)
    const continueBtn2 = modal.locator('button').filter({ hasText: /Continue/ }).first()
    if (await continueBtn2.count() > 0) await continueBtn2.click()
    await page.waitForTimeout(300)
  }
  await snap(page, '10-wizard-step3-test')
})

// ── Settings / Docs / Support ──────────────────────────────────────────────────

test('settings — default view', async ({ page }) => {
  await goto(page, 'settings')
  await snap(page, '11-settings')
})

test('docs — default view', async ({ page }) => {
  await goto(page, 'docs')
  await snap(page, '12-docs')
})

test('support — suite cards', async ({ page }) => {
  await goto(page, 'support')
  await snap(page, '13-support')
})

// ── Window size variations ─────────────────────────────────────────────────────

test('home — 1400×900 (larger display)', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 })
  await goto(page, 'home')
  await snap(page, '14-home-1400x900')
})

test('home — 800×600 (minimum window)', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 })
  await goto(page, 'home')
  await snap(page, '15-home-800x600')
})

// ── Composite: all screens ─────────────────────────────────────────────────────

test('composite — all screens', async ({ page }) => {
  const screens: [string, string][] = [
    ['home',     '16a-composite-home'],
    ['tunnels',  '16b-composite-tunnels'],
    ['settings', '16c-composite-settings'],
    ['docs',     '16d-composite-docs'],
    ['support',  '16e-composite-support'],
  ]
  for (const [screen, filename] of screens) {
    await page.goto(url(screen))
    await page.waitForTimeout(500)
    await snap(page, filename)
  }
})
