import React from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Info, Calculator, DollarSign, Percent } from 'lucide-react'
import { formatPriceNTD } from '@/utils/priceFormatter'
import { 
  calculateCommission, 
  formatCommissionRate, 
  isValidPrice,
  type CommissionCalculation 
} from '@/utils/commissionCalculations'

interface CommissionFeeDisplayProps {
  /**
   * 商品價格 (消費者支付金額)
   */
  price: number
  /**
   * 是否顯示為卡片容器
   */
  showCard?: boolean
  /**
   * 是否顯示詳細說明
   */
  showDetails?: boolean
  /**
   * 額外的樣式類名
   */
  className?: string
  /**
   * 自定義標題
   */
  title?: string
}

const CommissionFeeDisplay: React.FC<CommissionFeeDisplayProps> = ({
  price,
  showCard = true,
  showDetails = true,
  className = '',
  title,
}) => {
  const { t } = useTranslation()
  
  const calculation: CommissionCalculation = React.useMemo(() => {
    return calculateCommission(price)
  }, [price])

  const isValid = isValidPrice(price)

  const FeeBreakdownRow: React.FC<{
    label: string
    value: string | number
    isTotal?: boolean
    icon?: React.ReactNode
    highlight?: boolean
  }> = ({ label, value, isTotal = false, icon, highlight = false }) => (
    <div className={`flex justify-between items-center py-2 ${
      isTotal ? 'border-t pt-3' : ''
    } ${highlight ? 'bg-green-50 px-3 rounded-lg' : ''}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm ${
          isTotal ? 'font-semibold text-base' : 'text-gray-600'
        } ${highlight ? 'text-green-800 font-medium' : ''}`}>
          {label}
        </span>
      </div>
      <span className={`${
        isTotal ? 'font-bold text-lg text-green-600' : 'font-medium'
      } ${highlight ? 'text-green-800 text-lg' : ''}`}>
        {typeof value === 'number' ? formatPriceNTD(value) : value}
      </span>
    </div>
  )

  const content = (
    <div className={`space-y-4 ${className}`}>
      {/* 價格有效性檢查 */}
      {!isValid && price > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-800">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">請輸入有效的商品價格</span>
          </div>
        </div>
      )}

      {/* 無價格時的提示 */}
      {price <= 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Calculator className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">輸入商品價格後將顯示手續費計算</p>
        </div>
      )}

      {/* 手續費計算 */}
      {isValid && (
        <div className="space-y-3">
          {/* 手續費率說明 */}
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {t('platformCommissionRate', '平台手續費率')}
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {formatCommissionRate(calculation.commissionRate)}
            </Badge>
          </div>

          {/* 費用明細 */}
          <div className="space-y-1">
            <FeeBreakdownRow
              label={t('sellingPrice', '商品售價')}
              value={calculation.originalPrice}
              icon={<DollarSign className="w-4 h-4 text-gray-500" />}
            />
            
            <FeeBreakdownRow
              label={t('platformCommission', '平台手續費')}
              value={`-${formatPriceNTD(calculation.commissionFee)}`}
              icon={<Percent className="w-4 h-4 text-gray-500" />}
            />

            <Separator className="my-2" />
            
            <FeeBreakdownRow
              label={t('actualIncome', '實際收入')}
              value={calculation.sellerReceives}
              isTotal={true}
              highlight={true}
              icon={<DollarSign className="w-4 h-4 text-green-600" />}
            />
          </div>

          {/* 詳細說明 */}
          {showDetails && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">{t('commissionNote', '手續費說明')}</p>
                  <ul className="text-xs space-y-1 text-yellow-700">
                    <li>• {t('commissionExplanation1', '消費者支付的金額即為您設定的商品價格')}</li>
                    <li>• {t('commissionExplanation2', '平台會從售價中扣除手續費後撥款給您')}</li>
                    <li>• {t('commissionExplanation3', '手續費用於維護平台運營和交易安全保障')}</li>
                    <li>• {t('commissionExplanation4', '款項會在交易完成後7個工作天內撥款')}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 快速建議 */}
          {calculation.sellerReceives > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800 text-center">
                <span className="font-medium">
                  {t('youWillReceive', '您將收到')}: {formatPriceNTD(calculation.sellerReceives)}
                </span>
                <br />
                <span className="text-xs text-green-600">
                  {t('afterDeductingCommission', '(已扣除平台手續費)')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (!showCard) {
    return content
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-blue-600" />
          {title || t('commissionCalculation', '手續費計算')}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default CommissionFeeDisplay