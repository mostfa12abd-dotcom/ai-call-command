// Central translation dictionary. Add a key here to make a string translatable.
// Keep keys descriptive (e.g. `customers.totalCalls`) and grouped by surface.
//
// NOTE for the future: per-tenant customization (different labels, columns,
// or actions per client) should be layered on top of this dictionary — the
// resolved label is whichever the tenant override provides, otherwise t(key).

export type Language = "ar" | "en";

export const translations = {
  // Brand & generic chrome
  "brand.tagline": { en: "AI Call Center", ar: "مركز الاتصال الذكي" },
  "nav.workspace": { en: "Workspace", ar: "مساحة العمل" },
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.customers": { en: "Customer", ar: "العملاء" },
  "nav.settings": { en: "Settings", ar: "الإعدادات" },

  "header.subtitle": {
    en: "Real-time analytics and insights for your AI-powered call center.",
    ar: "تحليلات ورؤى لحظية لمركز الاتصال المدعوم بالذكاء الاصطناعي.",
  },

  "common.loading": { en: "Loading...", ar: "جارٍ التحميل..." },
  "common.search": { en: "Search", ar: "بحث" },
  "common.signIn": { en: "Sign in", ar: "تسجيل الدخول" },
  "common.signOut": { en: "Log out", ar: "تسجيل الخروج" },
  "common.back": { en: "Back", ar: "رجوع" },
  "common.viewProfile": { en: "View Profile", ar: "عرض الملف الشخصي" },
  "common.filter": { en: "Filter", ar: "تصفية" },
  "common.export": { en: "Export", ar: "تصدير" },
  "common.am": { en: "AM", ar: "صباحًا" },
  "common.pm": { en: "PM", ar: "مساءً" },
  "common.today": { en: "Today", ar: "اليوم" },
  "common.yesterday": { en: "Yesterday", ar: "أمس" },

  // Login page
  "login.welcome": { en: "Welcome back", ar: "أهلاً بعودتك" },
  "login.subtitle": {
    en: "Sign in to your AI Call Center dashboard",
    ar: "سجّل دخولك إلى لوحة مركز الاتصال الذكي",
  },
  "login.email": { en: "Email", ar: "البريد الإلكتروني" },
  "login.emailPlaceholder": { en: "you@company.com", ar: "you@company.com" },
  "login.password": { en: "Password", ar: "كلمة المرور" },
  "login.forgot": { en: "Forgot password?", ar: "نسيت كلمة المرور؟" },
  "login.remember": { en: "Remember me for 30 days", ar: "تذكرني لمدة 30 يوماً" },
  "login.or": { en: "OR", ar: "أو" },
  "login.continueGoogle": { en: "Continue with Google", ar: "المتابعة باستخدام Google" },
  "login.noAccount": { en: "Don't have an account?", ar: "لا تملك حساباً؟" },
  "login.createOne": { en: "Create one", ar: "أنشئ حساباً" },
  "login.heroTitle": { en: "Every call,\nunderstood.", ar: "كل اتصال،\nمفهوم." },
  "login.heroBody": {
    en: "Voxa transforms voice conversations into actionable insights — pickups, missed opportunities, satisfaction, and follow-ups, all in one place.",
    ar: "تحوّل Voxa المحادثات الصوتية إلى رؤى قابلة للتنفيذ — المكالمات المُجابة، والفرص الفائتة، ومستوى الرضا، والمتابعات، كلّها في مكان واحد.",
  },
  "login.live": { en: "Live · 1,284 calls handled today", ar: "مباشر · 1,284 مكالمة معالجة اليوم" },
  "login.statPickup": { en: "Pickup rate", ar: "نسبة الردّ" },
  "login.statDuration": { en: "Avg duration", ar: "متوسط المدة" },
  "login.statSatisfaction": { en: "Satisfaction", ar: "الرضا" },
  "login.footer": { en: "© 2026 Voxa AI · All rights reserved", ar: "© 2026 Voxa AI · جميع الحقوق محفوظة" },

  // Customers page
  "customers.title": { en: "Customers", ar: "العملاء" },
  "customers.allTitle": { en: "All Customers", ar: "كل العملاء" },
  "customers.allSubtitle": {
    en: "Unique callers across all your call campaigns.",
    ar: "المتصلون الفريدون عبر جميع حملاتك.",
  },
  "customers.searchPlaceholder": { en: "Search customers", ar: "ابحث عن عميل" },
  "customers.col.customer": { en: "Customer", ar: "العميل" },
  "customers.col.company": { en: "Company", ar: "الشركة" },
  "customers.col.phone": { en: "Phone", ar: "الهاتف" },
  "customers.col.totalCalls": { en: "Total Calls", ar: "إجمالي المكالمات" },
  "customers.col.lastCall": { en: "Last Call", ar: "آخر مكالمة" },
  "customers.col.actions": { en: "Actions", ar: "الإجراءات" },
  "customers.empty": { en: "No customers found for this account yet.", ar: "لا يوجد عملاء لهذا الحساب حتى الآن." },
  "customers.loading": { en: "Loading customers...", ar: "جارٍ تحميل العملاء..." },

  // Customer detail
  "customer.title": { en: "Customer", ar: "عميل" },
  "customer.back": { en: "Back to Customers", ar: "العودة إلى العملاء" },
  "customer.callHistory": { en: "Call History", ar: "سجل المكالمات" },
  "customer.callHistorySub": { en: "All calls from this customer", ar: "جميع المكالمات من هذا العميل" },
  "customer.loading": { en: "Loading customer...", ar: "جارٍ تحميل بيانات العميل..." },
  "customer.notFound": { en: "Customer not found.", ar: "لم يتم العثور على العميل." },
  "customer.since": { en: "Since", ar: "منذ" },
  "customer.stat.total": { en: "Total Calls", ar: "إجمالي المكالمات" },
  "customer.stat.pickups": { en: "Pickups", ar: "تم الرد" },
  "customer.stat.missed": { en: "Missed", ar: "فائتة" },
  "customer.empty": { en: "No calls found for this customer.", ar: "لا توجد مكالمات لهذا العميل." },
  "customer.callDefault": { en: "Call", ar: "مكالمة" },

  // Settings
  "settings.title": { en: "Settings", ar: "الإعدادات" },
  "settings.tab.account": { en: "Account", ar: "الحساب" },
  "settings.tab.appearance": { en: "Appearance", ar: "المظهر" },
  "settings.tab.language": { en: "Language", ar: "اللغة" },
  "settings.account.title": { en: "Account", ar: "الحساب" },
  "settings.account.subtitle": { en: "Manage your signed-in account.", ar: "إدارة الحساب الذي سجّلت الدخول به." },
  "settings.account.signedInAs": { en: "Signed in as", ar: "مسجّل الدخول باسم" },
  "settings.appearance.title": { en: "Appearance", ar: "المظهر" },
  "settings.appearance.subtitle": {
    en: "Choose how the dashboard looks to you.",
    ar: "اختر شكل اللوحة الذي يناسبك.",
  },
  "settings.appearance.light": { en: "Light", ar: "فاتح" },
  "settings.appearance.dark": { en: "Dark", ar: "داكن" },
  "settings.appearance.system": { en: "System", ar: "النظام" },
  "settings.language.title": { en: "Language / اللغة", ar: "اللغة / Language" },
  "settings.language.subtitle": {
    en: "Choose your preferred language. اختر لغتك المفضلة.",
    ar: "اختر لغتك المفضلة. Choose your preferred language.",
  },
  "settings.language.changed": { en: "Language changed", ar: "تم تغيير اللغة" },

  // Dashboard
  "dashboard.title": { en: "Dashboard", ar: "لوحة التحكم" },
  "dashboard.crumb.center": { en: "AI Voice Call Center", ar: "مركز الاتصال الصوتي الذكي" },
  "dashboard.kpi.totalCalls": { en: "Total Calls", ar: "إجمالي المكالمات" },
  "dashboard.kpi.avgDuration": { en: "Avg Call Duration", ar: "متوسط مدة المكالمة" },
  "dashboard.kpi.missed": { en: "Missed Calls", ar: "مكالمات فائتة" },
  "dashboard.kpi.recall": { en: "Recall AFM", ar: "إعادة اتصال" },
  "dashboard.kpi.appointments": { en: "Appointments", ar: "المواعيد" },
  "dashboard.kpi.totalTime": { en: "Total Call Time", ar: "إجمالي وقت المكالمات" },
  "dashboard.callsTitle": { en: "Recent Calls", ar: "المكالمات الأخيرة" },
  "dashboard.callsSubtitle": {
    en: "Click any row to open the full transcript.",
    ar: "اضغط على أي صف لعرض نص المكالمة الكامل.",
  },
  "dashboard.searchPlaceholder": { en: "Search calls", ar: "ابحث في المكالمات" },
  "dashboard.crumb.overview": { en: "Overview", ar: "نظرة عامة" },
  "dashboard.col.time": { en: "Time", ar: "الوقت" },
  "dashboard.loading": { en: "Loading calls...", ar: "جارٍ تحميل المكالمات..." },
  "dashboard.empty": { en: "No calls found for this account yet.", ar: "لا توجد مكالمات لهذا الحساب حتى الآن." },
} as const;

export type TranslationKey = keyof typeof translations;
