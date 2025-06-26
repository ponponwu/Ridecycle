# Gemini 專案規則

本文件概述了與此專案互動時應遵循的規則和指南。請嚴格遵守。

## 1. 程式碼與慣例

*   **遵循現有程式碼:** 在編輯或新增程式碼時，您必須使用與現有程式碼庫相同的函式庫、框架和架構模式。
*   **元件結構:** 建立新元件時，請遵循現有元件的結構和模式。
*   **程式碼風格檢查與格式化:** 遵守專案的程式碼風格檢查 (linting) 和格式化規則。您可以在 `package.json` 和 `.eslintrc.js` 等檔案中找到這些規則。
*   **禁止新增依賴:** 請勿引入專案依賴（例如 `package.json`, `Gemfile`）中尚未列出的任何新函式庫或框架。

## 2. 檔案系統操作

*   **需要權限:** 在建立、刪除、移動或重新命名任何檔案或目錄之前，您必須請求並獲得明確的許可。
*   **禁止修改元數據:** 未經明確許可，請勿修改任何檔案或目錄的元數據（權限、所有權、時間戳、屬性等）。

## 3. 禁止操作的目錄

嚴禁在以下目錄中編輯、建立或刪除檔案：

*   **.git**
*   **.github**
*   **.vscode**, **.idea**, **.cursor**
*   **node_modules**
*   **vendor**
*   **tmp**
*   **log**
*   **public**
*   **coverage**
*   建置輸出目錄: **dist**, **build**, **.next**, **.nuxt**, **.svelte**, **.svelte-kit**
*   部署平台設定: **.vercel**, **.netlify**, **.firebase**, **.serverless**
*   CI/CD 目錄: **.circleci**, **.travis**, **.gitlab**, etc.
*   基礎設施即程式碼: **.terraform**, **.ansible**, etc.
*   快取目錄: **.pytest_cache**, **.mypy_cache**, **.ruff_cache**, **.eslintcache**, etc.
*   依賴管理器目錄: **.npm**, **.yarn**, **.pnpm**, **.bun**, **.gem**, **.bundle**
*   環境版本管理器目錄: **.rvm**, **.rbenv**, **.pyenv**, **.nvm**, etc.
*   環境變數檔案: **.env***

此列表是全面的。如有疑問，請先徵求許可。
