export const zh = {
    translation: {
        // 導航
        home: '首頁',
        login: '登入',
        register: '註冊',
        logout: '登出',
        profile: '個人資料',
        browse: '瀏覽',
        favorites: '收藏',
        messages: '消息',
        myOrders: '訂單',
        personalCenter: '個人中心',
        adminArea: '管理員',
        sellBicycle: '出售自行車',
        addBicycle: '新增自行車',

        // 認證相關
        auth: {
            createAccount: '建立帳戶',
            welcomeBackToRideCycle: '歡迎回到 Ride Cycle',
            joinRideCycleCommunity: '加入 Ride Cycle 社群',
            signInWithGoogle: '使用 Google 帳號登入',
            signInWithFacebook: '使用 Facebook 帳號登入',
            or: '或',
            name: '姓名',
            email: '電子郵件',
            password: '密碼',
            forgotPassword: '忘記密碼？',
            processing: '處理中...',
            alreadyHaveAccount: '已經有帳號？',
            noAccountYet: '還沒有帳號？',
            // 成功訊息
            loginSuccess: '登入成功',
            welcomeBack: '歡迎回來！',
            registerSuccess: '註冊成功',
            accountCreatedSuccessfully: '您的帳號已成功建立！',
            // 錯誤訊息
            loginFailed: '登入失敗',
            registerFailed: '註冊失敗',
            errorOccurred: '發生錯誤，請稍後再試',
            authError: '認證錯誤',
            googleLoginError: 'Google 登入錯誤',
            googleLoginFailed: 'Google 登入失敗',
            googleLoginFailedMessage: '無法啟動 Google 登入流程，請稍後再試',
            googleLoginSuccessMessage: '已成功使用 Google 帳號登入！',
            facebookLoginError: 'Facebook 登入錯誤',
            facebookLoginFailed: 'Facebook 登入失敗',
            facebookLoginFailedMessage: '無法啟動 Facebook 登入流程，請稍後再試',
            facebookLoginSuccessMessage: '已成功使用 Facebook 帳號登入！',
            // 表單佔位符
            enterName: '請輸入您的姓名',
            enterEmail: '請輸入您的電子郵件',
            enterPassword: '請輸入您的密碼',
        },

        // 法律頁面相關
        legal: {
            tableOfContents: '目錄',
            searchPlaceholder: '搜尋條款內容...',
            noSearchResults: '未找到相關內容',
            clearSearch: '清除搜尋',
            lastUpdated: '最後更新',
            backToTop: '回到頂部'
        },

        // 隱私政策相關
        privacy: {
            sections: {
                overview: {
                    title: '政策概述'
                },
                dataCollection: {
                    title: '資料收集'
                },
                dataUsage: {
                    title: '資料使用'
                },
                dataSharing: {
                    title: '資料分享'
                },
                dataSecurity: {
                    title: '資料安全'
                },
                userRights: {
                    title: '用戶權利'
                },
                cookies: {
                    title: 'Cookies 政策'
                },
                dataRetention: {
                    title: '資料保留'
                }
            }
        },

        // 共用翻譯
        common: {
            home: '首頁',
            backToHome: '返回首頁',
            backToTop: '回到頂部',
            loading: '載入中...',
            error: '發生錯誤',
            success: '成功',
            confirm: '確認',
            cancel: '取消',
            save: '儲存',
            edit: '編輯',
            delete: '刪除',
            submit: '提交',
            close: '關閉'
        },

        // 管理員相關
        adminPanel: '管理員控制台',
        orderManagement: '訂單管理',
        userManagement: '用戶管理',
        viewAndManageUsers: '查看和管理所有用戶',
        allUsers: '所有用戶',
        joinDate: '註冊日期',
        bicycles: '自行車',
        status: '狀態',
        actions: '操作',
        view: '查看',
        active: '活躍',
        blacklisted: '黑名單',
        blacklist: '加入黑名單',
        unblacklist: '移出黑名單',
        suspiciousUser: '可疑用戶',
        markSuspicious: '標記可疑',
        removeSuspicious: '取消可疑',
        phoneVerified: '手機已驗證',
        unnamed: '未命名',
        noUsers: '暫無用戶',
        featureNotAvailable: '功能暫未開放',
        userProfileViewingComingSoon: '用戶資料查看功能即將上線',
        userMessageViewingComingSoon: '用戶訊息查看功能即將上線',

        // 個人資料
        personalInfo: '個人資訊',
        myBicycles: '我的自行車',
        messagesPage: {
            offerAccepted: '出價已接受',
            offerAcceptedWithOrder: '您已經接受了這個出價！訂單編號：{{orderNumber}}。請聯繫買家完成交易。',
            offerAcceptedMessage: '您已經接受了這個出價，請聯繫買家完成交易。',
            acceptOfferFailed: '接受出價失敗，請稍後再試',
            offerRejected: '出價已拒絕',
            offerRejectedMessage: '您已經拒絕了這個出價。',
            rejectOfferFailed: '拒絕出價失敗，請稍後再試',
            cannotOfferOnOwnBicycle: '您不能對自己的腳踏車進行出價',
            bicycleNotAvailable: '此腳踏車已不可購買',
            failedToLoadConversations: '載入對話失敗',
            cannotSendMessageNoBicycleContext: '無法發送訊息，缺少腳踏車上下文',
            errorSendingOffer: '發送出價時發生錯誤',
            acceptOffer: '接受出價',
            rejectOffer: '拒絕出價',
            thisIsYourBicycle: '這是您的腳踏車',
            soldOut: '已售出',
            pending: '待回應',
            accepted: '已接受',
            rejected: '已拒絕',
            expired: '已過期',
            useNotificationError: 'useNotification 必須在 NotificationProvider 中使用',
            recommended: '推薦',
            me: '我',
        },
        accountSettings: '帳戶設置',
        youHaveNoMessages: '您沒有任何消息',
        messagesWillAppearHere: '當您有新的消息時會顯示在這裡',
        browseBicycles: '瀏覽自行車',

        publishNewBike: '發佈新車',
        youHaveNotPublishedAnyBikes: '您還沒有發佈任何自行車',
        startPublishingYourFirstBike: '開始發佈您的第一輛自行車吧',
        publishNow: '立即發佈',

        // 訂單相關
        orderHistory: '訂單記錄',
        mySales: '我的銷售',
        orderDetails: '訂單詳情',
        orderDate: '訂單日期',
        orderStatus: '訂單狀態',
        orderTotal: '訂單總額',
        orderNumber: '訂單編號',
        viewDetails: '查看詳情',
        youHaveNoOrders: '您沒有任何訂單',
        youHaveNoSales: '您沒有任何銷售記錄',
        orderProcessing: '處理中',
        orderShipped: '已出貨',
        orderDelivered: '已送達',
        orderCancelled: '已取消',
        trackOrder: '追蹤訂單',
        buyerInformation: '買家資訊',
        sellerInformation: '賣家資訊',
        seller: '賣家',
        paymentMethod: '付款方式',
        shippingAddress: '配送地址',

        // 基本詞彙
        awaitingPayment: '待付款',
        goBack: '返回',
        back: '返回',
        tryAgain: '重試',
        loading: '載入中',
        notAvailable: '不適用',
        error: '錯誤',

        // 訂單詳情相關
        bicycleInfo: '自行車資訊',
        shippingInfo: '配送資訊',
        paymentInfo: '付款資訊',
        shippingMethod: '配送方式',
        paymentStatus: '付款狀態',
        paymentRequired: '需要付款',
        pleaseCompletePaymentSoon: '請儘快完成付款',
        payNow: '立即付款',
        brand: '品牌',
        condition: '車況',
        selfPickup: '自取',
        delivery: '配送',
        trackingNumber: '追蹤號碼',
        carrier: '物流公司',

        // 自行車詳情
        location: '地點',
        model: '型號',
        year: '年份',
        frameSize: '車架尺寸',
        wheelSize: '輪胎尺寸',
        yearsOfUse: '使用年限',
        contactSellerBike: '聯絡賣家',
        askQuestion: '詢問關於這輛自行車的問題...',
        sendMessage: '發送訊息',
        description: '描述',
        makeOffer: '出價',
        yourOffer: '您的出價',
        submit: '提交',

        // 結帳
        buyNow: '立即購買',
        checkout: '結帳',
        checkoutProcess: '結帳流程',
        shipping: '配送',
        payment: '付款',
        confirmation: '確認',
        shippingInformation: '配送資訊',
        paymentInformation: '付款資訊',
        confirmOrder: '確認訂單',
        placeOrder: '下單',
        returnToShopping: '返回購物',
        continueToPayment: '繼續付款',
        continueToReview: '繼續檢查',
        backToShipping: '返回配送',
        reviewYourOrder: '檢查您的訂單',
        orderSummary: '訂單摘要',
        subtotal: '小計',
        shippingCost: '運費',
        tax: '稅金',
        total: '總計',
        orderCreatedSuccessfully: '訂單創建成功',
        paymentDeadlineNotice: '請於3天內完成付款，逾期訂單將自動取消',
        remainingTime: '剩餘時間',
        paymentInstructions: '付款說明',
        amount: '金額',
        orderTransferNote: '訂單轉帳備註',
        iUnderstandPaymentInstructions: '我已了解付款說明',
        processing: '處理中',
        confirmAndCreateOrder: '確認並創建訂單',

        // 配送地址表單
        recipientName: '收件人姓名',
        fullName: '姓名',
        phoneNumber: '電話號碼',
        mobileNumber: '手機號碼',
        county: '縣市',
        district: '鄉鎮市區',
        addressLine1: '地址',
        addressLine2: '詳細地址',
        postalCode: '郵遞區號',
        deliveryNotes: '配送備註',
        saveAsDefault: '設為預設地址',

        // 台灣縣市
        taiwanCounties: {
            taipei: '台北市',
            newTaipei: '新北市',
            taoyuan: '桃園市',
            taichung: '台中市',
            tainan: '台南市',
            kaohsiung: '高雄市',
            keelung: '基隆市',
            hsinchu: '新竹市',
            hsinchuCounty: '新竹縣',
            yilan: '宜蘭縣',
            miaoli: '苗栗縣',
            changhua: '彰化縣',
            nantou: '南投縣',
            yunlin: '雲林縣',
            chiayi: '嘉義市',
            chiayiCounty: '嘉義縣',
            pingtung: '屏東縣',
            taitung: '台東縣',
            hualien: '花蓮縣',
            penghu: '澎湖縣',
            kinmen: '金門縣',
            lienchiang: '連江縣',
        },

        // 付款資訊
        cardNumber: '信用卡號碼',
        cardHolderName: '持卡人姓名',
        expiryDate: '到期日',
        expiryMonth: '月份',
        expiryYear: '年份',
        cvv: '安全碼',
        cvvHint: 'CVV',
        saveCardInfo: '儲存信用卡資訊以供未來使用',
        securePayment: '安全付款',
        paymentSecurityNote: '所有付款資訊都經過加密並受到保護',

        // 腳踏車詳情頁面
        bicycleNotFound: '未找到自行車。',
        generalInformation: '基本資訊',
        conditionLabel: '狀況：',
        frameSizeLabel: '車架尺寸：',
        yearLabel: '年份：',
        fitsToHeight: '適合身高：',
        contactSellerForDetails: '請聯繫賣家詢問詳情',
        bikeDetails: '車輛詳情',
        informationFromSeller: '來自賣家的資訊：',
        noAdditionalDetails: '未提供額外詳情',
        showOriginal: '顯示原文',
        comfirmAndCheckout: '前往購買',
        buyerProtection: '透過我們的買家保護，您的付款安全無虞。賣家只有在您收到並確認商品後才會收到款項。',
        learnMoreBuyerProtection: '了解更多',
        soldBy: '由以下賣家出售',
        anonymousSeller: '匿名賣家',
        locationNotSpecified: '未指定位置',
        ownOneLikeThis: '擁有類似車款？快速出售，立即開始',
        reportSuspicious: '舉報此產品為可疑商品',
        makeAnOffer: '我要出價',

        // 訂單付款頁面
        returnToOrderDetails: '返回訂單詳情',
        completePayment: '完成付款',
        orderNumberLabel: '訂單編號',
        bankTransferInfo: '銀行轉帳資訊',
        bankNameLabel: '銀行名稱',
        bankCodeLabel: '銀行代碼',
        accountNumberLabel: '帳號',
        accountNameLabel: '戶名',
        bankName: '銀行名稱',
        accountNumber: '帳號',
        accountName: '戶名',
        branchLabel: '分行',
        transferAmountLabel: '轉帳金額',
        transferInstructions: '轉帳說明',
        paymentProofUpload: '付款證明上傳',
        uploadTransferProof: '上傳轉帳證明',
        chooseFileLabel: '選擇檔案',
        uploadProofBtn: '上傳證明',
        uploadingStatus: '上傳中...',
        paymentConfirmed: '付款已確認',
        paymentPending: '付款待確認',
        paymentRejected: '付款證明被拒絕，請重新上傳',
        proofUploaded: '付款證明已上傳',
        paymentConfirmedDesc: '您的付款已確認，我們將盡快安排出貨。',
        paymentRejectedDesc: '您的付款證明未通過審核，請重新上傳清晰的轉帳證明。',
        paymentPendingDesc: '我們已收到您的轉帳資訊，正在確認付款。一般在24小時內完成確認。',
        proofUploadedDesc: '我們已收到您的付款證明，正在進行確認。一般在24小時內完成審核。',
        transferDeadline: '請於24小時內完成轉帳',
        transferInstructionsList: {
            step1: '1. 使用網路銀行或至銀行櫃檯進行轉帳',
            step2: '2. 填入上方提供的銀行帳戶資訊',
            step3: '3. 轉帳備註請填寫訂單編號',
            step4: '4. 上傳轉帳收據或截圖',
            step5: '5. 我們將在24小時內確認您的付款',
        },
        orderTotalLabel: '訂單總額',
        uploadSuccessTitle: '上傳成功',
        uploadFailedTitle: '上傳失敗',
        uploadSuccessMessage: '轉帳證明已上傳，請等待確認',
        uploadFailedMessage: '上傳轉帳證明時發生錯誤',
        orderNotFoundMessage: '訂單未找到',
        loadingText: '載入中',
        goBackBtn: '返回',
        tryAgainBtn: '重試',

        // 付款方式選項
        paymentMethods: {
            creditCard: '信用卡',
            debitCard: '金融卡',
            bankTransfer: '銀行轉帳',
            cashOnDelivery: '貨到付款',
            linePay: 'LINE Pay',
            applePay: 'Apple Pay',
            googlePay: 'Google Pay',
        },
        paymentMethodNote: '我們目前只提供轉帳選項，刷卡服務正在努力串接中',

        // 付款證明上傳相關
        uploadPaymentProof: '上傳轉帳證明',
        updatePaymentProof: '更新轉帳證明',
        reuploadPaymentProof: '重新上傳轉帳證明',
        uploadProof: '上傳證明',
        updateProof: '更新證明',
        uploading: '上傳中...',
        fileTooLarge: '檔案太大，請選擇小於 5MB 的檔案',
        invalidFileType: '請選擇圖片檔案（JPG、PNG、GIF）',
        pleaseSelectFileOrMessage: '請選擇檔案或填寫文字說明',
        copySuccess: '已複製',
        copySuccessDesc: '已複製到剪貼板',
        copyFailed: '複製失敗',
        copyFailedDesc: '無法複製到剪貼板',

        // 手續費相關
        platformCommissionRate: '平台手續費率',
        sellingPrice: '商品售價',
        platformCommission: '平台手續費',
        actualIncome: '實際收入',
        commissionCalculation: '手續費計算',
        commissionNote: '手續費說明',
        commissionExplanation1: '消費者支付的金額即為您設定的商品價格',
        commissionExplanation2: '平台會從售價中扣除手續費後撥款給您',
        commissionExplanation3: '手續費用於維護平台運營和交易安全保障',
        commissionExplanation4: '款項會在交易完成後7個工作天內撥款',
        youWillReceive: '您將收到',
        afterDeductingCommission: '(已扣除平台手續費)',

        // 條款和政策
        agreeToTerms: '我同意',
        termsAndConditions: '條款與條件',
        and: '和',
        privacyPolicy: '隱私政策',

        // 配送選擇
        deliveryOptions: '配送方式',
        deliveryMethod: '配送方式',
        deliveryFee: '配送費',
        homeDelivery: '宅配到府',
        freeShipping: '免運費',
        estimatedDeliveryTime: '預估到貨時間',
        distanceBasedShipping: '依實際距離計算，車箱配送2300起',
        staffWillContact: '訂單成立會有專員聯絡',
        deliveryAddress: '配送地址',
        pickupLocation: '面交地點',
        pickupNote: '面交說明',
        pickupInstructions: '選擇面交後，賣家會與您聯繫約定時間地點',
        pickupPaymentFlow: '面交付款流程',
        pickupPaymentSteps: {
            step1: '1. 完成線上付款（款項暫由平台保管）',
            step2: '2. 與賣家約定面交時間地點',
            step3: '3. 現場驗收商品無誤後完成交易',
            step4: '4. 七天後平台自動撥款給賣家',
            step5: '5. 七天內如有問題可申請退貨',
        },
        pickupWarning: '⚠️ 請務必透過平台進行交易，平台外交易無法提供保障',
        pickupRefundPolicy: '退貨政策：面交後七天內可申請退貨，超過期限不接受退貨',

        // 確認頁面
        orderConfirmation: '訂單確認',
        bicycleDetails: '腳踏車詳情',
        quantity: '數量',
        unitPrice: '單價',

        // 搜尋相關
        searchBicycles: '搜尋自行車',
        searchPlaceholder: '搜尋品牌、型號或關鍵字...',
        search: '搜尋',
        clearFilters: '清除篩選',
        noResultsFound: '找不到符合條件的自行車',
        sortBy: '排序方式',
        filters: '篩選',
        filterByPrice: '依價格篩選',
        filterByLocation: '依地點篩選',
        filterByCondition: '依車況篩選',
        filterByBrand: '依品牌篩選',
        priceRange: '價格範圍',
        minPrice: '最低價格',
        maxPrice: '最高價格',
        applyFilters: '套用篩選',
        resetFilters: '重設篩選',

        // 首頁相關
        ride: 'Ride',
        findPerfectBike: '找到您的完美自行車',
        heroBannerDescription: '在我們的自行車愛好者社群中買賣二手自行車。找到完美的座駕或讓您的自行車重新發光。',
        browseBikes: '瀏覽自行車',
        sellYourBike: '出售您的自行車',
        featuredBicycles: '精選自行車',
        recentlyAdded: '最新上架',
        exploreAllBicycles: '探索所有自行車',
        viewAll: '查看全部',
        relatedTo: '相關於',
        searchResults: '搜尋結果',
        ratingNotAvailable: '評分不可用',
        unknownBrand: '未知品牌',
        loadingBicycles: '載入自行車中...',
        noBicyclesFound: '目前沒有找到自行車，請稍後再來看看！',
        grid: '網格檢視',
        list: '列表檢視',
        resultsFound: '個結果',

        // 審核步驟
        photos: '照片',
        reviewYourChanges: '審核您的變更',
        reviewYourListing: '審核您的刊登',
        reviewBeforeText: '請在以下內容審核後',
        savingChanges: '儲存變更中...',
        submittingListing: '提交刊登中...',
        bikeDetailsHeading: '自行車詳情',
        titleLabel: '標題',
        conditionField: '狀況',
        notProvided: '未提供',
        readyToSaveChanges: '準備儲存您的變更？',
        readyToListBike: '準備刊登您的自行車？',
        clickThe: '點擊',
        saveChanges: '儲存變更',
        listBikeForSale: '刊登自行車出售',
        buttonToComplete: '按鈕完成',
        changesAppliedImmediately: '您的變更將立即生效',
        bikeVisibleImmediately: '您的自行車將立即對買家可見',

        // 步驟導航
        previous: '上一步',
        continue: '繼續',

        // Checkout 步驟標題
        stepTitles: {
            shippingAddress: '運送地址',
            paymentInfo: '付款資訊',
            orderReview: '訂單確認',
        },

        // 表單驗證訊息
        validation: {
            required: '此欄位為必填',
            invalidEmail: '請輸入有效的電子郵件地址',
            invalidPhone: '請輸入有效的電話號碼',
            invalidCardNumber: '請輸入有效的信用卡號碼',
            invalidCvv: '請輸入有效的安全碼',
            invalidPostalCode: '請輸入有效的郵遞區號',
            nameTooShort: '姓名至少需要2個字元',
            addressTooShort: '地址至少需要5個字元',
            cardNumberLength: '信用卡號碼必須為13-19位數字',
            cvvLength: '安全碼必須為3-4位數字',
            phoneNumberFormat: '請輸入有效的台灣手機號碼格式 (09xxxxxxxx)',
            postalCodeFormat: '請輸入有效的郵遞區號格式 (例如：100)',
        },

        // 預估配送
        estimatedDelivery: '預估到貨時間',

        // 自行車分類
        bikeCategories: {
            mountainBikes: '登山車',
            roadBikes: '公路車',
            hybridBikes: '混合車',
            cityBikes: '城市車',
            electricBikes: '電動車',
            kidsBikes: '兒童車',
            bmx: 'BMX',
        },

        // 運作方式
        howItWorks: '運作方式',
        howItWorksSubtitle: '您值得信賴的二手自行車買賣平台',
        listYourBike: '刊登您的自行車',
        listYourBikeDescription: '拍攝照片並為您的自行車建立詳細清單。包含買家想知道的所有相關詳細資訊。',
        connectWithBuyers: '與買家聯繫',
        connectWithBuyersDescription: '回應詢問、回答問題，並與對您的自行車感興趣的潛在買家安排會面。',
        completeTheSale: '完成銷售',
        completeTheSaleDescription: '與買家會面完成交易並交付自行車。在您的儀表板中將您的清單標記為已售出。',
        startSelling: '開始銷售',

        // 行動呼籲
        readyToFindBike: '準備好找到您的下一輛自行車了嗎？',
        joinCommunity: '加入我們的自行車愛好者社群，立即開始瀏覽數千輛二手自行車。',

        // 見證/推薦
        whatUsersSay: '使用者怎麼說',
        testimonialsSubtitle: '了解為什麼騎士們選擇我們的平台',

        // 首頁搜尋區塊
        advancedSearchOptions: '使用進階搜尋選項找到最適合的自行車',
        anyPrice: '任何價格',
        bicycleType: '自行車類型',
        allTypes: '所有類型',
        allBrands: '所有品牌',
        allLocations: '所有地點',

        // 價格範圍選項
        priceRangeOptions: {
            under10k: 'NT$ 10,000 以下',
            '10k-30k': 'NT$ 10,000 - 30,000',
            '30k-50k': 'NT$ 30,000 - 50,000',
            '50k-100k': 'NT$ 50,000 - 100,000',
            '100k-200k': 'NT$ 100,000 - 200,000',
            '200k-300k': 'NT$ 200,000 - 300,000',
            over300k: 'NT$ 300,000 以上',
        },

        // 自行車類型選項
        bicycleTypeOptions: {
            roadBike: '公路車',
            mountainBike: '登山車',
            hybridBike: '混合車',
            cityBike: '城市車',
            electricBike: '電動車',
            foldingBike: '摺疊車',
            gravelbike: '礫石車',
            kidsBike: '兒童車',
        },

        // 地點選項
        locationOptions: {
            taipei: '台北市',
            newTaipei: '新北市',
            taoyuan: '桃園市',
            taichung: '台中市',
            tainan: '台南市',
            kaohsiung: '高雄市',
            hsinchu: '新竹市',
            keelung: '基隆市',
        },

        // 品牌選項
        brandOptions: {
            giant: 'Giant',
            merida: 'Merida',
            specialized: 'Specialized',
            trek: 'Trek',
            cannondale: 'Cannondale',
            scott: 'Scott',
            bianchi: 'Bianchi',
            colnago: 'Colnago',
        },

        // 排序選項
        sortOptions: {
            newest: '最新發佈',
            oldest: '最舊發佈',
            priceHighToLow: '價格：高到低',
            priceLowToHigh: '價格：低到高',
            relevance: '相關性',
        },

        // 自行車條件
        conditions: {
            new: '全新',
            likeNew: '近全新',
            excellent: '極佳',
            veryGood: '良好',
            good: '可接受',
            fair: '需整修',
        },

        // 車況選項
        conditionOptions: {
            brandNew: '全新 - 從未使用',
            likeNew: '近全新 - 僅使用過幾次',
            excellent: '極佳 - 輕微磨損',
            good: '良好 - 符合年份的正常磨損',
            fair: '可接受 - 運作良好但有使用痕跡',
            poor: '不佳 - 需要維修',
        },

        // 品牌列表
        brands: {
            giant: 'Giant',
            trek: 'Trek',
            specialized: 'Specialized',
            cannondale: 'Cannondale',
            scott: 'Scott',
            merida: 'Merida',
            bianchi: 'Bianchi',
            cervelo: 'Cervélo',
            pinarello: 'Pinarello',
            colnago: 'Colnago',
            other: '其他',
        },

        // 城市列表
        cities: {
            taipei: '台北市',
            newTaipei: '新北市',
            taoyuan: '桃園市',
            taichung: '台中市',
            tainan: '台南市',
            kaohsiung: '高雄市',
            keelung: '基隆市',
            hsinchu: '新竹市',
            other: '其他',
        },

        // 錯誤訊息
        errorMessages: {
            loadFailed: '載入失敗',
            saveFailed: '儲存失敗',
            updateFailed: '更新失敗',
            deleteFailed: '刪除失敗',
            networkError: '網路錯誤',
            serverError: '伺服器錯誤',
            notFound: '找不到資源',
            unauthorized: '未授權',
            forbidden: '禁止存取',
            validationError: '驗證錯誤',
            unknownError: '未知錯誤',
        },

        // 成功訊息
        successMessages: {
            saveSuccess: '儲存成功',
            updateSuccess: '更新成功',
            deleteSuccess: '刪除成功',
            uploadSuccess: '上傳成功',
            sendSuccess: '發送成功',
            operationSuccess: '操作成功',
        },

        // 驗證訊息
        validationMessages: {
            required: '此欄位為必填',
            emailInvalid: '電子郵件格式不正確',
            passwordTooShort: '密碼長度不能少於 {{min}} 個字元',
            passwordsNotMatch: '密碼不一致',
            phoneInvalid: '手機號碼格式不正確',
            priceInvalid: '價格格式不正確',
            imageRequired: '請上傳至少一張圖片',
            titleRequired: '標題為必填項目',
            titleMinChar: '標題至少需要 {{min}} 個字元',
            priceMinValue: '價格必須大於 {{min}}',
            priceMaxValue: '價格不能超過 {{max}}',
            locationRequired: '地點為必填項目',
            conditionRequired: '車況為必填項目',
            brandRequired: '品牌為必填項目',
            modelRequired: '型號為必填項目',
            yearRequired: '年份為必填項目',
            frameSizeRequired: '車架尺寸為必填項目',
            descriptionMinChar: '描述至少需要 {{min}} 個字元',
            photosInvalidType: '照片檔案類型無效',
            photosMinRequired: '至少需要一張照片（新的或現有的）',
        },

        // Zod 驗證錯誤
        zodErrors: {
            titleMinChar: '標題至少需要 {{min}} 個字元',
            brandRequired: '品牌為必填項目',
            transmissionRequired: '變速系統為必填項目',
            yearRequired: '年份為必填項目',
            bicycleTypeRequired: '自行車類型為必填項目',
            frameSizeRequired: '車架尺寸為必填項目',
            descriptionMinChar: '描述至少需要 {{min}} 個字元',
            photosInvalidType: '照片檔案類型無效',
            photosMinRequired: '至少需要一張照片（新的或現有的）',
            conditionRequired: '車況為必填項目',
            priceRequired: '價格為必填項目',
            salePriceExceedsOriginal: '售出價格不能超過原始價格',
            locationRequired: '地點為必填項目',
            contactMethodRequired: '聯絡方式為必填項目',
        },

        // 出售自行車表單
        completeFormToList: '完成下方表單以刊登您的自行車出售',
        stepXOfY: '第 {{current}} 步，共 {{total}} 步',
        percentComplete: '已完成 {{percent}}%',

        // 出售自行車步驟標題
        sellStepTitles: {
            bikeDetails: '自行車詳情',
            photos: '照片',
            pricing: '定價',
            review: '審核',
        },

        // 表單驗證
        fillRequiredFields: '請填寫所有必填欄位',
        fillRequiredFieldsDescription: '您需要填寫所有標記為必填的欄位才能繼續',
        fillRequiredFieldsSubmit: '您需要填寫所有標記為必填的欄位才能提交',

        // 照片訊息
        noPhotosWillBeShown: '將不會顯示照片',
        bikePhoto: '自行車照片',
        photosAndCondition: '照片與狀況',
        photosUpTo10: '照片（最多10張）',
        clickToUploadPhotos: '點擊上傳照片',
        photoFormatsAndSize: 'JPG、PNG、WEBP 每張最大10MB',
        browseFiles: '瀏覽檔案',
        mainPhoto: '主要照片',
        managePhotosAndCondition: '管理照片與狀況',
        uploadPhotosAndCondition: '上傳照片並設定狀況',
        selectCondition: '選擇狀況',

        // 出售表單欄位
        provideBasicBikeInfo: '提供您自行車的基本資訊',
        listingTitle: '刊登標題',
        titlePlaceholder: '為您的自行車輸入描述性標題',
        brandPlaceholder: '搜尋品牌...',
        transmissionSystem: '變速系統',
        selectTransmissionSystem: '選擇變速系統...',
        selectYear: '選擇年份',
        selectFrameSize: '選擇車架尺寸',
        descriptionPlaceholder: '描述您自行車的狀況、改裝及其他相關細節...',
        pricingAndLocation: '定價與位置',
        setAskingPriceAndLocation: '設定您的期望價格和位置',
        askingPrice: '期望價格',
        pricePlaceholder: '輸入新台幣價格',
        priceDescription: '為您的自行車設定有競爭力的價格',
        originalPrice: '原始價格（選填）',
        originalPricePlaceholder: '輸入原始建議售價',
        originalPriceDescription: '全新時的原始建議售價（供參考）',
        salePrice: '售出價格',
        salePriceDescription: '您的期望價格不得超過原始價格',
        locationLabel: '位置',
        locationPlaceholder: '輸入您的位置',
        locationDescription: '自行車所在的城市或地區',
        contactMethodLabel: '偏好聯絡方式',
        inAppMessagingOption: '應用程式內訊息',
        emailOption: '電子郵件',
        phoneCallOption: '電話通話',
        textMessageOption: '簡訊',

        // 自行車類型
        roadbike: '公路車',
        mountainbike: '登山車',

        // 編輯模式翻譯
        bicycleIdMissing: '缺少自行車 ID',
        failedToLoadBicycleData: '載入自行車資料失敗',
        bicycleUpdatedSuccessfully: '自行車更新成功',
        failedToUpdateBicycle: '更新自行車失敗',
        loadingBicycleData: '正在載入自行車資料...',
        ensureAllFieldsFilledOut: '請確保填寫所有必填欄位',

        // 通用翻譯
        cancel: '取消',

        // Footer 區塊
        footer: {
            brandName: 'Ride Cycle',
            brandTagline: '二手自行車愛好者的交易平台，輕鬆買賣二手自行車',

            // 導航區塊
            navigation: {
                title: '網站導覽',
                home: '首頁',
                browseBikes: '瀏覽自行車',
                sellYourBike: '出售自行車',
            },

            // 帳戶區塊
            account: {
                title: '帳戶',
                signIn: '登入',
                createAccount: '註冊帳戶',
                myProfile: '個人資料',
                dashboard: '儀表板',
            },

            // 支援區塊
            support: {
                title: '客戶支援',
                helpCenter: '幫助中心',
                safetyTips: '安全提示',
                contactUs: '聯絡我們',
                privacyPolicy: '隱私政策',
            },

            // 版權聲明
            copyright: '版權所有',
            allRightsReserved: '保留所有權利',
        },

        // 管理員功能
        admin: {
            userManagement: '用戶管理',
            viewAndManageUsers: '查看和管理所有用戶',
            allUsers: '所有用戶',
            joinDate: '註冊日期',
            status: '狀態',
            adminDashboard: '管理員儀表板',
            adminAccess: '管理員專用功能',
            pendingApproval: '待審核',
            approved: '已審核',
            rejected: '已拒絕',
            totalUsers: '總用戶數',
            bicycles: '自行車',
            users: '用戶',
            viewDetails: '查看詳情',
            bicycleManagement: '自行車管理',
            reviewAndManage: '審核和管理自行車列表',
            pendingReview: '待審核',
            manageBicycles: '管理自行車',
            allMessages: '所有訊息',
            viewAndManageUserMessages: '查看和管理用戶訊息',
            viewMessages: '查看訊息',
            approve: '審核通過',
            reject: '拒絕',
            actions: '操作',
            sellerInformation: '賣家資訊',
            seller: '賣家',
            bicycleInformation: '自行車資訊',
            bicycleTitle: '自行車標題',
            adminActions: '管理員操作',
            approveThisBicycle: '審核通過此自行車',
            rejectThisBicycle: '拒絕此自行車',
            bicycleApproved: '自行車已審核通過',
            bicycleRejected: '自行車已被拒絕',
            approvalSuccess: '審核通過成功',
            rejectionSuccess: '拒絕成功',
            approvalError: '審核通過失敗',
            rejectionError: '拒絕失敗',
            confirmApproval: '確認審核通過',
            confirmRejection: '確認拒絕',
            approvalConfirmMessage: '您確定要審核通過這輛自行車嗎？',
            rejectionConfirmMessage: '您確定要拒絕這輛自行車嗎？',
            rejectionReason: '拒絕原因',
            rejectionReasonPlaceholder: '請輸入拒絕原因（可選）',
            unknownUser: '未知用戶',
            userId: '用戶ID',
            createdAt: '建立時間',
            updatedAt: '更新時間',
            noPhotos: '無照片',
            notFound: '找不到資料',
            backToList: '返回列表',
            approving: '審核中...',
            rejecting: '拒絕中...',
            noPendingBicycles: '目前沒有待審核的自行車',
            noDraftBicycles: '目前沒有草稿自行車',
            noAvailableBicycles: '目前沒有可用的自行車',
            noArchivedBicycles: '目前沒有封存的自行車',
            images: '圖片',
            image: '圖片',
            noImagesAvailable: '沒有可用的圖片',
            price: '價格',
            location: '位置',
            contactMethod: '聯絡方式',
            edit: '編輯',
            delete: '刪除',
            systemSettings: '系統設定',
            settings: '設定',
            manageSystemConfiguration: '管理系統配置',
        },

        viewOrders: '查看訂單',

        // 訂單相關
        orders: {
            title: '訂單管理',
            list: '訂單列表',
            detail: '訂單詳情',
            create: '建立訂單',
            history: '訂單歷史',
            purchases: '購買記錄',
            sales: '銷售記錄',

            // 狀態
            status: {
                pending: '待付款',
                processing: '處理中',
                shipped: '已出貨',
                delivered: '已送達',
                completed: '已完成',
                cancelled: '已取消',
                refunded: '已退款',
                expired: '已過期',
            },

            // 付款狀態
            paymentStatus: {
                pending: '待付款',
                awaiting_confirmation: '待確認',
                paid: '已付款',
                failed: '付款失敗',
                refunded: '已退款',
                expired: '付款超時',
            },

            // 欄位
            fields: {
                orderNumber: '訂單編號',
                status: '訂單狀態',
                paymentStatus: '付款狀態',
                totalPrice: '總金額',
                shippingCost: '運費',
                paymentMethod: '付款方式',
                shippingMethod: '配送方式',
                createdAt: '建立時間',
                updatedAt: '更新時間',
                buyer: '買家',
                seller: '賣家',
                bicycle: '自行車',
                paymentDeadline: '付款期限',
                remainingTime: '剩餘時間',
                trackingNumber: '追蹤號碼',
                notes: '備註',
            },

            // 動作
            actions: {
                view: '查看詳情',
                cancel: '取消訂單',
                pay: '立即付款',
                confirmDelivery: '確認收貨',
                rate: '評價',
                contact: '聯絡對方',
                retry: '重試',
            },

            // 訊息
            messages: {
                noOrders: '暫無訂單',
                noPurchases: '您還沒有購買記錄',
                noSales: '您還沒有銷售記錄',
                startShopping: '開始購物',
                startSelling: '出售自行車',
                loadingError: '載入訂單失敗',
                orderExpired: '此訂單已過期',
                orderCancelled: '此訂單已取消',
            },

            // 付款方式
            paymentMethods: {
                bank_transfer: '銀行轉帳',
                credit_card: '信用卡',
                paypal: 'PayPal',
                cash_on_delivery: '貨到付款',
            },

            // 配送方式
            // ... (其他翻譯)
            shippingMethods: {
                home_delivery: '宅配到府',
                convenience_store: '超商取貨',
                self_pickup: '面交自取',
            },
            timeUnits: {
                day: '{{count}} 天',
                hour: '{{count}} 小時',
                minute: '{{count}} 分鐘',
                second: '{{count}} 秒',
            },
        },

        // 付款相關
        paymentDeadlineCountdown: '付款期限倒數',

        // 通用詞彙
        no: '沒有',
        draft: '草稿',
        archived: '封存',
        pending: '待審核',
    },
}

export default zh
