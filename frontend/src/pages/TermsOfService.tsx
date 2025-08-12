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

const TermsOfService: React.FC = () => {
    const { t } = useTranslation()

    const sections = [
        {
            id: 'acceptance',
            title: '條款接受',
            content: (
                <LegalSection>
                    <p className="text-lg text-gray-700 mb-4">
                        歡迎使用 Ride Cycle 二手自行車交易平台。使用我們的服務前，請仔細閱讀本服務條款。
                        使用本服務即表示您同意遵守本條款的所有規定。
                    </p>
                    
                    <LegalHighlight type="important">
                        如果您不同意本服務條款的任何內容，請立即停止使用本服務
                    </LegalHighlight>

                    <LegalSection title="條款適用範圍" type="info">
                        <LegalList items={[
                            'Ride Cycle 網站和行動應用程式',
                            '所有相關的功能和服務',
                            '用戶間的交易和互動',
                            '客戶支援和售後服務',
                            '任何透過本平台進行的活動'
                        ]} />
                    </LegalSection>

                    <LegalDefinition 
                        term="本服務"
                        definition="指 Ride Cycle 提供的二手自行車交易平台，包括網站、行動應用程式、相關功能和服務。"
                    />

                    <LegalDefinition 
                        term="用戶"
                        definition="指註冊並使用本服務的個人或實體，包括買家和賣家。"
                    />
                </LegalSection>
            )
        },
        {
            id: 'service-description',
            title: '服務說明',
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        Ride Cycle 是一個專門的二手自行車交易平台，為買賣雙方提供安全、便利的交易環境。
                    </p>

                    <LegalSection title="主要服務功能" type="info">
                        <LegalList items={[
                            '二手自行車商品刊登和展示',
                            '商品搜尋和篩選功能',
                            '買賣雙方即時通訊系統',
                            '安全的交易流程管理',
                            '付款和物流協調服務',
                            '用戶評價和信譽系統',
                            '客戶支援和爭議處理'
                        ]} />
                    </LegalSection>

                    <LegalSection title="服務性質" type="important">
                        <p className="mb-3 text-gray-700">重要說明：</p>
                        <LegalList items={[
                            'Ride Cycle 僅提供交易平台服務，不是商品的買家或賣家',
                            '我們不擁有平台上刊登的任何商品',
                            '交易的實際執行由買賣雙方自行負責',
                            '我們不保證交易的成功或商品品質',
                            '平台收取合理的服務費用和手續費'
                        ]} />
                    </LegalSection>

                    <LegalSection title="服務限制" type="warning">
                        <LegalList items={[
                            '僅限二手自行車及相關配件交易',
                            '禁止刊登新品或其他類型商品',
                            '不提供實體店面或倉儲服務',
                            '服務可用性可能因維護或技術問題而中斷',
                            '某些功能可能因地區而有所限制'
                        ]} />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'user-registration',
            title: '用戶註冊與帳戶',
            content: (
                <LegalSection>
                    <LegalSection title="註冊要求" type="info">
                        <p className="mb-3 text-gray-700">使用本服務需要註冊帳戶，您必須：</p>
                        <LegalList items={[
                            '年滿 18 歲或已獲得監護人同意',
                            '提供真實、準確、完整的個人資訊',
                            '維持資訊的及時更新',
                            '選擇強度足夠的密碼',
                            '同意接收必要的服務通知'
                        ]} />
                    </LegalSection>

                    <LegalSection title="帳戶責任" type="important">
                        <LegalList items={[
                            '您對帳戶的所有活動負完全責任',
                            '不得與他人共享帳戶憑證',
                            '發現帳戶被盜用時應立即通知我們',
                            '對於未經授權的使用造成的損失自行承擔',
                            '配合平台的身份驗證要求'
                        ]} />
                    </LegalSection>

                    <LegalSection title="帳戶終止" type="warning">
                        <p className="mb-3 text-gray-700">在以下情況下，我們可能暫停或終止您的帳戶：</p>
                        <LegalList items={[
                            '違反本服務條款或相關政策',
                            '提供虛假或誤導性資訊',
                            '從事欺詐、違法或有害活動',
                            '長期未使用帳戶（超過2年）',
                            '應監管機構或法院要求',
                            '其他威脅平台安全或用戶權益的行為'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="info">
                        您可以隨時要求刪除自己的帳戶，但未完成的交易可能受到影響
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'trading-rules',
            title: '交易規則',
            content: (
                <LegalSection>
                    <LegalSection title="賣家義務" type="important">
                        <LegalList items={[
                            '確保所售自行車的合法所有權',
                            '提供真實、準確的商品描述和照片',
                            '設定合理的價格和交易條件',
                            '及時回應買家詢問',
                            '按約定時間和方式交付商品',
                            '配合平台的驗證和審核要求',
                            '遵守相關的消費者保護法規'
                        ]} />
                    </LegalSection>

                    <LegalSection title="買家義務" type="important">
                        <LegalList items={[
                            '仔細閱讀商品描述和交易條件',
                            '進行善意的詢問和出價',
                            '按約定時間和方式付款',
                            '配合合理的交貨安排',
                            '對收到的商品進行及時檢查',
                            '提供客觀公正的評價',
                            '遵守平台的爭議處理程序'
                        ]} />
                    </LegalSection>

                    <LegalSection title="交易流程" type="info">
                        <LegalTable 
                            headers={['步驟', '說明', '責任方']}
                            rows={[
                                ['1. 商品刊登', '賣家上傳商品資訊和照片', '賣家'],
                                ['2. 商品瀏覽', '買家搜尋和查看商品', '買家'],
                                ['3. 詢問出價', '買家透過訊息系統詢問或出價', '買家'],
                                ['4. 價格協商', '雙方協商最終價格和條件', '雙方'],
                                ['5. 訂單確認', '在平台上確認交易詳情', '雙方'],
                                ['6. 付款處理', '買家透過平台付款系統付款', '買家'],
                                ['7. 商品交付', '賣家按約定方式交付商品', '賣家'],
                                ['8. 確認收貨', '買家確認收到商品並評價', '買家']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="禁止行為" type="warning">
                        <LegalList items={[
                            '刊登虛假或誤導性的商品資訊',
                            '銷售偷竊、仿冒或非法商品',
                            '繞過平台進行私下交易',
                            '操縱評價或信譽系統',
                            '騷擾、威脅或詐騙其他用戶',
                            '發布不當或違法內容',
                            '使用自動化工具或機器人'
                        ]} />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'payment-fees',
            title: '付款與費用',
            content: (
                <LegalSection>
                    <LegalSection title="付款方式" type="info">
                        <p className="mb-3 text-gray-700">我們支援以下付款方式：</p>
                        <LegalList items={[
                            '銀行轉帳（主要方式）',
                            '線上支付平台',
                            '貨到付款（特定地區）',
                            '第三方支付服務',
                            '數位錢包（未來推出）'
                        ]} />
                        
                        <LegalHighlight type="important" className="mt-3">
                            所有付款都必須透過平台提供的安全付款系統進行
                        </LegalHighlight>
                    </LegalSection>

                    <LegalSection title="服務費用結構" type="important">
                        <LegalTable 
                            headers={['服務項目', '費用標準', '收費對象', '說明']}
                            rows={[
                                ['商品刊登', '免費', '-', '基本刊登功能完全免費'],
                                ['交易手續費', '成交金額的 3%', '賣家', '成功交易後收取'],
                                ['付款處理費', '固定 NT$15 + 1.5%', '買家', '包含金流處理成本'],
                                ['物流協調費', 'NT$50-200', '買家', '依配送方式而定'],
                                ['爭議處理費', 'NT$200', '敗訴方', '僅在爭議處理時收取'],
                                ['提前提領手續費', 'NT$30', '賣家', '7天內提領收取']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="費用調整" type="warning">
                        <LegalList items={[
                            '我們有權調整服務費用結構',
                            '費用調整將提前 30 天通知',
                            '調整僅適用於新的交易',
                            '重大調整可能需要用戶重新同意條款',
                            '促銷期間可能提供費用優惠'
                        ]} />
                    </LegalSection>

                    <LegalSection title="退款政策" type="info">
                        <p className="mb-3 text-gray-700">在以下情況下可申請退款：</p>
                        <LegalList items={[
                            '賣家未能按約定交付商品',
                            '收到的商品與描述嚴重不符',
                            '商品存在重大安全缺陷',
                            '平台系統錯誤導致的重複付款',
                            '經爭議處理確認的賣家違約'
                        ]} />
                        
                        <p className="mt-3 text-sm text-gray-600">
                            退款將在確認後 5-10 個工作天內處理，手續費用不予退還。
                        </p>
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'content-policy',
            title: '內容政策',
            content: (
                <LegalSection>
                    <LegalSection title="允許的內容" type="info">
                        <LegalList items={[
                            '二手自行車（公路車、山地車、城市車等）',
                            '自行車配件和零件',
                            '騎行裝備和用品',
                            '真實的商品照片和描述',
                            '合理的使用痕跡說明',
                            '正當的價格資訊',
                            '禮貌和建設性的溝通內容'
                        ]} />
                    </LegalSection>

                    <LegalSection title="禁止的內容" type="warning">
                        <LegalList items={[
                            '新品或非二手商品',
                            '偷竊、仿冒或來源不明的商品',
                            '危險或非法的改裝品',
                            '虛假或誤導性的商品資訊',
                            '不雅、暴力或仇恨言論',
                            '垃圾訊息或廣告內容',
                            '侵犯他人知識產權的內容',
                            '個人聯絡資訊（應透過平台溝通）'
                        ]} />
                    </LegalSection>

                    <LegalSection title="內容審查" type="info">
                        <p className="mb-3 text-gray-700">我們實施多層次的內容審查機制：</p>
                        <LegalList items={[
                            '自動化系統初步篩選',
                            '人工審核可疑內容',
                            '用戶舉報和社群監督',
                            '定期的合規性檢查',
                            '機器學習不斷改進識別能力'
                        ]} />
                    </LegalSection>

                    <LegalSection title="違規處理" type="important">
                        <LegalTable 
                            headers={['違規程度', '首次處理', '重複違規', '嚴重違規']}
                            rows={[
                                ['輕微', '內容刪除 + 警告', '帳戶限制 7 天', '帳戶限制 30 天'],
                                ['中等', '帳戶限制 7 天', '帳戶限制 30 天', '永久停權'],
                                ['嚴重', '帳戶限制 30 天', '永久停權', '法律追究']
                            ]}
                        />
                    </LegalSection>

                    <LegalHighlight type="info">
                        我們鼓勵用戶積極舉報違規內容，共同維護平台環境
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'intellectual-property',
            title: '智慧財產權',
            content: (
                <LegalSection>
                    <LegalSection title="平台智慧財產權" type="important">
                        <p className="mb-3 text-gray-700">以下內容受到智慧財產權保護：</p>
                        <LegalList items={[
                            'Ride Cycle 商標、標誌和品牌識別',
                            '網站和應用程式的設計、介面和功能',
                            '專有的演算法和技術解決方案',
                            '資料庫結構和資料編輯',
                            '文案、圖片和多媒體內容',
                            '軟體程式碼和技術文件'
                        ]} />
                        
                        <LegalHighlight type="warning" className="mt-3">
                            未經授權不得複製、修改、分發或商業使用平台內容
                        </LegalHighlight>
                    </LegalSection>

                    <LegalSection title="用戶內容權利" type="info">
                        <p className="mb-3 text-gray-700">關於您上傳的內容：</p>
                        <LegalList items={[
                            '您保留對上傳內容的所有權',
                            '您授予我們使用、展示、分發的非專屬許可',
                            '許可範圍限於提供服務所必需',
                            '您可以隨時刪除自己上傳的內容',
                            '刪除帳戶時相關許可自動終止'
                        ]} />
                    </LegalSection>

                    <LegalSection title="侵權處理程序" type="warning">
                        <p className="mb-3 text-gray-700">如果您認為平台上有內容侵犯了您的智慧財產權：</p>
                        <LegalList 
                            type="ordered"
                            items={[
                                '發送詳細的侵權通知至 ip@ridecycle.com',
                                '提供您的身份證明和權利證明文件',
                                '明確指出涉嫌侵權的內容位置',
                                '我們將在 48 小時內初步回應',
                                '經確認後將移除侵權內容',
                                '通知被申訴的用戶並給予申辯機會',
                                '根據申辯結果決定最終處理方案'
                            ]} 
                        />
                    </LegalSection>

                    <LegalSection title="反覆侵權政策" type="important">
                        <p className="mb-3 text-gray-700">對於反覆侵權的用戶：</p>
                        <LegalList items={[
                            '我們實施「三次警告」政策',
                            '第三次確認侵權將永久停權',
                            '嚴重侵權可能立即停權',
                            '保留追究法律責任的權利',
                            '配合權利人的法律行動'
                        ]} />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'liability-limitation',
            title: '責任限制',
            content: (
                <LegalSection>
                    <LegalSection title="服務免責聲明" type="warning">
                        <p className="mb-3 text-gray-700">請注意以下重要免責聲明：</p>
                        <LegalList items={[
                            '平台按「現狀」提供，不提供任何明示或暗示保證',
                            '不保證服務的連續性、及時性或無錯誤',
                            '不對第三方內容的準確性或合法性負責',
                            '不保證交易的成功或商品品質',
                            '不對用戶之間的爭議承擔責任',
                            '不對外部連結的內容或服務負責'
                        ]} />
                    </LegalSection>

                    <LegalSection title="責任限制範圍" type="important">
                        <p className="mb-3 text-gray-700">在法律允許的最大範圍內，我們的責任限於：</p>
                        <LegalList items={[
                            '直接損害的賠償不超過相關服務費用',
                            '不承擔間接、偶然或後果性損害',
                            '不賠償利潤損失、資料遺失或業務中斷',
                            '總賠償責任不超過 NT$ 10,000',
                            '某些法律規定的責任無法排除或限制'
                        ]} />
                        
                        <LegalHighlight type="info" className="mt-3">
                            本條款不影響消費者依法享有的權利
                        </LegalHighlight>
                    </LegalSection>

                    <LegalSection title="用戶責任" type="important">
                        <p className="mb-3 text-gray-700">您同意對以下情況承擔全部責任：</p>
                        <LegalList items={[
                            '違反本服務條款造成的後果',
                            '侵犯他人權利的行為和損害',
                            '上傳或發布非法或有害內容',
                            '未經授權使用他人帳戶',
                            '在平台外進行的交易和糾紛',
                            '不當使用平台功能造成的損失'
                        ]} />
                    </LegalSection>

                    <LegalSection title="不可抗力" type="default">
                        <p className="mb-3 text-gray-700">因以下不可抗力因素導致的服務中斷，我們不承擔責任：</p>
                        <LegalList items={[
                            '自然災害（地震、颱風、水災等）',
                            '戰爭、恐怖攻擊或社會動亂',
                            '政府政策變更或法律禁令',
                            '網路基礎設施故障或攻擊',
                            '第三方服務提供商的問題',
                            '其他超出合理控制範圍的事件'
                        ]} />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'dispute-resolution',
            title: '爭議解決',
            content: (
                <LegalSection>
                    <LegalSection title="平台調解機制" type="info">
                        <p className="mb-3 text-gray-700">我們提供專業的爭議解決服務：</p>
                        <LegalList 
                            type="ordered"
                            items={[
                                '任一方可透過平台提交爭議申請',
                                '雙方應提供相關證據和說明',
                                '專業調解員進行客觀評估',
                                '嘗試促成雙方和解協議',
                                '無法和解時做出裁決建議',
                                '雙方可選擇接受或拒絕建議',
                                '嚴重違規案件可能移送法律處理'
                            ]} 
                        />
                    </LegalSection>

                    <LegalSection title="爭議處理時限" type="important">
                        <LegalTable 
                            headers={['處理階段', '時限', '說明']}
                            rows={[
                                ['申請提交', '交易後 30 天內', '超過期限不予受理'],
                                ['初步審查', '3 個工作天', '確認爭議是否符合受理條件'],
                                ['證據收集', '7 個工作天', '雙方提供相關證據材料'],
                                ['調解協商', '10 個工作天', '嘗試促成和解'],
                                ['裁決建議', '5 個工作天', '調解員提出解決方案'],
                                ['執行處理', '3 個工作天', '執行雙方接受的方案']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="常見爭議類型" type="default">
                        <LegalList items={[
                            '商品品質與描述不符',
                            '交易過程中的溝通誤解',
                            '付款或退款相關問題',
                            '交貨時間或物流糾紛',
                            '評價和信譽相關爭議',
                            '服務費用或手續費爭議',
                            '帳戶或技術功能問題'
                        ]} />
                    </LegalSection>

                    <LegalSection title="法律途徑" type="warning">
                        <p className="mb-3 text-gray-700">如果平台調解無法解決爭議：</p>
                        <LegalList items={[
                            '雙方可尋求法律救濟',
                            '適用中華民國法律',
                            '台北地方法院為第一審管轄法院',
                            '我們將配合合法的法律程序',
                            '保留追究濫用爭議機制者的權利'
                        ]} />
                    </LegalSection>

                    <LegalHighlight type="info">
                        我們鼓勵用戶優先使用平台調解機制，通常能更快速有效地解決問題
                    </LegalHighlight>
                </LegalSection>
            )
        },
        {
            id: 'termination',
            title: '服務終止',
            content: (
                <LegalSection>
                    <LegalSection title="用戶主動終止" type="info">
                        <p className="mb-3 text-gray-700">您可以隨時終止使用本服務：</p>
                        <LegalList items={[
                            '在帳戶設定中申請刪除帳戶',
                            '完成所有進行中的交易',
                            '處理未完成的爭議',
                            '確認無未付費用',
                            '下載需要保留的資料'
                        ]} />
                        
                        <p className="mt-3 text-gray-700">
                            帳戶刪除後，您的個人資料將按照隱私政策處理，但交易記錄可能因法律要求而保留。
                        </p>
                    </LegalSection>

                    <LegalSection title="平台終止服務" type="warning">
                        <p className="mb-3 text-gray-700">我們可能在以下情況終止服務：</p>
                        <LegalList items={[
                            '用戶嚴重或持續違反服務條款',
                            '涉嫌欺詐、洗錢或其他犯罪活動',
                            '威脅平台或其他用戶的安全',
                            '提供虛假資訊或拒絕身份驗證',
                            '濫用平台功能或進行惡意行為',
                            '長期未使用且無回應聯繫嘗試'
                        ]} />
                    </LegalSection>

                    <LegalSection title="終止程序" type="important">
                        <LegalTable 
                            headers={['終止類型', '通知期', '申訴機會', '資料處理']}
                            rows={[
                                ['用戶申請', '立即生效', '不適用', '按隱私政策處理'],
                                ['輕微違規', '7 天預告', '可申訴', '暫停存取'],
                                ['嚴重違規', '24 小時預告', '可申訴', '限制功能'],
                                ['極嚴重違規', '立即終止', '事後申訴', '立即停權'],
                                ['系統性風險', '立即終止', '事後審查', '凍結帳戶']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="終止後果" type="warning">
                        <p className="mb-3 text-gray-700">服務終止後：</p>
                        <LegalList items={[
                            '立即失去存取平台的權限',
                            '進行中的交易可能受影響',
                            '未完成的爭議將暫停處理',
                            '餘額將按政策處理（可能扣除費用）',
                            '相關條款的法律效力持續有效',
                            '可能影響信用記錄或評價'
                        ]} />
                    </LegalSection>

                    <LegalSection title="服務恢復" type="info">
                        <p className="mb-3 text-gray-700">在某些情況下，終止的帳戶可能恢復：</p>
                        <LegalList items={[
                            '證明違規指控不實',
                            '完成要求的改正措施',
                            '支付相關的恢復費用',
                            '同意接受額外的監督條件',
                            '經高級管理層審批同意'
                        ]} />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'applicable-law',
            title: '適用法律',
            content: (
                <LegalSection>
                    <LegalSection title="管轄法律" type="important">
                        <LegalList items={[
                            '本服務條款受中華民國法律管轄',
                            '適用消費者保護法相關規定',
                            '遵循個人資料保護法要求',
                            '符合電子商務相關法規',
                            '遵守公平交易法規範'
                        ]} />
                    </LegalSection>

                    <LegalSection title="管轄法院" type="info">
                        <LegalList items={[
                            '台北地方法院為第一審管轄法院',
                            '智慧財產權爭議由智慧財產法院管轄',
                            '小額爭議可向簡易庭聲請',
                            '消費爭議可向消保會申訴',
                            '國際爭議按相關協議處理'
                        ]} />
                    </LegalSection>

                    <LegalSection title="法律變更適應" type="default">
                        <p className="mb-3 text-gray-700">當相關法律發生變更時：</p>
                        <LegalList items={[
                            '我們將及時調整服務條款以符合新法',
                            '重大法律變更將提前通知用戶',
                            '必要時可能暫停部分服務功能',
                            '用戶應配合新的法律要求',
                            '持續使用視為接受調整後的條款'
                        ]} />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'terms-updates',
            title: '條款修改',
            content: (
                <LegalSection>
                    <LegalSection title="修改權利" type="important">
                        <p className="mb-3 text-gray-700">我們保留隨時修改本服務條款的權利：</p>
                        <LegalList items={[
                            '因應法律法規變更',
                            '改善服務品質和安全性',
                            '新增或調整服務功能',
                            '反映商業模式變化',
                            '處理實務中發現的問題',
                            '提高條款的清晰度'
                        ]} />
                    </LegalSection>

                    <LegalSection title="通知機制" type="info">
                        <LegalTable 
                            headers={['修改類型', '通知方式', '通知期間', '生效時間']}
                            rows={[
                                ['重大修改', '電子郵件 + 站內公告', '30天', '通知期滿後'],
                                ['一般修改', '站內公告', '14天', '公告後14天'],
                                ['技術性修改', '版本記錄', '7天', '更新後生效'],
                                ['法律要求修改', '立即公告', '立即', '立即生效'],
                                ['緊急安全修改', '事後通知', '事後7天', '立即生效']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="用戶選擇" type="warning">
                        <p className="mb-3 text-gray-700">當條款修改時，您可以選擇：</p>
                        <LegalList items={[
                            '接受新條款並繼續使用服務',
                            '在生效前終止帳戶並停止使用',
                            '針對重大修改提出意見或建議',
                            '要求客服說明修改的具體影響',
                            '尋求法律諮詢以了解權益變化'
                        ]} />
                        
                        <LegalHighlight type="important" className="mt-3">
                            繼續使用服務視為您接受修改後的服務條款
                        </LegalHighlight>
                    </LegalSection>

                    <LegalSection title="版本管理" type="default">
                        <LegalList items={[
                            '每個版本都有明確的版本號和日期',
                            '保存所有歷史版本供查詢',
                            '提供版本對比功能',
                            '記錄主要修改的原因和內容',
                            '確保用戶能夠追蹤條款變化'
                        ]} />
                    </LegalSection>
                </LegalSection>
            )
        },
        {
            id: 'contact-support',
            title: '聯繫與支援',
            content: (
                <LegalSection>
                    <p className="mb-4 text-gray-700">
                        如果您對本服務條款有任何疑問或需要協助，請透過以下方式聯繫我們：
                    </p>

                    <LegalContactInfo 
                        email="support@ridecycle.com"
                        phone="+886-2-1234-5678"
                        address="台北市信義區信義路五段7號35樓"
                    />

                    <LegalSection title="客戶服務" type="info">
                        <LegalTable 
                            headers={['服務類型', '聯繫方式', '服務時間', '回應時間']}
                            rows={[
                                ['一般諮詢', 'support@ridecycle.com', '24小時', '24小時內'],
                                ['技術問題', '線上客服系統', '週一至週五 9-18', '4小時內'],
                                ['交易爭議', 'disputes@ridecycle.com', '週一至週日 9-21', '48小時內'],
                                ['法律問題', 'legal@ridecycle.com', '週一至週五 9-17', '5工作天內'],
                                ['緊急事件', '客服電話', '24小時', '立即回應']
                            ]}
                        />
                    </LegalSection>

                    <LegalSection title="意見反饋" type="info">
                        <p className="mb-3 text-gray-700">我們歡迎您的意見和建議：</p>
                        <LegalList items={[
                            '服務改進建議：feedback@ridecycle.com',
                            '技術功能請求：features@ridecycle.com',
                            '安全問題報告：security@ridecycle.com',
                            '合作夥伴查詢：partners@ridecycle.com',
                            '媒體聯繫：press@ridecycle.com'
                        ]} />
                    </LegalSection>

                    <LegalSection title="法律聲明" type="important">
                        <p className="text-gray-700">
                            本服務條款構成您與 Ride Cycle 之間的完整協議，取代所有先前的口頭或書面約定。
                            如本條款的任何部分被認定無效，其餘部分仍然有效。我們未行使或延遲行使任何權利
                            不構成對該權利的放棄。
                        </p>
                    </LegalSection>
                </LegalSection>
            )
        }
    ]

    return (
        <LegalPageLayout
            title="服務條款"
            lastUpdated="2024年1月15日"
            sections={sections}
            searchEnabled={true}
        />
    )
}

export default TermsOfService