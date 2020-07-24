const puppeteer = require('puppeteer')
const { snapshotTesting: { renderExamplePageTestHelper } } = require('rhtmlBuildUtils')
const loadWidget = require('../lib/loadWidget.helper')

const {
  configureImageSnapshotMatcher,
  puppeteerSettings,
  testSnapshots,
  jestTimeout
} = renderExamplePageTestHelper

jest.setTimeout(jestTimeout)
configureImageSnapshotMatcher('multipleRerender')

describe('multiple render tests', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('rerender works', async function () {
    const originalConfig = 'data.test_plan.abc_rbg'
    const newConfig = 'data.test_plan.abc_rbg_vertical_flip'

    const { page } = await loadWidget({
      browser,
      configName: originalConfig,
      width: 1000,
      height: 600,
      rerenderControls: true
    })

    await testSnapshots({ page, snapshotName: 'initial' })

    await page.evaluate(() => { document.querySelector('.example-0 .rerender-config').value = '' })
    await page.type('.example-0 .rerender-config', newConfig, { delay: 0 })
    await page.click('.rerender-button')

    await page.waitForFunction(selectorString => {
      return document.querySelectorAll(selectorString).length
    }, { timeout: 10000 }, 'body[widgets-ready], .rhtml-error-container')

    await testSnapshots({ page, snapshotName: 'final' })

    await page.close()
  })
})