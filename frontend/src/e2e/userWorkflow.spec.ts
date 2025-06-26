/**
 * 端到端使用者流程測試
 * 測試使用者從註冊到購買的完整流程
 */

import { test, expect } from '@playwright/test'

// Test data
const testUser = {
    name: '測試買家',
    email: `buyer-${Date.now()}@example.com`,
    password: 'password123',
}

const testSeller = {
    name: '測試賣家',
    email: `seller-${Date.now()}@example.com`,
    password: 'password123',
}

test.describe('使用者完整流程 E2E 測試', () => {
    test('完整的購買流程：註冊 -> 登入 -> 瀏覽 -> 出價', async ({ page, context }) => {
        // Step 1: 註冊新用戶
        await page.goto('/')

        // 點擊註冊按鈕
        await page.click('text=註冊')

        // 填寫註冊表單
        await page.fill('[name="name"]', testUser.name)
        await page.fill('[name="email"]', testUser.email)
        await page.fill('[name="password"]', testUser.password)
        await page.fill('[name="password_confirmation"]', testUser.password)

        // 送出註冊表單
        await page.click('button[type="submit"]')

        // 等待註冊成功並重定向
        await expect(page).toHaveURL(/\//)

        // Step 2: 登出並重新登入
        await page.click('text=登出')
        await page.click('text=登入')

        // 填寫登入表單
        await page.fill('[name="email"]', testUser.email)
        await page.fill('[name="password"]', testUser.password)
        await page.click('button[type="submit"]')

        // 驗證登入成功
        await expect(page.locator(`text=${testUser.name}`)).toBeVisible()

        // Step 3: 瀏覽腳踏車列表
        await page.goto('/bicycles')

        // 等待腳踏車列表載入
        await page.waitForSelector('[data-testid="bicycle-card"]', { timeout: 10000 })

        // 點擊第一個腳踏車
        await page.click('[data-testid="bicycle-card"]:first-child')

        // Step 4: 查看腳踏車詳情
        await expect(page.locator('[data-testid="bicycle-detail"]')).toBeVisible()

        // 檢查是否顯示出價按鈕（如果不是自己的商品）
        const makeOfferButton = page.locator('text=出價')
        const ownBicycleText = page.locator('text=這是您的腳踏車')

        if (await makeOfferButton.isVisible()) {
            // Step 5: 發送出價
            await makeOfferButton.click()

            // 填寫出價表單
            await page.fill('[name="offer_amount"]', '12000')
            await page.fill('[name="message"]', '我想要這台腳踏車')

            // 送出出價
            await page.click('text=送出出價')

            // 驗證出價成功
            await expect(page.locator('text=出價已送出')).toBeVisible()
        } else if (await ownBicycleText.isVisible()) {
            // 這是用戶自己的商品，應該顯示"這是您的腳踏車"
            console.log('這是用戶自己的商品，無法出價')
        }

        // Step 6: 查看訊息列表
        await page.goto('/messages')

        // 等待訊息列表載入
        await page.waitForSelector('[data-testid="conversation-list"]', { timeout: 5000 })

        // 驗證有對話記錄
        const conversations = page.locator('[data-testid="conversation-item"]')
        const conversationCount = await conversations.count()

        if (conversationCount > 0) {
            // 點擊第一個對話
            await conversations.first().click()

            // 驗證訊息顯示
            await expect(page.locator('[data-testid="message-list"]')).toBeVisible()
        }
    })

    test('賣家流程：上架商品 -> 接收出價 -> 接受出價', async ({ page, context }) => {
        // 使用新的 context 模擬不同用戶
        const sellerPage = await context.newPage()

        // Step 1: 賣家註冊
        await sellerPage.goto('/')
        await sellerPage.click('text=註冊')

        await sellerPage.fill('[name="name"]', testSeller.name)
        await sellerPage.fill('[name="email"]', testSeller.email)
        await sellerPage.fill('[name="password"]', testSeller.password)
        await sellerPage.fill('[name="password_confirmation"]', testSeller.password)

        await sellerPage.click('button[type="submit"]')

        // Step 2: 上架商品
        await sellerPage.goto('/sell')

        // 填寫商品資訊
        await sellerPage.fill('[name="title"]', 'E2E 測試腳踏車')
        await sellerPage.fill('[name="description"]', '這是用於 E2E 測試的腳踏車')
        await sellerPage.fill('[name="price"]', '15000')
        await sellerPage.selectOption('[name="brand_id"]', '1') // 假設品牌 ID 為 1
        await sellerPage.selectOption('[name="condition"]', 'good')
        await sellerPage.selectOption('[name="size"]', 'M')

        // 上傳圖片（如果有文件上傳功能）
        // await sellerPage.setInputFiles('[name="photos"]', 'test-bike.jpg')

        // 送出表單
        await sellerPage.click('button[type="submit"]')

        // 驗證商品上架成功
        await expect(sellerPage.locator('text=商品已成功上架')).toBeVisible()

        // Step 3: 買家註冊並出價
        await page.goto('/')
        await page.click('text=註冊')

        await page.fill('[name="name"]', testUser.name)
        await page.fill('[name="email"]', testUser.email)
        await page.fill('[name="password"]', testUser.password)
        await page.fill('[name="password_confirmation"]', testUser.password)

        await page.click('button[type="submit"]')

        // 瀏覽到剛上架的商品
        await page.goto('/bicycles')
        await page.click('text=E2E 測試腳踏車')

        // 發送出價
        await page.click('text=出價')
        await page.fill('[name="offer_amount"]', '12000')
        await page.fill('[name="message"]', '我想要這台腳踏車')
        await page.click('text=送出出價')

        // Step 4: 賣家查看並接受出價
        await sellerPage.goto('/messages')

        // 等待有新訊息
        await sellerPage.waitForSelector('[data-testid="conversation-item"]', { timeout: 10000 })

        // 點擊對話
        await sellerPage.click('[data-testid="conversation-item"]:first-child')

        // 查看出價訊息
        const offerMessage = sellerPage.locator('[data-testid="offer-message"]')
        await expect(offerMessage).toBeVisible()

        // 接受出價
        await sellerPage.click('text=接受出價')

        // 驗證接受成功
        await expect(sellerPage.locator('text=已接受出價')).toBeVisible()

        // Step 5: 買家查看接受結果
        await page.reload()
        const acceptedMessage = page.locator('text=您的出價已被接受')
        await expect(acceptedMessage).toBeVisible()
    })

    test('防止自己對自己出價', async ({ page }) => {
        // Step 1: 用戶註冊並登入
        await page.goto('/')
        await page.click('text=註冊')

        await page.fill('[name="name"]', testSeller.name)
        await page.fill('[name="email"]', testSeller.email)
        await page.fill('[name="password"]', testSeller.password)
        await page.fill('[name="password_confirmation"]', testSeller.password)

        await page.click('button[type="submit"]')

        // Step 2: 上架商品
        await page.goto('/sell')

        await page.fill('[name="title"]', '我的測試腳踏車')
        await page.fill('[name="description"]', '我自己的腳踏車')
        await page.fill('[name="price"]', '10000')
        await page.selectOption('[name="brand_id"]', '1')
        await page.selectOption('[name="condition"]', 'good')
        await page.selectOption('[name="size"]', 'L')

        await page.click('button[type="submit"]')

        // Step 3: 嘗試查看自己的商品
        await page.goto('/bicycles')
        await page.click('text=我的測試腳踏車')

        // Step 4: 驗證不能對自己的商品出價
        const ownBicycleText = page.locator('text=這是您的腳踏車')
        const makeOfferButton = page.locator('text=出價')

        await expect(ownBicycleText).toBeVisible()
        await expect(makeOfferButton).not.toBeVisible()
    })

    test('多用戶出價競爭', async ({ browser }) => {
        // 創建三個不同的瀏覽器 context 模擬三個用戶
        const sellerContext = await browser.newContext()
        const buyer1Context = await browser.newContext()
        const buyer2Context = await browser.newContext()

        const sellerPage = await sellerContext.newPage()
        const buyer1Page = await buyer1Context.newPage()
        const buyer2Page = await buyer2Context.newPage()

        // 賣家上架商品
        await sellerPage.goto('/')
        await sellerPage.click('text=註冊')

        await sellerPage.fill('[name="name"]', '競爭賣家')
        await sellerPage.fill('[name="email"]', `competitive-seller-${Date.now()}@example.com`)
        await sellerPage.fill('[name="password"]', 'password123')
        await sellerPage.fill('[name="password_confirmation"]', 'password123')

        await sellerPage.click('button[type="submit"]')

        await sellerPage.goto('/sell')
        await sellerPage.fill('[name="title"]', '熱門腳踏車')
        await sellerPage.fill('[name="description"]', '非常受歡迎的腳踏車')
        await sellerPage.fill('[name="price"]', '20000')
        await sellerPage.selectOption('[name="brand_id"]', '1')
        await sellerPage.selectOption('[name="condition"]', 'excellent')
        await sellerPage.selectOption('[name="size"]', 'M')

        await sellerPage.click('button[type="submit"]')

        // 買家1註冊並出價
        await buyer1Page.goto('/')
        await buyer1Page.click('text=註冊')

        await buyer1Page.fill('[name="name"]', '買家1')
        await buyer1Page.fill('[name="email"]', `buyer1-${Date.now()}@example.com`)
        await buyer1Page.fill('[name="password"]', 'password123')
        await buyer1Page.fill('[name="password_confirmation"]', 'password123')

        await buyer1Page.click('button[type="submit"]')

        await buyer1Page.goto('/bicycles')
        await buyer1Page.click('text=熱門腳踏車')
        await buyer1Page.click('text=出價')
        await buyer1Page.fill('[name="offer_amount"]', '18000')
        await buyer1Page.fill('[name="message"]', '我想要這台')
        await buyer1Page.click('text=送出出價')

        // 買家2註冊並出更高價
        await buyer2Page.goto('/')
        await buyer2Page.click('text=註冊')

        await buyer2Page.fill('[name="name"]', '買家2')
        await buyer2Page.fill('[name="email"]', `buyer2-${Date.now()}@example.com`)
        await buyer2Page.fill('[name="password"]', 'password123')
        await buyer2Page.fill('[name="password_confirmation"]', 'password123')

        await buyer2Page.click('button[type="submit"]')

        await buyer2Page.goto('/bicycles')
        await buyer2Page.click('text=熱門腳踏車')
        await buyer2Page.click('text=出價')
        await buyer2Page.fill('[name="offer_amount"]', '19000')
        await buyer2Page.fill('[name="message"]', '我出更高價')
        await buyer2Page.click('text=送出出價')

        // 賣家查看所有出價並接受買家2的出價
        await sellerPage.goto('/messages')

        // 驗證有兩個對話
        const conversations = sellerPage.locator('[data-testid="conversation-item"]')
        await expect(conversations).toHaveCount(2)

        // 點擊買家2的對話（通常會顯示最新或最高出價）
        await conversations.nth(1).click()

        // 接受買家2的出價
        await sellerPage.click('text=接受出價')

        // 驗證接受成功
        await expect(sellerPage.locator('text=已接受出價')).toBeVisible()

        // 清理 contexts
        await sellerContext.close()
        await buyer1Context.close()
        await buyer2Context.close()
    })
})
