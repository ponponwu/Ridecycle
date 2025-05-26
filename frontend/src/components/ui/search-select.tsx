import * as React from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'

interface SearchSelectProps {
    options: Array<{
        value: string
        label: string
    }>
    value?: string
    onChange?: (value: string, option?: { value: string; label: string }) => void
    placeholder?: string
    className?: string
}

const SearchSelect = React.forwardRef<HTMLButtonElement, SearchSelectProps>(
    ({ options, value, onChange, placeholder = '選擇...', className }, ref) => {
        const [searchTerm, setSearchTerm] = React.useState('')
        const [isFocused, setIsFocused] = React.useState(false)
        const [isOpen, setIsOpen] = React.useState(false)
        const inputRef = React.useRef<HTMLInputElement>(null)
        const contentRef = React.useRef<HTMLDivElement>(null)

        const handleFocus = () => setIsFocused(true)
        const handleBlur = (e: React.FocusEvent) => {
            // 檢查相關目標是否在下拉選單內
            if (contentRef.current?.contains(e.relatedTarget as Node)) {
                // 如果點擊的是選單內的元素，保持輸入框焦點
                setTimeout(() => inputRef.current?.focus(), 0)
                return
            }
            setIsFocused(false)
        }

        // 當選單打開時，重置搜索條件
        React.useEffect(() => {
            if (!isOpen) {
                setSearchTerm('')
            }
        }, [isOpen])

        // 更安全的處理 focus 狀態
        React.useEffect(() => {
            // 只在選單打開且 inputRef 存在時嘗試設置 focus
            if (isOpen && inputRef.current) {
                // 使用 requestAnimationFrame 確保 DOM 已完全更新
                const focusTimeout = requestAnimationFrame(() => {
                    // 二次檢查確保 inputRef 仍然存在
                    if (inputRef.current) {
                        inputRef.current.focus()
                    }
                })

                return () => {
                    cancelAnimationFrame(focusTimeout)
                }
            }
        }, [isOpen])

        const filteredOptions = React.useMemo(() => {
            return options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
        }, [options, searchTerm])

        // 防止搜索輸入事件冒泡和關閉下拉選單
        const handleInputClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            e.preventDefault()
        }

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value)
        }

        return (
            <SelectPrimitive.Root
                value={value}
                onValueChange={(newValue) => {
                    const selectedOption = options.find((opt) => opt.value === newValue)
                    onChange?.(newValue, selectedOption)
                }}
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <SelectPrimitive.Trigger
                    ref={ref}
                    className={cn(
                        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
                        className
                    )}
                >
                    <SelectPrimitive.Value placeholder={placeholder} />
                    <SelectPrimitive.Icon asChild>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        ref={contentRef}
                        position="popper"
                        side="bottom"
                        sideOffset={5}
                        avoidCollisions={false}
                        className="relative z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                        onCloseAutoFocus={(e) => {
                            // 防止自動關閉焦點行為
                            e.preventDefault()
                        }}
                    >
                        <div className="sticky top-0 z-10 flex items-center border-b bg-popover px-3 py-2">
                            <Search className="mr-2 h-4 w-4 opacity-50" />
                            <input
                                ref={inputRef}
                                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
                                placeholder="搜尋..."
                                value={searchTerm}
                                onChange={handleInputChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                onClick={handleInputClick}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            />
                        </div>

                        <SelectPrimitive.Viewport className="p-1 max-h-60 overflow-y-auto">
                            {filteredOptions.length === 0 && searchTerm ? (
                                <div className="py-2 px-3 text-center text-sm text-muted-foreground">
                                    沒有找到符合的選項
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <SelectPrimitive.Item
                                        key={option.value}
                                        value={option.value}
                                        className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                            <SelectPrimitive.ItemIndicator>
                                                <Check className="h-4 w-4" />
                                            </SelectPrimitive.ItemIndicator>
                                        </span>
                                        <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                                    </SelectPrimitive.Item>
                                ))
                            )}
                        </SelectPrimitive.Viewport>

                        <div className="sticky bottom-0 z-10 flex items-center justify-center border-t bg-popover px-3 py-1.5 text-xs text-muted-foreground">
                            {searchTerm && filteredOptions.length > 0
                                ? `${filteredOptions.length} 個結果`
                                : searchTerm && filteredOptions.length === 0
                                ? `沒有結果`
                                : `${options.length} 個選項`}
                        </div>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
        )
    }
)

SearchSelect.displayName = 'SearchSelect'

export { SearchSelect }
