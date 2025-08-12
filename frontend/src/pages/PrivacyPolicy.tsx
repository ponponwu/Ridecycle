import React from 'react'
import { useTranslation } from 'react-i18next'
import LegalPageLayout from '@/components/legal/LegalPageLayout'
import { 
    LegalSection, 
    LegalList, 
    LegalHighlight, 
    LegalDefinition,
    LegalTable,
    LegalContactInfo 
} from '@/components/legal/LegalSection'

const PrivacyPolicy: React.FC = () => {
    const { t } = useTranslation()

    const sections = [
        {
            id: 'overview',
            title: t('privacy.sections.overview.title'),
            content: (
                <LegalSection>
                    <p className="text-lg text-gray-700 mb-4">
                        歡迎使用 Ride Cycle 二手自行車交易平台。我們深知您對個人資料隱私的關注，
                        因此制定了這份隱私政策來說明我們如何收集、使用、儲存和保護您的個人資訊。
                    </p>
                    
                    <LegalHighlight type="info">
                        本隱私政策適用於所有使用 Ride Cycle 服務的使用者
                    </LegalHighlight>

                    <p className="mt-4 text-gray-700">
                        使用我們的服務即表示您同意本隱私政策的內容。如果您不同意本政策的任何條款，
                        請停止使用我們的服務。
                    </p>

                    <LegalDefinition 
                        term="個人資料"
                        definition="指任何可以直接或間接識別特定個人身份的資訊，包括但不限於姓名、電子郵件地址、電話號碼、地址等。"
                    />
                </LegalSection>
            )
        },
        {
            id: 'data-collection',
            title: t('privacy.sections.dataCollection.title'),
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們會在以下情況下收集您的個人資料：
                    </p>

                    <LegalSection title="帳戶註冊資訊" type="info">
                        <LegalList items={[
                            '姓名或暱稱',
                            '電子郵件地址',
                            '密碼（加密儲存）',
                            '電話號碼（可選）',
                            '個人頭像（可選）'
                        ]} />
                    </LegalSection>

                    <LegalSection title="OAuth 第三方登入資訊" type="info">
                        <p className="mb-3">當您選擇使用第三方服務（如 Google、Facebook）登入時，我們可能收集：</p>
                        <LegalList items={[
                            '第三方平台提供的基本個人資料',
                            '公開的個人頭像',
                            '經您授權的電子郵件地址',
                            '第三方平台的使用者 ID（用於帳戶連結）'
                        ]} />
                    </LegalSection>

                    <LegalSection title="交易相關資訊" type="important">
                        <LegalList items={[
                            '銀行帳戶資訊（加密儲存）',
                            '交易記錄和訂單資訊',
                            '付款證明上傳',
                            '收貨地址和聯絡資訊',
                            '自行車詳細資訊和照片'
                        ]} />
                    </LegalSection>

                    <LegalSection title="使用行為資訊" type="default">
                        <LegalList items={[
                            'IP 地址和瀏覽器資訊',
                            '頁面造訪記錄',
                            '搜尋和篩選偏好',
                            '裝置資訊（僅技術性資訊）',
                            '使用時間和頻率統計'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="warning">
                        我們不會收集您的信用卡資訊，所有金融交易均透過第三方支付處理
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'data-usage',
            title: t('privacy.sections.dataUsage.title'),
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們使用您的個人資料僅限於以下合法目的：
                    </p>

                    <LegalSection title="服務提供與維護" type="info">
                        <LegalList items={[
                            '提供平台核心功能（會員註冊、商品列表、訊息系統）',
                            '處理交易和訂單管理',
                            '客戶支援和問題解決',
                            '平台安全監控和欺詐防護',
                            '系統維護和效能優化'
                        ]} />
                    </LegalSection>

                    <LegalSection title="個人化體驗" type="default">
                        <LegalList items={[
                            '根據您的偏好推薦相關商品',
                            '客製化搜尋結果',
                            '儲存您的收藏和關注清單',
                            '提供個人化的使用介面'
                        ]} />
                    </LegalSection>

                    <LegalSection title="溝通與通知" type="default">
                        <LegalList items={[
                            '發送交易相關通知',
                            '重要政策更新提醒',
                            '安全性提醒（如異常登入）',
                            '促銷活動資訊（可選擇取消訂閱）'
                        ]} />
                    </LegalSection>

                    <LegalSection title="法律合規" type="important">
                        <LegalList items={[
                            '遵循相關法律法規要求',
                            '配合司法機關合法調查',
                            '處理智慧財產權爭議',
                            '維護平台使用條款執行'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="important">
                        我們絕不會將您的個人資料販售給第三方或用於本政策未說明的用途
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'data-sharing',
            title: t('privacy.sections.dataSharing.title'),
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們承諾保護您的隱私，僅在以下必要情況下會與第三方分享您的資訊：
                    </p>

                    <LegalSection title="服務提供商" type="info">
                        <p className="mb-3">我們可能會與以下類型的第三方服務提供商分享必要資訊：</p>
                        <LegalList items={[
                            '雲端儲存服務提供商（用於資料備份）',
                            '電子郵件服務提供商（用於發送通知）',
                            '分析工具提供商（用於網站效能分析）',
                            '客戶支援工具提供商'
                        ]} />
                        <LegalHighlight type="info" className="mt-3">
                            所有第三方服務商都必須簽署資料保護協議
                        </LegalHighlight>
                    </LegalSection>

                    <LegalSection title="法律要求" type="warning">
                        <LegalList items={[
                            '遵守法院命令或法律程序',
                            '配合政府機關合法調查',
                            '保護我們的合法權益',
                            '防止詐欺或其他犯罪行為'
                        ]} />
                    </LegalSection>

                    <LegalSection title="業務轉讓" type="warning">
                        <p className="text-gray-700">
                            在公司合併、收購或出售的情況下，您的個人資料可能作為業務資產的一部分被轉讓。
                            我們會在此類情況發生前至少 30 天通知您，並確保新的擁有者遵守相同的隱私保護標準。
                        </p>
                    </LegalSection>

                    <LegalHighlight type="important">
                        我們不會出售、租賃或交換您的個人資料給行銷公司或廣告商
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'data-security',
            title: t('privacy.sections.dataSecurity.title'),
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們採用業界標準的安全措施來保護您的個人資料：
                    </p>

                    <LegalSection title="技術性保護措施" type="info">
                        <LegalList items={[
                            'HTTPS 加密傳輸（SSL/TLS）',
                            '資料庫加密儲存（AES-256）',
                            '定期安全漏洞掃描',
                            '存取控制和身份驗證',
                            '自動備份和災難恢復計畫'
                        ]} />
                    </LegalSection>

                    <LegalSection title="管理性保護措施" type="info">
                        <LegalList items={[
                            '員工資料保護培訓',
                            '最小權限原則（僅必要人員可存取資料）',
                            '定期安全政策審查',
                            '第三方安全認證稽核',
                            '資料存取日誌記錄'
                        ]} />
                    </LegalSection>

                    <LegalSection title="特殊資料保護" type="important">
                        <LegalTable 
                            headers={['資料類型', '保護措施', '存取限制']}
                            rows={[
                                ['密碼', 'bcrypt 雜湊加密', '僅本人可修改'],
                                ['銀行資訊', 'AES-256 加密', '僅財務部門存取'],
                                ['OAuth 令牌', '安全儲存 + 定期刷新', '系統自動管理'],
                                ['交易記錄', '不可篡改日誌', '稽核人員只讀存取']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="安全事件處理" type="warning">
                        <p className="mb-3 text-gray-700">
                            如果發生資料外洩或安全事件，我們將：
                        </p>
                        <LegalList items={[
                            '在 72 小時內評估事件影響範圍',
                            '立即採取措施防止進一步損失',
                            '在確認後 7 天內通知受影響的使用者',
                            '配合相關機關調查',
                            '公開透明地報告事件處理結果'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="warning">
                        儘管我們採用最佳的安全實踐，但沒有任何系統是 100% 安全的。請您也要保護好自己的帳戶資訊。
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'user-rights',
            title: t('privacy.sections.userRights.title'),
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        根據個人資料保護相關法規，您享有以下權利：
                    </p>

                    <LegalSection title="資料存取權" type="info">
                        <p className="mb-3 text-gray-700">您有權要求我們提供我們所持有關於您的個人資料副本，包括：</p>
                        <LegalList items={[
                            '帳戶基本資訊',
                            '交易和訂單歷史記錄',
                            '個人偏好設定',
                            '資料處理目的和法律依據',
                            '資料分享對象（如適用）'
                        ]} />
                    </LegalSection>

                    <LegalSection title="資料修正權" type="info">
                        <LegalList items={[
                            '更正不正確或過時的個人資料',
                            '補充不完整的資訊',
                            '更新聯絡方式和偏好設定'
                        ]} />
                        <p className="mt-3 text-gray-700">
                            大部分資料可以直接在您的帳戶設定中修改，特殊情況請聯繫客服。
                        </p>
                    </LegalSection>

                    <LegalSection title="資料刪除權（被遺忘權）" type="important">
                        <p className="mb-3 text-gray-700">在以下情況下，您可以要求我們刪除您的個人資料：</p>
                        <LegalList items={[
                            '資料不再必要用於原始收集目的',
                            '您撤回同意且沒有其他法律依據',
                            '資料被非法處理',
                            '為履行法律義務需要刪除'
                        ]} />
                        
                        <LegalHighlight type="warning" className="mt-3">
                            注意：法律要求保留的交易記錄可能無法立即刪除
                        </LegalHighlight>
                    </LegalSection>

                    <LegalSection title="資料可攜權" type="info">
                        <p className="mb-3 text-gray-700">您有權以結構化、常用且機器可讀的格式取得您的個人資料，包括：</p>
                        <LegalList items={[
                            'JSON 格式的帳戶資料匯出',
                            '可讀取的交易歷史報告',
                            '上傳的圖片和文件',
                            '個人偏好和設定匯出'
                        ]} />
                    </LegalSection>

                    <LegalSection title="限制處理權" type="default">
                        <p className="mb-3 text-gray-700">在特定情況下，您可以要求我們限制對您個人資料的處理：</p>
                        <LegalList items={[
                            '對資料正確性提出爭議期間',
                            '處理非法但您不要求刪除',
                            '我們不再需要但您需要用於法律主張',
                            '對處理提出異議等待驗證期間'
                        ]} />
                    </LegalSection>

                    <LegalSection title="如何行使權利" type="important">
                        <p className="mb-3 text-gray-700">要行使上述權利，請：</p>
                        <LegalList 
                            type="ordered"
                            items={[
                                '登入您的帳戶並前往「隱私設定」',
                                '或發送電子郵件至 privacy@ridecycle.com',
                                '提供足夠資訊讓我們驗證您的身份',
                                '明確說明您要行使哪項權利',
                                '我們將在 30 天內回應您的請求'
                            ]} 
                        />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'cookies',
            title: t('privacy.sections.cookies.title'),
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們使用 Cookies 和類似技術來改善您的使用體驗和提供個人化服務。
                    </p>

                    <LegalDefinition 
                        term="Cookies"
                        definition="小型文字檔案，由網站儲存在您的瀏覽器中，用於記住您的偏好和改善網站功能。"
                    />

                    <LegalSection title="我們使用的 Cookies 類型" type="info">
                        <LegalTable 
                            headers={['類型', '目的', '期限', '可否停用']}
                            rows={[
                                ['必要性 Cookies', '登入狀態、購物車、安全性', '會話期間', '否'],
                                ['功能性 Cookies', '語言偏好、介面設定', '1年', '是'],
                                ['效能 Cookies', '使用統計、錯誤報告', '2年', '是'],
                                ['行銷 Cookies', '個人化廣告（目前未使用）', '-', '是']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="第三方 Cookies" type="warning">
                        <p className="mb-3 text-gray-700">我們的網站可能包含以下第三方 Cookies：</p>
                        <LegalList items={[
                            'Google Analytics（匿名統計分析）',
                            'OAuth 提供商（Google、Facebook 登入）',
                            '客戶支援工具',
                            'CDN 服務提供商'
                        ]} />
                    </LegalSection>

                    <LegalSection title="管理 Cookies" type="default">
                        <p className="mb-3 text-gray-700">您可以透過以下方式管理 Cookies：</p>
                        <LegalList items={[
                            '瀏覽器設定中停用或刪除 Cookies',
                            '使用隱私瀏覽模式',
                            '安裝 Cookies 管理擴充功能',
                            '在我們的網站 Cookie 偏好中心設定'
                        ]} />
                        
                        <LegalHighlight type="warning" className="mt-3">
                            停用必要性 Cookies 可能會影響網站正常功能
                        </LegalHighlight>
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'data-retention',
            title: t('privacy.sections.dataRetention.title'),
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們僅在必要期間內保留您的個人資料，具體保留期間如下：
                    </p>

                    <LegalSection title="帳戶資料保留政策" type="info">
                        <LegalTable 
                            headers={['資料類型', '保留期間', '刪除條件']}
                            rows={[
                                ['基本個人資料', '帳戶存在期間', '用戶主動刪除帳戶後 30 天'],
                                ['交易記錄', '5年', '法律要求的最短保留期'],
                                ['訊息記錄', '3年', '最後活動後 3 年'],
                                ['登入日誌', '1年', '安全稽核需要'],
                                ['Cookie 資料', '依設定期限', '瀏覽器清理或到期'],
                                ['行銷同意記錄', '同意撤回後3年', '證明合規處理']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="自動刪除機制" type="info">
                        <p className="mb-3 text-gray-700">我們實施了自動資料清理機制：</p>
                        <LegalList items={[
                            '定期檢查並刪除過期的臨時資料',
                            '自動清理未驗證的註冊資料（30天後）',
                            '移除長期未使用的帳戶快取資料',
                            '清理過期的密碼重設令牌',
                            '自動備份資料也遵循相同的保留政策'
                        ]} />
                    </LegalSection>

                    <LegalSection title="法律保留例外" type="warning">
                        <p className="mb-3 text-gray-700">在以下情況下，我們可能需要延長資料保留期間：</p>
                        <LegalList items={[
                            '進行中的法律訴訟或調查',
                            '未解決的客戶服務問題',
                            '稅務稽核要求',
                            '反洗錢和反詐騙調查',
                            '其他法律義務要求'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="info">
                        您可以隨時要求提前刪除您的個人資料，我們會在法律允許的範圍內配合處理
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'international-transfers',
            title: '國際資料傳輸',
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們主要在台灣境內處理您的個人資料，但某些情況下可能涉及跨境傳輸：
                    </p>

                    <LegalSection title="可能的國際傳輸情況" type="info">
                        <LegalList items={[
                            '使用境外雲端服務提供商進行資料備份',
                            'OAuth 第三方登入服務（Google、Facebook）',
                            '國際客戶支援和技術服務',
                            '跨國業務合作夥伴資料共享',
                            '法律程序要求的資料提供'
                        ]} />
                    </LegalSection>

                    <LegalSection title="傳輸保護措施" type="important">
                        <p className="mb-3 text-gray-700">對於任何國際資料傳輸，我們確保：</p>
                        <LegalList items={[
                            '接收方國家或地區具有適當的資料保護水準',
                            '簽署標準契約條款（SCC）或具備適當保護措施',
                            '定期評估傳輸的必要性和風險',
                            '確保傳輸符合台灣個人資料保護法要求',
                            '在可能的情況下採用資料最小化原則'
                        ]} />
                    </LegalSection>

                    <LegalSection title="主要服務提供商位置" type="info">
                        <LegalTable 
                            headers={['服務類型', '提供商位置', '保護措施']}
                            rows={[
                                ['雲端儲存', '美國/歐盟', 'GDPR 合規 + SCC'],
                                ['OAuth 服務', '美國', '官方隱私政策保護'],
                                ['分析工具', '美國', '資料匿名化處理'],
                                ['電子郵件服務', '美國', '加密傳輸 + SCC']
                            ]}
                        />
                    </LegalSection>

                    <LegalHighlight type="info">
                        您有權了解您的資料被傳輸到哪些國家，以及相關的保護措施
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'minors',
            title: '未成年人保護',
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們特別重視未成年人的隱私保護，並採取額外的保護措施：
                    </p>

                    <LegalSection title="年齡限制政策" type="important">
                        <LegalList items={[
                            '本服務主要面向 18 歲以上成年人',
                            '16-18 歲用戶需要監護人同意方可使用',
                            '16 歲以下用戶不得註冊使用本服務',
                            '我們有權隨時要求驗證用戶年齡',
                            '發現未達年齡要求的帳戶將被暫停或刪除'
                        ]} />
                    </LegalSection>

                    <LegalSection title="未成年人資料處理" type="warning">
                        <p className="mb-3 text-gray-700">對於 16-18 歲的用戶，我們將：</p>
                        <LegalList items={[
                            '要求提供監護人同意證明',
                            '限制可收集的個人資料類型',
                            '提供額外的隱私保護措施',
                            '定期審查帳戶活動的適當性',
                            '優先處理相關的隱私權利請求'
                        ]} />
                    </LegalSection>

                    <LegalSection title="家長或監護人權利" type="info">
                        <p className="mb-3 text-gray-700">如果您是未成年用戶的家長或監護人，您有權：</p>
                        <LegalList items={[
                            '查看和修正子女的個人資料',
                            '要求刪除子女的帳戶和資料',
                            '撤回對資料處理的同意',
                            '限制子女可使用的服務功能',
                            '接收子女帳戶活動的通知'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="important">
                        如果您發現有未達年齡要求的用戶使用我們的服務，請立即聯繫我們
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'policy-updates',
            title: '政策更新',
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        我們可能會不時更新本隱私政策，以反映服務變更、法律要求或最佳實踐的改進：
                    </p>

                    <LegalSection title="更新通知機制" type="info">
                        <LegalList items={[
                            '重大變更：提前 30 天通過電子郵件通知',
                            '一般更新：在網站上發布公告至少 14 天',
                            '法律要求的緊急變更：立即生效並通知',
                            '在政策頁面頂部顯示最後更新日期',
                            '維護政策變更歷史記錄供查閱'
                        ]} />
                    </LegalSection>

                    <LegalSection title="用戶回應選擇" type="important">
                        <p className="mb-3 text-gray-700">當政策更新時，您可以選擇：</p>
                        <LegalList items={[
                            '繼續使用服務即表示接受新政策',
                            '在生效前停止使用服務',
                            '要求刪除帳戶和個人資料',
                            '聯繫我們討論具體關切事項',
                            '行使您的資料保護權利'
                        ]} />
                    </LegalSection>

                    <LegalSection title="版本控制" type="info">
                        <p className="mb-3 text-gray-700">我們維護政策版本記錄，包括：</p>
                        <LegalList items={[
                            '每個版本的發布日期和生效日期',
                            '主要變更內容摘要',
                            '變更的法律依據或業務原因',
                            '舊版本的歸檔（可應要求提供）',
                            '相關用戶通知的記錄'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="info">
                        建議您定期查閱本隱私政策，以了解我們如何保護您的資訊
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'contact',
            title: '聯絡我們',
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        如果您對本隱私政策有任何疑問、建議或需要行使您的資料保護權利，請透過以下方式聯繫我們：
                    </p>

                    <LegalContactInfo 
                        email="privacy@ridecycle.com"
                        phone="+886-2-1234-5678"
                        address="台北市信義區信義路五段7號35樓"
                    />

                    <LegalSection title="聯繫指南" type="info">
                        <LegalList items={[
                            '一般隱私問題：使用上述電子郵件',
                            '緊急資料安全事件：請同時致電客服',
                            '法律程序相關：請以書面形式寄送至公司地址',
                            '資料保護權利行使：請提供身份證明',
                            '我們將在 30 天內回應您的查詢'
                        ]} />
                    </LegalSection>

                    <LegalSection title="資料保護專員" type="info">
                        <p className="text-gray-700 mb-3">
                            我們指派了專責的資料保護專員來處理隱私相關事務：
                        </p>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <p className="font-medium text-emerald-800">資料保護專員</p>
                            <p className="text-sm text-gray-700 mt-1">
                                電子郵件：dpo@ridecycle.com<br />
                                職責：監督資料保護合規性、處理隱私投訴、提供資料保護建議
                            </p>
                        </div>
                    </LegalSection>

                    <LegalHighlight type="important">
                        您也有權向個人資料保護委員會或相關監管機構投訴我們的資料處理行為
                    </LegalHighlight>
                </LegalSection>
            )
        }
    ]

    return (
        <LegalPageLayout
            title="隱私政策"
            lastUpdated="2024年1月15日"
            sections={sections}
            searchEnabled={true}
        />
    )
}

export default PrivacyPolicy