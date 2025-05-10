
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      "home": "Home",
      "login": "Login",
      "register": "Register",
      "logout": "Logout",
      "profile": "Profile",
      
      // Profile
      "personalCenter": "Personal Center",
      "personalInfo": "Personal Info",
      "myBicycles": "My Bicycles",
      "messages": "Messages",
      "accountSettings": "Account Settings",
      "youHaveNoMessages": "You don't have any messages",
      "messagesWillAppearHere": "New messages will appear here",
      "browseBicycles": "Browse Bicycles",
      "publishNewBike": "Publish New Bike",
      "youHaveNotPublishedAnyBikes": "You haven't published any bicycles",
      "startPublishingYourFirstBike": "Start publishing your first bicycle",
      "publishNow": "Publish Now",
      
      // Bicycle Details
      "location": "Location",
      "condition": "Condition",
      "brand": "Brand",
      "model": "Model",
      "year": "Year",
      "frameSize": "Frame Size",
      "wheelSize": "Wheel Size",
      "yearsOfUse": "Years of Use",
      "sellerInformation": "Seller Information",
      "contactSeller": "Contact Seller",
      "askQuestion": "Ask a question about this bicycle...",
      "sendMessage": "Send Message",
      "description": "Description",
      "makeOffer": "Make Offer",
      "yourOffer": "Your Offer",
      "submit": "Submit",
      
      // Search
      "findPerfectBike": "Find the perfect bike for your needs",
      "searchPlaceholder": "Search for brands, models, or keywords...",
      "search": "Search",
      "priceRange": "Price Range",
      "anyPrice": "Any Price",
      "bikeType": "Bike Type",
      "allTypes": "All Types",
      "allBrands": "All Brands",
      "allLocations": "All Locations",
      "advancedSearchOptions": "Advanced Search Options"
    }
  },
  zh: {
    translation: {
      // 導航
      "home": "首頁",
      "login": "登入",
      "register": "註冊",
      "logout": "登出",
      "profile": "個人資料",
      
      // 個人資料
      "personalCenter": "個人中心",
      "personalInfo": "個人資訊",
      "myBicycles": "我的自行車",
      "messages": "消息中心",
      "accountSettings": "帳戶設置",
      "youHaveNoMessages": "您沒有任何消息",
      "messagesWillAppearHere": "當您有新的消息時會顯示在這裡",
      "browseBicycles": "瀏覽自行車",
      "publishNewBike": "發佈新車",
      "youHaveNotPublishedAnyBikes": "您還沒有發佈任何自行車",
      "startPublishingYourFirstBike": "開始發佈您的第一輛自行車吧",
      "publishNow": "立即發佈",
      
      // 自行車詳情
      "location": "地點",
      "condition": "狀況",
      "brand": "品牌",
      "model": "型號",
      "year": "年份",
      "frameSize": "車架尺寸",
      "wheelSize": "輪胎尺寸",
      "yearsOfUse": "使用年限",
      "sellerInformation": "賣家資訊",
      "contactSeller": "聯絡賣家",
      "askQuestion": "詢問關於這輛自行車的問題...",
      "sendMessage": "發送訊息",
      "description": "描述",
      "makeOffer": "出價",
      "yourOffer": "您的出價",
      "submit": "提交",
      
      // 搜尋
      "findPerfectBike": "找到適合您的完美自行車",
      "searchPlaceholder": "搜尋品牌、型號或關鍵字...",
      "search": "搜尋",
      "priceRange": "價格範圍",
      "anyPrice": "任何價格",
      "bikeType": "自行車類型",
      "allTypes": "所有類型",
      "allBrands": "所有品牌",
      "allLocations": "所有地點",
      "advancedSearchOptions": "進階搜尋選項"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
