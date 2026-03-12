import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  PlusCircle, 
  Settings, 
  Printer, 
  MessageCircle,
  Camera,
  Search,
  CheckCircle,
  X,
  Video,
  Trash2,
  Save,
  Plus,
  AlertTriangle,
  LogOut,
  Image as ImageIcon,
  Share,
  Info,
  MapPin,
  Bell,
  Clock as ClockIcon,
  TrendingUp,
  FileText,
  Edit,
  CalendarPlus,
  ChevronRight,
  ChevronLeft,
  Shield,
  Copy,
  Download,
  Upload,
  ArrowRight,
  ArrowLeft,
  Wallet,
  DollarSign,
  Calculator
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mrakby-studio-app';

// --- Default Settings (Fallback) ---
const DEFAULT_SETTINGS = {
  packages: [
    { id: 'p1', name: 'Wedding Basic', price: 5000 },
    { id: 'p2', name: 'Wedding Premium', price: 10000 },
    { id: 'p3', name: 'Engagement', price: 6000 },
    { id: 'p4', name: 'Casual', price: 3000 },
    { id: 'p5', name: 'Henna', price: 4000 }
  ],
  addons: [
    { id: 'a1', name: 'Drone Video', price: 1500 },
    { id: 'a2', name: 'Luxury Album', price: 2000 },
    { id: 'a3', name: 'Extra Photos', price: 1000 },
    { id: 'a4', name: 'Highlight Video', price: 2500 }
  ],
  videoServices: [
    { id: 'v1', name: 'كاميرا فردى', subtext: 'بليل فقط', price: 1500 },
    { id: 'v2', name: 'كاميرا مزمار', subtext: 'طول اليوم بدون عروسه', price: 2000 },
    { id: 'v3', name: 'وحدة ميكسر كامله', subtext: '', price: 3000 },
    { id: 'v4', name: 'وحدة ميكسر مزمار', subtext: 'طول اليوم من بعد الظهر', price: 3500 }
  ],
  videoAddons: [
    { id: 'va1', name: 'شاشه عرض', price: 1000 },
    { id: 'va2', name: 'درون', price: 1500 },
    { id: 'va4', name: 'كاميرا كرين', price: 2500 }
  ],
  locations: ['Wave', 'Amazon', 'River', 'Green Land', 'Vibes', 'Atlantis', 'آخر'],
  casualLocations: ['Wave', 'Amazon', 'River', 'Green Land', 'Vibes', 'Atlantis', 'المنصورة الجديدة', 'آخر'],
  sessionTypes: ['زفاف', 'خطوبة', 'كاجول', 'حنة', 'كتب كتاب', 'فوتوغرافي', 'آخر'],
  quickMessages: [
    { id: 'qm1', title: 'تذكير بموعد التصوير', text: 'أهلاً بك أستاذ/ة [الاسم]،\nنود تذكيركم بموعد التصوير الخاص بكم غداً بتاريخ [التاريخ].\nنرجو الالتزام بالمواعيد المحددة للحصول على أفضل نتيجة.\nفي انتظاركم! 📸✨' },
    { id: 'qm2', title: 'تذكير بالمبلغ المتبقي', text: 'أهلاً بك أستاذ/ة [الاسم]،\nنأمل أن تكونوا بخير.\nنود تذكيركم بأن المبلغ المتبقي لحسابكم هو [المتبقي] ج.م.\nيمكنكم التواصل معنا لأي استفسار.' },
    { id: 'qm3', title: 'استلام شغل الفيديو (مونتاج)', text: 'أهلاً بك أستاذ/ة [الاسم]،\nيسعدنا إبلاغكم أن مونتاج الفيديو الخاص بمناسبتكم جاهز للاستلام الآن! 🎥🎉\nبرجاء إحضار فلاشة بمساحة مناسبة لاستلام النسخة الخاصة بكم.' },
    { id: 'qm4', title: 'تجهيز صور الألبوم (فوتوغرافيا)', text: 'أهلاً بك أستاذ/ة [الاسم]،\nلقد تم الانتهاء من فرز ومعالجة الصور الخاصة بكم. 📸\nيرجى تشريفنا في الاستوديو لاختيار الصور التي سيتم طباعتها في الألبوم.' },
    { id: 'qm5', title: 'تهنئة بالزفاف', text: 'ألف مبروك أستاذ/ة [الاسم] وعروستنا [العروسة]! 🎉\nكان من دواعي سرورنا توثيق لحظاتكم السعيدة ونتمنى لكم حياة مليئة بالفرح والسعادة. 💍✨' },
    { id: 'qm6', title: 'طلب تقييم (فيد باك)', text: 'أهلاً بك أستاذ/ة [الاسم]،\nكان من دواعي سرورنا التعامل معكم. 📸\nرأيكم يهمنا جداً لتطوير خدماتنا، يسعدنا أن تشاركونا تقييمكم لتجربتكم معنا. 🙏' }
  ]
};

const LOGO_URL = "https://placehold.co/600x600/111/D4AF37?text=Studio";

// دالة مساعدة لتنظيف الكائنات من القيم غير المعرفة (undefined)
const removeUndefined = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
};

export default function App() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentView, setCurrentView] = useState('dashboard');
  const [contractToPrint, setContractToPrint] = useState(null);
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [initialBookingDate, setInitialBookingDate] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trialInfo, setTrialInfo] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false); // حالة جولة الشرح

  // --- Auth & Data Fetching ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // إظهار نافذة الشرح إذا كان المستخدم يفتح النظام لأول مرة
    if (!isAdmin) {
      const hasSeenTour = localStorage.getItem(`mrakby_tour_seen_${user.uid}`);
      if (!hasSeenTour) {
        setShowOnboarding(true);
      }
    }

    const bookingsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'bookings');
    const unsubBookings = onSnapshot(bookingsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setBookings(data);
    }, (error) => {
      console.error("Firestore error:", error);
      showToast("حدث خطأ في جلب الحجوزات", "error");
    });

    const expensesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
    const unsubExpenses = onSnapshot(expensesRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(data);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    }, (error) => console.error("Settings fetch error:", error));

    return () => {
      unsubBookings();
      unsubExpenses();
      unsubSettings();
    };
  }, [user, isAdmin]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigateToNewBooking = (dateStr = '') => {
    setInitialBookingDate(dateStr);
    setCurrentView('new');
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutConfirm(false);
      showToast("تم تسجيل الخروج بنجاح");
    } catch (error) {
      console.error("Logout Error:", error);
      showToast("حدث خطأ أثناء تسجيل الخروج", "error");
    }
  };

  const finishOnboarding = () => {
    if (user) {
      localStorage.setItem(`mrakby_tour_seen_${user.uid}`, 'true');
    }
    setShowOnboarding(false);
  };

  // --- دالة استيراد النسخة الاحتياطية ---
  const handleImportData = async (importedData) => {
    try {
      if (importedData.settings) {
        if (isFirebaseActiveState && user) {
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config'), importedData.settings);
        } else {
          setSettings(importedData.settings);
          localStorage.setItem('mrakby_settings', JSON.stringify(importedData.settings));
        }
      }

      if (importedData.bookings && Array.isArray(importedData.bookings)) {
        if (isFirebaseActiveState && user) {
          // يتم حفظ الحجوزات في قاعدة البيانات
          for (const b of importedData.bookings) {
             const cleanB = removeUndefined(b);
             await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'bookings', cleanB.id), cleanB);
          }
        } else {
          setBookings(importedData.bookings);
          localStorage.setItem('mrakby_bookings', JSON.stringify(importedData.bookings));
        }
      }
      showToast("تم استيراد البيانات بنجاح!", "success");
    } catch (err) {
      console.error("Import error:", err);
      showToast("حدث خطأ أثناء استيراد البيانات", "error");
    }
  };

  // Use local storage variables for non-firebase backup compatibility check
  const isFirebaseActiveState = true;

  if (contractToPrint) {
    return <ContractPrintView booking={contractToPrint} settings={settings} onClose={() => setContractToPrint(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-2 transition-all ${toast.type === 'error' ? 'bg-red-900 text-white' : 'bg-[#D4AF37] text-black'}`}>
          <CheckCircle size={20} />
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Onboarding Tour Modal */}
      {showOnboarding && <OnboardingTour onFinish={finishOnboarding} />}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#111] border border-red-900/50 shadow-2xl p-6 rounded-2xl max-w-sm w-full text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-xl text-white font-bold mb-2">تأكيد الخروج</h3>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">هل أنت متأكد أنك تريد تسجيل الخروج من النظام؟</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-[#222] hover:bg-[#333] text-white rounded-xl transition-colors font-bold">إلغاء</button>
              <button onClick={confirmLogout} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-bold">نعم، خروج</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[#111] p-4 border-b border-[#D4AF37]/30">
        <h1 className="text-[#D4AF37] font-bold text-xl flex items-center gap-2">
          <img src={settings?.studioLogo || LOGO_URL} alt="Logo" className="w-8 h-8 rounded-full border border-[#D4AF37] object-cover bg-white" onError={(e) => { if(e.target.src !== LOGO_URL) e.target.src = LOGO_URL; }} /> {settings?.studioName || 'اسم الاستوديو'}
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#D4AF37]">
          {isMobileMenuOpen ? <X size={28} /> : <LayoutDashboard size={28} />}
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Sidebar */}
        <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-[#111] border-l border-[#222] p-6 flex-shrink-0 transition-all flex flex-col`}>
          <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="p-1 rounded-full border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <img src={settings?.studioLogo || LOGO_URL} alt="Logo" className="w-12 h-12 rounded-full object-cover bg-white" onError={(e) => { if(e.target.src !== LOGO_URL) e.target.src = LOGO_URL; }} />
            </div>
            <div>
              <h1 className="text-[#D4AF37] font-bold text-xl leading-tight">{settings?.studioName || 'اسم الاستوديو'}</h1>
              <p className="text-xs text-gray-400 tracking-widest">PHOTOGRAPHY</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem icon={<LayoutDashboard />} label="الرئيسية" active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setIsMobileMenuOpen(false);}} />
            <NavItem icon={<PlusCircle />} label="حجز جديد" active={currentView === 'new'} onClick={() => navigateToNewBooking('')} />
            <NavItem icon={<Users />} label="العملاء" active={currentView === 'clients'} onClick={() => {setCurrentView('clients'); setIsMobileMenuOpen(false);}} />
            <NavItem icon={<CalendarIcon />} label="التقويم" active={currentView === 'calendar'} onClick={() => {setCurrentView('calendar'); setIsMobileMenuOpen(false);}} />
            <NavItem icon={<Wallet />} label="المصروفات" active={currentView === 'expenses'} onClick={() => {setCurrentView('expenses'); setIsMobileMenuOpen(false);}} />
            <NavItem icon={<Settings />} label="الإعدادات" active={currentView === 'settings'} onClick={() => {setCurrentView('settings'); setIsMobileMenuOpen(false);}} />
          </nav>

          <div className="mt-auto pt-10 space-y-4">
            <button onClick={handleLogoutClick} className="w-full flex items-center justify-center gap-2 bg-red-900/20 text-red-500 py-2 rounded-xl border border-red-900/50 hover:bg-red-900/40 transition-colors">
                <LogOut size={18} /> تسجيل الخروج
            </button>
            <div className="p-4 bg-black/50 rounded-xl border border-[#D4AF37]/20 text-center">
              <p className="text-xs text-gray-500 mb-1">Studio ID</p>
              <p className="font-mono text-[#D4AF37] font-bold">#MRKBY_2026</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {currentView === 'dashboard' && <Dashboard bookings={bookings} expenses={expenses} />}
          {currentView === 'new' && <NewBooking user={user} settings={settings} initialDate={initialBookingDate} onSuccess={() => setCurrentView('clients')} showToast={showToast} db={db} appId={appId} />}
          {currentView === 'clients' && <ClientsList user={user} bookings={bookings} settings={settings} onPrint={setContractToPrint} onEdit={(booking) => { setInitialBookingDate(''); setCurrentView('new'); }} showToast={showToast} db={db} appId={appId} />}
          {currentView === 'calendar' && <CalendarView bookings={bookings} settings={settings} onDayClick={navigateToNewBooking} />}
          {currentView === 'expenses' && <ExpensesView user={user} bookings={bookings} expenses={expenses} showToast={showToast} db={db} appId={appId} />}
          {currentView === 'settings' && <SettingsView user={user} settings={settings} bookings={bookings} onImportData={handleImportData} showToast={showToast} db={db} appId={appId} />}
        </main>
      </div>
    </div>
  );
}

// --- Components ---

// جولة الشرح (Onboarding Tour)
function OnboardingTour({ onFinish }) {
  const [step, setStep] = useState(0);
  
  const tourSteps = [
    {
      title: "مرحباً بك في النظام! 🎉",
      desc: "هذا النظام مصمم خصيصاً لإدارة الاستوديو الخاص بك، تنظيم المواعيد، وتتبع حساباتك بكل احترافية وسهولة.",
      icon: <Camera size={60} className="text-[#D4AF37] mx-auto" />
    },
    {
      title: "1. ابدأ بضبط الإعدادات ⚙️",
      desc: "أول خطوة يجب أن تقوم بها هي الذهاب لقسم 'الإعدادات'. قم بإضافة اسم الاستوديو الخاص بك، وارفع شعارك (اللوجو)، ثم أضف الباكيدجات والأسعار الخاصة بك لكي تظهر لك لاحقاً في العقود.",
      icon: <Settings size={60} className="text-[#D4AF37] mx-auto" />
    },
    {
      title: "2. تسجيل حجز جديد 📝",
      desc: "عندما يأتيك عميل، افتح 'حجز جديد'. أضف أسماء العروسين وتاريخ المناسبة. اختر الباكيدجات (فوتو أو فيديو) وسيحسب النظام الإجمالي والمتبقي تلقائياً.",
      icon: <PlusCircle size={60} className="text-[#D4AF37] mx-auto" />
    },
    {
      title: "3. إدارة العملاء وطباعة العقود 🖨️",
      desc: "في قسم 'العملاء'، ستجد جميع حجوزاتك. يمكنك من هناك طباعة عقد احترافي للعميل، أو إرسال العقد كصورة له على الواتساب، كما يمكنك إرسال رسائل تذكير سريعة.",
      icon: <Users size={60} className="text-[#D4AF37] mx-auto" />
    },
    {
      title: "4. المصروفات والأرباح 💰",
      desc: "لتكون على دراية تامة بنجاح مشروعك، استخدم قسم 'المصروفات' لتسجيل أي تكاليف (طباعة، إيجار، خامات) وسيقوم النظام بحساب صافي أرباحك الحقيقية.",
      icon: <Wallet size={60} className="text-[#D4AF37] mx-auto" />
    },
    {
      title: "5. تقويم المواعيد والأمان 📅",
      desc: "شاهد جميع مواعيدك بوضوح في 'التقويم'. والأهم، يمكنك ربط أي حجز بـ Google Calendar ليصلك تنبيه على هاتفك. ولا تنسَ تصدير نسخة احتياطية لبياناتك من الإعدادات للحفاظ عليها.",
      icon: <CalendarIcon size={60} className="text-[#D4AF37] mx-auto" />
    }
  ];

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111] border border-[#D4AF37]/50 rounded-3xl p-8 max-w-lg w-full shadow-[0_0_40px_rgba(212,175,55,0.15)] text-center relative">
        <button onClick={onFinish} className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors" title="تخطي">
          <X size={24} />
        </button>
        
        <div className="mb-6 h-20 flex items-center justify-center">
            {tourSteps[step].icon}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">{tourSteps[step].title}</h2>
        <p className="text-gray-400 leading-relaxed mb-8 h-24">{tourSteps[step].desc}</p>
        
        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {tourSteps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#D4AF37]' : 'w-2 bg-gray-700'}`}></div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={onFinish} 
            className="text-gray-500 font-bold hover:text-white transition-colors px-4 py-2"
          >
            تخطي الشرح
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={handlePrev} className="bg-[#222] hover:bg-[#333] text-white px-4 py-3 rounded-xl transition-colors font-bold flex items-center gap-2">
                 <ArrowRight size={18} /> السابق
              </button>
            )}
            <button onClick={handleNext} className="bg-[#D4AF37] hover:bg-yellow-500 text-black px-6 py-3 rounded-xl transition-colors font-bold flex items-center gap-2 shadow-lg">
              {step === tourSteps.length - 1 ? 'ابدأ الآن' : 'التالي'} {step !== tourSteps.length - 1 && <ArrowLeft size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-[#D4AF37]/20 to-transparent text-[#D4AF37] border-r-4 border-[#D4AF37]' 
          : 'text-gray-400 hover:bg-[#222] hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium text-lg">{label}</span>
    </button>
  );
}

function Dashboard({ bookings, expenses }) {
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalExpenses = 0;
    let counts = { 'زفاف': 0, 'خطوبة': 0, 'كاجول': 0, 'حنة': 0, 'كتب كتاب': 0, 'فوتوغرافي': 0 };

    bookings.forEach(b => {
      totalRevenue += Number(b.totalPrice) || 0;
      totalPaid += Number(b.paid) || 0;
      const type = b.sessionType === 'آخر' ? (b.otherSessionType || 'أخرى') : (b.sessionType || 'غير محدد');
      if (counts[type] !== undefined) counts[type]++;
      else counts[type] = 1;
    });

    expenses?.forEach(e => {
        totalExpenses += Number(e.amount) || 0;
    });

    return {
      totalBookings: bookings.length,
      revenue: totalRevenue,
      paid: totalPaid,
      outstanding: totalRevenue - totalPaid,
      expenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses, // صافي الربح
      counts
    };
  }, [bookings, expenses]);

  const maxCount = Math.max(...Object.values(stats.counts), 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">مرحباً بك في الاستوديو 📸</h2>
        <p className="text-gray-400">إليك ملخص سريع لأعمالك وحجوزاتك.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="إجمالي الحجوزات" value={stats.totalBookings} subtitle="حجز مسجل" />
        <StatCard title="إجمالي الإيرادات" value={`${stats.revenue.toLocaleString()} ج.م`} subtitle={`المدفوع: ${stats.paid.toLocaleString()} ج.م`} highlight />
        <StatCard title="إجمالي المصروفات" value={`${stats.expenses.toLocaleString()} ج.م`} subtitle="تكاليف ومصروفات الشغل" alert={stats.expenses > 0} />
        <StatCard title="صافي الربح" value={`${stats.netProfit.toLocaleString()} ج.م`} subtitle="الأرباح الحقيقية" success={stats.netProfit > 0} />
      </div>

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
          <h3 className="text-xl font-bold text-[#D4AF37] mb-6">تحليل أنواع الحجوزات</h3>
          <div className="space-y-4">
            {Object.entries(stats.counts).filter(([_, count]) => count > 0).map(([type, count]) => (
              <div key={type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{type}</span>
                  <span className="text-[#D4AF37] font-bold">{count} حجوزات</span>
                </div>
                <div className="h-3 bg-black rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-l from-[#D4AF37] to-[#B8860B] rounded-full transition-all duration-1000"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
          <h3 className="text-xl font-bold text-[#D4AF37] mb-6">أحدث الحجوزات</h3>
          <div className="space-y-4">
            {bookings.slice(0, 4).map((b, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-[#333]">
                <div>
                  <p className="font-bold text-white">{b.groomName} & {b.brideName}</p>
                  <p className="text-xs text-gray-400">{b.date} • {b.sessionType === 'آخر' ? b.otherSessionType : b.sessionType}</p>
                </div>
                <div className="text-left">
                  <p className="text-[#D4AF37] font-bold">{b.totalPrice} ج.م</p>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-gray-500 text-center py-4">لا توجد حجوزات بعد.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, highlight, alert, success }) {
  return (
    <div className={`p-6 rounded-2xl border ${highlight ? 'bg-gradient-to-br from-[#1a1500] to-[#0a0a0a] border-[#D4AF37]/50' : 'bg-[#111] border-[#222]'} relative overflow-hidden`}>
      {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>}
      <h3 className="text-gray-400 font-medium mb-2">{title}</h3>
      <p className={`text-2xl lg:text-3xl font-bold mb-2 ${alert ? 'text-red-400' : (success ? 'text-green-400' : 'text-white')}`}>{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function InputField({ label, type = "text", value, onChange, placeholder, required }) {
    return (
      <div className="flex flex-col w-full">
        <label className="text-xs text-gray-400 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <input 
          type={type} 
          min={type === 'number' ? "0" : undefined} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          required={required} 
          className="bg-black border border-[#333] text-white rounded-xl p-3 focus:outline-none focus:border-[#D4AF37] transition-all w-full" 
        />
      </div>
    );
  }
  
  function SelectField({ label, value, onChange, options = [] }) {
    return (
      <div className="flex flex-col w-full">
        <label className="text-xs text-gray-500 mb-1">{label}</label>
        <select value={value} onChange={onChange} className="bg-black border border-[#333] text-white rounded-xl p-3 outline-none focus:border-[#D4AF37] w-full">
          {options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }
  
  function DetailRow({ label, value, isMono, isRed }) {
    if (!value || value === '---') return null; // إخفاء الحقول الفارغة
    return (
      <div className="flex flex-col border-b border-[#222] pb-2">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-sm font-bold ${isRed ? 'text-red-500' : 'text-white'} ${isMono ? 'font-mono' : ''}`}>{value}</span>
      </div>
    );
  }

function NewBooking({ user, settings, initialDate, bookingToEdit, onSuccess, showToast, db, appId }) {
  const initialFormState = {
    bookingMainType: 'فوتوغرافي وفيديو',
    groomName: '', brideName: '', phone: '', address: '', date: initialDate || '', location: '', otherLocation: '',
    sessionType: settings.sessionTypes && settings.sessionTypes.length > 0 ? settings.sessionTypes[0] : 'زفاف', 
    otherSessionType: '', makeupArtist: '', makeupLeaveTime: '', casualLocation: '', otherCasualLocation: '', packageId: '', addons: [], paid: '',
    videoServiceId: '', videoServicePrice: '', videoStartTime: '', videoAddons: [], notes: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookingToEdit) {
      setFormData({
        ...initialFormState,
        ...bookingToEdit,
        addons: bookingToEdit.addons || [],
        videoAddons: bookingToEdit.videoAddons || []
      });
    } else {
      setFormData(prev => ({ ...initialFormState, date: initialDate || '' }));
    }
  }, [initialDate, bookingToEdit, settings]);

  // --- Calculations ---
  const isPhotoBooking = ['تصوير فوتوغرافي', 'فوتوغرافي وفيديو'].includes(formData.bookingMainType);
  const isVideoBooking = ['تصوير فيديو', 'فوتوغرافي وفيديو'].includes(formData.bookingMainType);

  const selectedPackage = settings.packages.find(p => p.id === formData.packageId) || { price: 0, name: 'غير محدد' };
  
  const photoPrice = isPhotoBooking ? Number(selectedPackage.price) : 0;
  const addonsTotal = isPhotoBooking ? formData.addons.reduce((sum, addonId) => {
    const addon = settings.addons.find(a => a.id === addonId);
    return sum + (addon ? Number(addon.price) : 0);
  }, 0) : 0;
  
  const videoServicePriceTotal = isVideoBooking ? (Number(formData.videoServicePrice) || 0) : 0;
  const videoAddonsTotal = isVideoBooking ? formData.videoAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0) : 0;

  const totalPrice = photoPrice + addonsTotal + videoServicePriceTotal + videoAddonsTotal;
  const remaining = totalPrice - (Number(formData.paid) || 0);

  // --- Handlers ---
  const handleAddonToggle = (addonId) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.includes(addonId) 
        ? prev.addons.filter(id => id !== addonId)
        : [...prev.addons, addonId]
    }));
  };

  const handleAddVideoAddon = (e) => {
    const addonId = e.target.value;
    if (!addonId) return;

    const addonDef = settings.videoAddons.find(a => a.id === addonId);
    if (addonDef && !formData.videoAddons.find(a => a.id === addonId)) {
       setFormData(prev => ({
         ...prev,
         videoAddons: [...prev.videoAddons, { id: addonDef.id, name: addonDef.name, price: addonDef.price }]
       }));
    }
    e.target.value = '';
  };

  const handleVideoAddonPriceChange = (id, newPrice) => {
    setFormData(prev => ({
      ...prev,
      videoAddons: prev.videoAddons.map(a => a.id === id ? { ...a, price: newPrice } : a)
    }));
  };

  const removeVideoAddon = (id) => {
     setFormData(prev => ({
      ...prev,
      videoAddons: prev.videoAddons.filter(a => a.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return showToast("يجب تسجيل الدخول أولاً", "error");
    if (!formData.groomName || !formData.date) {
      return showToast("يرجى إكمال البيانات الأساسية (اسم العريس، التاريخ)", "error");
    }
    
    if (isPhotoBooking && !formData.packageId) {
        return showToast("يرجى اختيار باكيدج التصوير الفوتوغرافي", "error");
    }
    if (isVideoBooking && !formData.videoServiceId) {
        return showToast("يرجى اختيار خدمة تصوير الفيديو", "error");
    }

    setIsSubmitting(true);
    try {
      // إزالة أي حقول undefined لتجنب أخطاء Firebase
      const rawBookingData = {
        ...formData,
        snapshotPackage: isPhotoBooking ? { name: selectedPackage.name, price: selectedPackage.price } : null,
        snapshotAddons: isPhotoBooking ? formData.addons.map(aId => {
          const a = settings.addons.find(x => x.id === aId);
          return a ? { name: a.name, price: a.price } : null;
        }).filter(Boolean) : [],
        snapshotVideoService: isVideoBooking && formData.videoServiceId ? {
          name: settings.videoServices.find(v => v.id === formData.videoServiceId)?.name,
          price: formData.videoServicePrice
        } : null,
        totalPrice,
        remaining,
        createdAt: bookingToEdit ? bookingToEdit.createdAt : new Date().toISOString()
      };
      
      const cleanBookingData = removeUndefined(rawBookingData);

      if (bookingToEdit && bookingToEdit.id) {
        const bookingRef = doc(db, 'artifacts', appId, 'users', user.uid, 'bookings', bookingToEdit.id);
        await updateDoc(bookingRef, cleanBookingData);
        showToast("تم تحديث الحجز بنجاح!");
      } else {
        const bookingsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'bookings');
        await addDoc(bookingsRef, cleanBookingData);
        showToast("تم حفظ الحجز بنجاح!");
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      showToast("حدث خطأ سحابي أثناء الحفظ. تأكد من اتصالك.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-10">
      <h2 className="text-3xl font-bold text-[#D4AF37] mb-8 border-b border-[#D4AF37]/30 pb-4">
        {bookingToEdit ? '✏️ تعديل بيانات الحجز' : '📝 تسجيل حجز جديد'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* بيانات العميل */}
        <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
          <h3 className="text-xl text-white mb-4 flex items-center gap-2"><Users size={20} className="text-[#D4AF37]"/> بيانات العميل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="اسم العريس" value={formData.groomName} onChange={e => setFormData({...formData, groomName: e.target.value})} required />
            <InputField label="اسم العروسة" value={formData.brideName} onChange={e => setFormData({...formData, brideName: e.target.value})} required />
            <InputField label="رقم الهاتف" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            <InputField label="العنوان" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
        </div>

        {/* نوع الحجز الأساسي */}
        <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
            <h3 className="text-xl text-white mb-4 flex items-center gap-2"><Settings size={20} className="text-[#D4AF37]"/> نوع الحجز</h3>
            <SelectField 
                label="اختر نوع الخدمة المطلوبة" 
                value={formData.bookingMainType} 
                onChange={e => setFormData({...formData, bookingMainType: e.target.value})} 
                options={['فوتوغرافي وفيديو', 'تصوير فوتوغرافي', 'تصوير فيديو']} 
            />
        </div>

        {/* تفاصيل المناسبة */}
        <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
          <h3 className="text-xl text-white mb-4 flex items-center gap-2"><CalendarIcon size={20} className="text-[#D4AF37]"/> تفاصيل المناسبة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                    <SelectField label="نوع السيشن" value={formData.sessionType} onChange={e => setFormData({...formData, sessionType: e.target.value})} options={settings.sessionTypes} />
                </div>
                {formData.sessionType === 'آخر' && (
                    <div className="flex-1">
                        <InputField label="تفاصيل نوع السيشن" value={formData.otherSessionType} onChange={e=>setFormData({...formData, otherSessionType: e.target.value})} required />
                    </div>
                )}
            </div>
            
            <InputField label="تاريخ المناسبة" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                    <SelectField label="اللوكيشن الأساسي" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} options={['', ...settings.locations]} />
                </div>
                {formData.location === 'آخر' && (
                    <div className="flex-1">
                        <InputField label="تفاصيل اللوكيشن" value={formData.otherLocation} onChange={e=>setFormData({...formData, otherLocation: e.target.value})} required />
                    </div>
                )}
            </div>
            
            {isPhotoBooking && (
                <>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                            <SelectField label="مكان تصوير الكاجوال (اختياري)" value={formData.casualLocation} onChange={e => setFormData({...formData, casualLocation: e.target.value})} options={['', ...settings.casualLocations]} />
                        </div>
                        {formData.casualLocation === 'آخر' && (
                            <div className="flex-1">
                                <InputField label="تفاصيل مكان الكاجوال" value={formData.otherCasualLocation} onChange={e=>setFormData({...formData, otherCasualLocation: e.target.value})} required />
                            </div>
                        )}
                    </div>
                    <InputField label="اسم الميك أب" value={formData.makeupArtist} onChange={e => setFormData({...formData, makeupArtist: e.target.value})} />
                    <InputField label="وقت الخروج من الميك أب" type="time" value={formData.makeupLeaveTime} onChange={e => setFormData({...formData, makeupLeaveTime: e.target.value})} />
                </>
            )}
          </div>
        </div>

        {/* الباكيدجات والإضافات (فوتوغرافيا) */}
        {isPhotoBooking && (
            <div className="bg-[#111] p-6 rounded-2xl border border-[#333] animate-fadeIn">
              <h3 className="text-xl text-white mb-4 flex items-center gap-2"><Camera size={20} className="text-[#D4AF37]"/> الباكيدج والإضافات (فوتوغرافيا)</h3>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">اختر الباكيدج الأساسي</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {settings.packages.map(pkg => (
                    <div 
                      key={pkg.id}
                      onClick={() => setFormData({...formData, packageId: pkg.id})}
                      className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${formData.packageId === pkg.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] hover:border-gray-500'}`}
                    >
                      <p className="font-bold text-white">{pkg.name}</p>
                      <p className="text-[#D4AF37]">{pkg.price} ج.م</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">الإضافات (اختياري)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {settings.addons.map(addon => (
                    <label key={addon.id} className="flex items-center gap-2 p-3 bg-black border border-[#333] rounded-lg cursor-pointer hover:bg-[#222]">
                      <input 
                        type="checkbox" 
                        checked={formData.addons.includes(addon.id)}
                        onChange={() => handleAddonToggle(addon.id)}
                        className="accent-[#D4AF37] w-5 h-5"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">{addon.name}</p>
                        <p className="text-xs text-[#D4AF37]">+{addon.price}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
        )}

        {/* قسم تصوير الفيديو */}
        {isVideoBooking && (
            <div className="bg-[#111] p-6 rounded-2xl border border-[#333] animate-fadeIn">
              <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl text-white flex items-center gap-2 mb-2"><Video size={20} className="text-[#D4AF37]"/> قسم تصوير الفيديو</h3>
                    <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
                        كل خدمات الفيديو تصوير Full HD يتم تسلم المناسبه على فلاشه خاصه.
                        <br/>
                        <span className="text-red-400 text-xs mt-1 block">
                            تنبيه: برجاء عمل نسخه احتياطيه من الحفل، عند حذف الفيديو بعد مدة تزيد عن 3 اشهر لا يمكن استرجاعه.
                        </span>
                    </p>
                </div>
                {formData.videoServiceId && (
                    <button type="button" onClick={() => setFormData({...formData, videoServiceId: '', videoServicePrice: '', videoStartTime: '', videoAddons: []})} className="text-red-400 text-sm hover:underline border border-red-500/30 px-3 py-1 rounded shrink-0">
                        إلغاء قسم الفيديو
                    </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">اختر خدمة الفيديو الأساسية</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {settings.videoServices.map(vs => (
                    <div 
                      key={vs.id}
                      onClick={() => {
                        setFormData(prev => ({
                           ...prev,
                           videoServiceId: vs.id,
                           videoServicePrice: prev.videoServiceId !== vs.id ? vs.price : prev.videoServicePrice
                        }))
                      }}
                      className={`p-4 rounded-xl cursor-pointer border-2 transition-all ${formData.videoServiceId === vs.id ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#333] hover:border-gray-500'}`}
                    >
                      <p className="font-bold text-white">{vs.name}</p>
                      {vs.subtext && <p className="text-xs text-gray-400 mt-1">{vs.subtext}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {formData.videoServiceId && (
                <div className="mb-6 border-t border-[#333] pt-6 flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/2">
                    <InputField 
                        label={`سعر ${settings.videoServices.find(v => v.id === formData.videoServiceId)?.name} (قابل للتعديل)`} 
                        type="number" 
                        value={formData.videoServicePrice} 
                        onChange={e => setFormData({...formData, videoServicePrice: e.target.value})} 
                    />
                  </div>
                  {formData.videoServiceId === 'v4' && (
                     <div className="md:w-1/2">
                        <InputField 
                            label="وقت البدء (من بعد الظهر)" 
                            type="time" 
                            value={formData.videoStartTime} 
                            onChange={e => setFormData({...formData, videoStartTime: e.target.value})} 
                        />
                     </div>
                  )}
                </div>
              )}

              <div className="border-t border-[#333] pt-6">
                <label className="block text-sm text-gray-400 mb-2">إضافات الفيديو</label>
                <select 
                  onChange={handleAddVideoAddon}
                  value=""
                  className="w-full md:w-1/2 bg-black border border-[#333] text-white rounded-lg p-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all mb-4"
                >
                  <option value="" disabled>-- اختر إضافة --</option>
                  {settings.videoAddons?.filter(va => !formData.videoAddons.find(a => a.id === va.id)).map(va => (
                     <option key={va.id} value={va.id}>{va.name}</option>
                  ))}
                </select>

                {formData.videoAddons.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {formData.videoAddons.map(addon => (
                      <div key={addon.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#1a1a1a] p-3 rounded-lg border border-[#333] gap-4">
                        <span className="font-bold text-white">{addon.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">السعر:</span>
                            <input 
                               type="number" 
                               min="0"
                               value={addon.price} 
                               onChange={(e) => handleVideoAddonPriceChange(addon.id, e.target.value)}
                               className="w-32 bg-black border border-[#444] text-white rounded px-3 py-2 text-sm focus:border-[#D4AF37] outline-none"
                            />
                          </div>
                          <button type="button" onClick={() => removeVideoAddon(addon.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded" title="حذف">
                             <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
        )}

        {/* الملاحظات الإضافية */}
        <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
            <h3 className="text-xl text-white mb-4 flex items-center gap-2"><MessageCircle size={20} className="text-[#D4AF37]"/> ملاحظات إضافية</h3>
            <textarea 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                rows="3" 
                className="w-full bg-black border border-[#333] text-white rounded-xl p-4 focus:outline-none focus:border-[#D4AF37] transition-all" 
                placeholder="اكتب هنا أي تفاصيل أو اتفاقات خاصة مع العميل..."
            ></textarea>
        </div>

        {/* الحسابات */}
        <div className="bg-gradient-to-br from-[#1a1500] to-[#0a0a0a] p-6 rounded-2xl border border-[#D4AF37]/50">
          <h3 className="text-xl text-[#D4AF37] font-bold mb-4">الملخص المالي</h3>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="text-center md:text-right w-full">
              <p className="text-gray-400">الإجمالي</p>
              <p className="text-3xl font-bold text-white">{totalPrice} ج.م</p>
            </div>
            <div className="w-full">
              <InputField label="المدفوع (عربون)" type="number" value={formData.paid} onChange={e => setFormData({...formData, paid: e.target.value})} placeholder="أدخل المبلغ..." />
            </div>
            <div className="text-center md:text-right w-full">
              <p className="text-gray-400">المتبقي</p>
              <p className={`text-3xl font-bold ${remaining > 0 ? 'text-red-400' : 'text-green-400'}`}>{remaining} ج.م</p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full text-black font-bold text-xl py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] ${isSubmitting ? 'bg-yellow-700 cursor-not-allowed opacity-70' : 'bg-[#D4AF37] hover:bg-yellow-500'}`}
        >
          {isSubmitting ? 'جاري حفظ البيانات...' : (bookingToEdit ? 'تحديث بيانات الحجز' : 'تأكيد وحفظ الحجز')}
        </button>
      </form>
    </div>
  );
}

// --- مكون المصروفات الجديد ---
function ExpensesView({ user, bookings, expenses, showToast, db, appId }) {
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'مصروفات عامة (إيجار، صيانة، إلخ)',
        relatedBookingId: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [viewExpense, setViewExpense] = useState(null); // لعرض تفاصيل المصروف

    // --- حالة حاسبة التكاليف السريعة ---
    const [calcItems, setCalcItems] = useState([
        { id: 1, name: '', qty: 1, price: 0 }
    ]);

    const addCalcItem = () => {
        setCalcItems([...calcItems, { id: Date.now(), name: '', qty: 1, price: 0 }]);
    };

    const updateCalcItem = (id, field, value) => {
        setCalcItems(calcItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const removeCalcItem = (id) => {
        setCalcItems(calcItems.filter(item => item.id !== id));
    };

    const calcTotal = calcItems.reduce((acc, item) => acc + (Number(item.qty) * Number(item.price)), 0);

    const transferToExpense = () => {
        if (calcTotal === 0) {
            showToast("إجمالي الحاسبة صفر!", "error");
            return;
        }
        const itemsDescriptions = calcItems.filter(i => i.name.trim() !== '').map(i => `${i.qty}x ${i.name}`).join('، ');
        
        // إفراغ وضع التعديل إذا كان موجوداً عند نقل قيمة جديدة
        setExpenseToEdit(null);
        
        setExpenseForm(prev => ({
            ...prev,
            title: itemsDescriptions ? `تكاليف شغل: ${itemsDescriptions}` : 'تكاليف شغل متنوعة',
            amount: calcTotal,
            type: 'تكلفة شغل لعميل محدد'
        }));
        showToast("تم نقل الإجمالي لنموذج المصروفات بالأسفل، يرجى اختيار العميل والحفظ.", "success");
        
        document.getElementById('expense-form-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleEditClick = (exp) => {
        setExpenseToEdit(exp);
        setExpenseForm({
            title: exp.title || '',
            amount: exp.amount || '',
            date: exp.date || new Date().toISOString().split('T')[0],
            type: exp.type || 'مصروفات عامة (إيجار، صيانة، إلخ)',
            relatedBookingId: exp.relatedBookingId || '',
            notes: exp.notes || ''
        });
        document.getElementById('expense-form-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setExpenseToEdit(null);
        setExpenseForm({
            title: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            type: 'مصروفات عامة (إيجار، صيانة، إلخ)',
            relatedBookingId: '',
            notes: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!expenseForm.title || !expenseForm.amount) {
            return showToast("الرجاء إدخال اسم المصروف والمبلغ", "error");
        }

        setIsSubmitting(true);
        try {
            const expenseData = {
                ...expenseForm,
                amount: Number(expenseForm.amount),
                updatedAt: new Date().toISOString()
            };

            if (expenseToEdit) {
                const expRef = doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', expenseToEdit.id);
                await updateDoc(expRef, removeUndefined(expenseData));
                showToast("تم تعديل المصروف بنجاح");
            } else {
                expenseData.createdAt = new Date().toISOString();
                const expensesRef = collection(db, 'artifacts', appId, 'users', user.uid, 'expenses');
                await addDoc(expensesRef, removeUndefined(expenseData));
                showToast("تم تسجيل المصروف بنجاح");
            }
            
            setExpenseToEdit(null);
            setExpenseForm({
                title: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                type: 'مصروفات عامة (إيجار، صيانة، إلخ)',
                relatedBookingId: '',
                notes: ''
            });
        } catch (error) {
            console.error("Error adding/updating expense", error);
            showToast("حدث خطأ أثناء الحفظ", "error");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (id) => {
        if(window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'expenses', id));
                showToast("تم حذف المصروف");
            } catch (err) {
                showToast("حدث خطأ أثناء الحذف", "error");
            }
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-10 max-w-5xl mx-auto">
            
            {/* نافذة عرض تفاصيل المصروف */}
            {viewExpense && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[80] p-4 animate-fadeIn">
                    <div className="bg-[#111] border border-[#D4AF37]/30 p-6 rounded-3xl w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
                            <h3 className="text-xl font-bold text-[#D4AF37] flex items-center gap-2"><Info size={24}/> تفاصيل المصروف</h3>
                            <button onClick={() => setViewExpense(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <DetailRow label="العنوان/الاسم" value={viewExpense.title} />
                            <DetailRow label="المبلغ" value={`${viewExpense.amount} ج.م`} isRed={true} />
                            <DetailRow label="التاريخ" value={viewExpense.date} isMono />
                            <DetailRow label="النوع" value={viewExpense.type} />
                            {viewExpense.type === 'تكلفة شغل لعميل محدد' && (
                                <DetailRow label="العميل" value={bookings.find(b => b.id === viewExpense.relatedBookingId)?.groomName || 'غير معروف'} />
                            )}
                            {viewExpense.notes && (
                                <div className="flex flex-col pt-2 border-t border-[#222]">
                                    <span className="text-xs text-gray-500 mb-1">ملاحظات إضافية</span>
                                    <span className="text-sm text-white whitespace-pre-wrap">{viewExpense.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <header className="border-b border-[#222] pb-4">
                <h2 className="text-3xl font-bold text-[#D4AF37] flex items-center gap-2"><Wallet size={30} /> إدارة المصروفات والأرباح</h2>
                <p className="text-gray-400 mt-2">سجل مصروفاتك العامة وتكاليف الشغل لمعرفة صافي أرباحك بدقة.</p>
            </header>

            {/* --- حاسبة تكاليف الشغل المتقدمة --- */}
            <div className="bg-[#111] p-6 rounded-2xl border border-[#333] shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Calculator size={20} className="text-[#D4AF37]"/> حاسبة تكاليف الشغل</h3>
                </div>
                <p className="text-sm text-gray-400 mb-6">احسب تكلفة الخامات (ألبومات، براويز، طباعة) بدقة، ثم قم بتحويل الإجمالي إلى مصروف بنقرة واحدة.</p>

                <div className="space-y-3 mb-4">
                    {calcItems.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row items-center gap-3 bg-black/50 p-3 rounded-xl border border-[#222]">
                            <input
                                type="text"
                                placeholder="اسم البند (مثال: ألبوم 5 صفحات، برواز...)"
                                value={item.name}
                                onChange={e => updateCalcItem(item.id, 'name', e.target.value)}
                                className="flex-1 bg-black border border-[#444] rounded-lg p-2.5 text-sm text-white focus:border-[#D4AF37] outline-none w-full md:w-auto"
                            />
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-gray-500 text-sm whitespace-nowrap">الكمية:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.qty}
                                    onChange={e => updateCalcItem(item.id, 'qty', e.target.value)}
                                    className="w-full md:w-20 bg-black border border-[#444] rounded-lg p-2.5 text-sm text-white focus:border-[#D4AF37] outline-none text-center"
                                />
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <span className="text-gray-500 text-sm whitespace-nowrap">سعر الوحدة:</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={item.price}
                                    onChange={e => updateCalcItem(item.id, 'price', e.target.value)}
                                    className="w-full md:w-24 bg-black border border-[#444] rounded-lg p-2.5 text-sm text-white focus:border-[#D4AF37] outline-none text-center"
                                />
                            </div>
                            <div className="flex items-center justify-between w-full md:w-auto gap-4 md:mr-4">
                                <div className="text-[#D4AF37] font-bold min-w-[80px] text-left">
                                    = {item.qty * item.price} ج.م
                                </div>
                                <button onClick={() => removeCalcItem(item.id)} className="text-red-500 hover:text-red-400 p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={addCalcItem} className="flex items-center justify-center gap-2 w-full md:w-auto bg-[#222] text-[#D4AF37] hover:bg-[#333] transition-colors py-2.5 px-4 rounded-xl border border-[#333] mb-6 font-bold text-sm">
                    <Plus size={18} /> إضافة بند جديد للحاسبة
                </button>

                <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#333] pt-6 gap-4">
                    <div className="text-lg text-white">
                        إجمالي الحاسبة: <span className="font-black text-red-400 text-2xl mx-2">{calcTotal}</span> ج.م
                    </div>
                    <button type="button" onClick={transferToExpense} className="w-full md:w-auto bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2">
                        <ArrowLeft size={20} className="hidden md:block" />
                        <ArrowRight size={20} className="md:hidden transform rotate-90" />
                        نقل الإجمالي إلى المصروفات
                    </button>
                </div>
            </div>

            <form id="expense-form-section" onSubmit={handleSubmit} className="bg-[#111] p-6 rounded-2xl border border-[#333] shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    {expenseToEdit ? <Edit size={20} className="text-[#D4AF37]"/> : <PlusCircle size={20} className="text-[#D4AF37]"/>}
                    {expenseToEdit ? 'تعديل بيانات المصروف' : 'تسجيل مصروف جديد'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <InputField label="عنوان/اسم المصروف" value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} placeholder="مثال: طباعة ألبوم، إيجار، خامات..." required />
                    <InputField label="المبلغ (ج.م)" type="number" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} required />
                    
                    <div className="flex flex-col w-full">
                        <label className="text-xs text-gray-500 mb-1">نوع المصروف</label>
                        <select value={expenseForm.type} onChange={e => setExpenseForm({...expenseForm, type: e.target.value})} className="bg-black border border-[#333] text-white rounded-xl p-3 outline-none focus:border-[#D4AF37]">
                            <option value="مصروفات عامة (إيجار، صيانة، إلخ)">مصروفات عامة (إيجار، كهرباء، صيانة...)</option>
                            <option value="تكلفة شغل لعميل محدد">تكلفة شغل لعميل محدد (طباعة، مساعدة...)</option>
                        </select>
                    </div>

                    {expenseForm.type === 'تكلفة شغل لعميل محدد' ? (
                        <div className="flex flex-col w-full animate-fadeIn">
                            <label className="text-xs text-gray-500 mb-1">اختر العميل (الحجز)</label>
                            <select value={expenseForm.relatedBookingId} onChange={e => setExpenseForm({...expenseForm, relatedBookingId: e.target.value})} className="bg-black border border-[#333] text-white rounded-xl p-3 outline-none focus:border-[#D4AF37]">
                                <option value="">-- اختر العميل --</option>
                                {bookings.map(b => (
                                    <option key={b.id} value={b.id}>{b.groomName} ({b.date})</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <InputField label="التاريخ" type="date" value={expenseForm.date} onChange={e => setExpenseForm({...expenseForm, date: e.target.value})} required />
                    )}
                </div>
                
                <div className="mb-6">
                    <InputField label="ملاحظات إضافية (اختياري)" value={expenseForm.notes} onChange={e => setExpenseForm({...expenseForm, notes: e.target.value})} placeholder="أي تفاصيل أخرى تخص هذا المصروف..." />
                </div>

                <div className="flex gap-4">
                    <button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none px-8 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-yellow-500 transition-colors">
                        {isSubmitting ? 'جاري الحفظ...' : (expenseToEdit ? 'تحديث المصروف' : 'حفظ المصروف')}
                    </button>
                    {expenseToEdit && (
                        <button type="button" onClick={cancelEdit} className="px-8 py-3 bg-[#222] text-white font-bold rounded-xl hover:bg-[#333] transition-colors">
                            إلغاء التعديل
                        </button>
                    )}
                </div>
            </form>

            <div className="bg-[#111] rounded-2xl border border-[#333] overflow-hidden shadow-lg mt-8">
                <div className="p-4 border-b border-[#333] bg-black/50">
                    <h3 className="text-lg font-bold text-white">سجل المصروفات السابقة</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead className="text-gray-400 bg-black/30 border-b border-[#333]">
                            <tr>
                                <th className="p-4">اسم المصروف</th>
                                <th className="p-4">النوع / العميل</th>
                                <th className="p-4">التاريخ</th>
                                <th className="p-4 font-bold text-red-400">المبلغ</th>
                                <th className="p-4 text-center">إجراء</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222]">
                            {expenses.length > 0 ? expenses.map(exp => (
                                <tr key={exp.id} className="hover:bg-[#1a1a1a] transition-colors">
                                    <td className="p-4 font-bold text-white max-w-[200px] truncate" title={exp.title}>{exp.title}</td>
                                    <td className="p-4 text-gray-300">
                                        {exp.type === 'تكلفة شغل لعميل محدد' && exp.relatedBookingId 
                                            ? <span className="text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 rounded text-xs">شغل عميل: {bookings.find(b => b.id === exp.relatedBookingId)?.groomName || 'عميل غير معروف'}</span> 
                                            : <span className="text-gray-400 bg-gray-800 px-2 py-1 rounded text-xs">مصروف عام</span>}
                                    </td>
                                    <td className="p-4 font-mono text-gray-400">{exp.date}</td>
                                    <td className="p-4 font-bold text-red-500">{exp.amount} ج.م</td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => setViewExpense(exp)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="عرض التفاصيل">
                                            <Info size={18} />
                                        </button>
                                        <button onClick={() => handleEditClick(exp)} className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="تعديل">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(exp.id)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" title="حذف">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="5" className="p-8 text-center text-gray-500">لا يوجد مصروفات مسجلة حتى الآن.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ClientsList({ user, bookings, settings, onPrint, onEdit, showToast, db, appId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const filtered = bookings.filter(b => 
    b.phone?.includes(searchTerm) || 
    b.groomName?.includes(searchTerm) || 
    b.brideName?.includes(searchTerm)
  );

  const executeDelete = async () => {
    if(!user || !bookingToDelete) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'bookings', bookingToDelete));
      showToast("تم الحذف بنجاح");
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء الحذف", "error");
    } finally {
      setBookingToDelete(null);
    }
  };

  const sendWhatsApp = (booking) => {
    const session = booking.sessionType === 'آخر' ? booking.otherSessionType : booking.sessionType;
    const loc = booking.location === 'آخر' ? booking.otherLocation : booking.location;
    const casualLoc = booking.casualLocation === 'آخر' ? booking.otherCasualLocation : booking.casualLocation;
    
    let text = `أهلاً بك أستاذ/ *${booking.groomName}* وعروستنا *${booking.brideName}*،\n\n`;
    text += `تم تأكيد حجزكم مع *${settings.studioName || 'الاستوديو'}* 📸✨\n\n`;
    text += `*📌 تفاصيل الحجز والمناسبة:*\n`;
    text += `📅 التاريخ: ${booking.date}\n`;
    text += `🎉 نوع السيشن: ${session}\n`;
    
    const isPhotoBooking = ['تصوير فوتوغرافي', 'فوتوغرافي وفيديو'].includes(booking.bookingMainType || 'فوتوغرافي وفيديو');
    const isVideoBooking = ['تصوير فيديو', 'فوتوغرافي وفيديو'].includes(booking.bookingMainType || 'فوتوغرافي وفيديو');

    if (loc) text += `📍 اللوكيشن: ${loc}\n`;
    
    if (isPhotoBooking) {
        if (casualLoc) text += `📍 مكان الكاجوال: ${casualLoc}\n`;
        if (booking.makeupArtist) text += `💄 الميك أب: ${booking.makeupArtist}\n`;
        if (booking.makeupLeaveTime) text += `⏰ وقت الخروج: ${booking.makeupLeaveTime}\n`;
    }
    if (booking.address) text += `🏠 العنوان: ${booking.address}\n`;
    
    if (isPhotoBooking) {
        const pkg = settings.packages.find(p => p.id === booking.packageId);
        const displayPkgName = booking.snapshotPackage?.name || pkg?.name || 'غير محدد';
        const displayPkgPrice = booking.snapshotPackage?.price || pkg?.price || 0;
        text += `\n*📦 الباكيدج المتفق عليه:*\n▪️ ${displayPkgName} (${displayPkgPrice} ج.م)\n`;
        
        const addonsList = booking.snapshotAddons && booking.snapshotAddons.length > 0 
          ? booking.snapshotAddons 
          : (booking.addons || []).map(aId => settings.addons.find(a => a.id === aId)).filter(Boolean);
          
        if (addonsList.length > 0) {
          const addonsText = addonsList.map(a => `${a.name} (${a.price} ج.م)`);
          text += `➕ الإضافات:\n▪️ ${addonsText.join('\n▪️ ')}\n`;
        }
    }
    
    if (isVideoBooking && (booking.videoServiceId || booking.snapshotVideoService)) {
      const vName = booking.snapshotVideoService?.name || settings.videoServices.find(v => v.id === booking.videoServiceId)?.name;
      const vPrice = booking.snapshotVideoService?.price || booking.videoServicePrice;
      
      text += `\n*🎥 تفاصيل الفيديو والتكلفة:*\n`;
      text += `🔹 الخدمة: ${vName} (${vPrice} ج.م)\n`;
      if (booking.videoStartTime) text += `⏳ وقت البدء: ${booking.videoStartTime}\n`;
      if (booking.videoAddons && booking.videoAddons.length > 0) {
        const vAddonDetails = booking.videoAddons.map(a => `${a.name} (${a.price} ج.م)`);
        text += `➕ إضافات الفيديو:\n▪️ ${vAddonDetails.join('\n▪️ ')}\n`;
      }
      text += `\n⚠️ *تنبيه:* يتم تسليم المناسبة Full HD على فلاشة خاصة. برجاء عمل نسخة احتياطية (لا يمكن الاسترجاع بعد 3 أشهر).\n`;
    }
    
    text += `\n*💰 التفاصيل المالية:*\n`;
    text += `▪️ إجمالي التكلفة: ${booking.totalPrice} ج.م\n`;
    text += `▪️ المدفوع (عربون): ${booking.paid || 0} ج.م\n`;
    text += `❗ المبلغ المتبقي: ${booking.remaining} ج.م (يُسدد يوم المناسبة)\n\n`;
    text += `يسعدنا توثيق لحظاتكم الجميلة! لمعرفة أي تفاصيل إضافية، نحن في خدمتكم.`;

    const url = `https://wa.me/2${booking.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="animate-fadeIn pb-10">
      
      {/* Custom Delete Modal to avoid iframe popup issues */}
      {bookingToDelete && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn p-4">
           <div className="bg-[#111] border border-red-900/50 shadow-2xl p-6 rounded-2xl max-w-sm w-full text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-xl text-white font-bold mb-2">تأكيد الحذف</h3>
              <p className="text-gray-400 mb-8 text-sm leading-relaxed">هل أنت متأكد من حذف هذا الحجز نهائياً؟ هذا الإجراء سيقوم بإزالة كافة تفاصيل الحجز ولا يمكن التراجع عنه.</p>
              <div className="flex justify-center gap-4">
                 <button onClick={() => setBookingToDelete(null)} className="flex-1 py-3 bg-[#222] hover:bg-[#333] text-white rounded-xl transition-colors font-bold">إلغاء</button>
                 <button onClick={executeDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-bold">نعم، احذف</button>
              </div>
           </div>
         </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-[#D4AF37]">قاعدة بيانات العملاء</h2>
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-3 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="بحث برقم الهاتف أو الاسم..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#333] text-white rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#333] overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-black/50 text-[#D4AF37] border-b border-[#333]">
            <tr>
              <th className="p-4">الأسماء</th>
              <th className="p-4">النوع / اللوكيشن</th>
              <th className="p-4">التاريخ</th>
              <th className="p-4">الرقم</th>
              <th className="p-4">الإجمالي / المتبقي</th>
              <th className="p-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-[#1a1a1a] transition-colors">
                <td className="p-4 font-bold">{b.groomName} <br/><span className="text-gray-400 text-sm">& {b.brideName}</span></td>
                <td className="p-4">{b.sessionType === 'آخر' ? b.otherSessionType : b.sessionType} <br/><span className="text-xs text-[#D4AF37] border border-[#D4AF37]/30 rounded px-1">{b.location === 'آخر' ? b.otherLocation : b.location}</span></td>
                <td className="p-4 text-gray-300">{b.date}</td>
                <td className="p-4 font-mono text-sm">{b.phone}</td>
                <td className="p-4">
                  <span className="text-white">{b.totalPrice}</span><br/>
                  <span className={`text-sm ${b.remaining > 0 ? 'text-red-400' : 'text-green-400'}`}>متبقي: {b.remaining}</span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => sendWhatsApp(b)} className="p-2 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors" title="إرسال واتساب">
                    <MessageCircle size={20} />
                  </button>
                  <button onClick={() => onEdit(b)} className="p-2 bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors" title="تعديل الحجز">
                    <Edit size={20} />
                  </button>
                  <button onClick={() => onPrint(b)} className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-lg transition-colors" title="طباعة العقد">
                    <Printer size={20} />
                  </button>
                  <button onClick={() => setBookingToDelete(b.id)} className="p-2 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="حذف العميل">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="text-center p-8 text-gray-500">لا يوجد نتائج للبحث.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView({ bookings, onDayClick }) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedBooking, setSelectedBooking] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  
  const days = [];
  for(let i=0; i<firstDayIndex; i++) days.push(null);
  for(let i=1; i<=daysInMonth; i++) days.push(i);

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-10 relative">
      
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-[#111] border border-[#D4AF37]/30 p-6 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-4">
              <h3 className="text-2xl font-bold text-[#D4AF37]">بيانات الحجز التفصيلية</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-white"><X size={30} /></button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow label="العريس" value={selectedBooking.groomName} />
                <DetailRow label="العروسة" value={selectedBooking.brideName} />
                <DetailRow label="الهاتف" value={selectedBooking.phone} isMono />
                <DetailRow label="التاريخ" value={selectedBooking.date} />
                <DetailRow label="نوع الحجز" value={selectedBooking.bookingMainType || 'فوتوغرافي وفيديو'} />
                <DetailRow label="نوع السيشن" value={selectedBooking.sessionType === 'آخر' ? selectedBooking.otherSessionType : selectedBooking.sessionType} />
                <DetailRow label="اللوكيشن" value={selectedBooking.location === 'آخر' ? selectedBooking.otherLocation : selectedBooking.location} />
                <DetailRow label="الميك أب" value={selectedBooking.makeupArtist || 'غير محدد'} />
              </div>
              
              {selectedBooking.notes && (
                 <div className="bg-black/40 p-4 rounded-2xl border border-[#222]">
                    <h4 className="text-[#D4AF37] font-bold mb-2 flex items-center gap-2"><MessageCircle size={18} /> ملاحظات إضافية</h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedBooking.notes}</p>
                 </div>
              )}

              <div className="bg-[#D4AF37]/10 p-4 rounded-2xl border border-[#D4AF37]/30 flex justify-between items-center shadow-lg">
                <div><p className="text-xs text-gray-400 uppercase">إجمالي الحساب</p><p className="text-2xl font-bold text-white">{selectedBooking.totalPrice} ج.م</p></div>
                <div className="text-left border-r border-[#D4AF37]/20 pr-4"><p className="text-xs text-gray-400 uppercase">المبلغ المتبقي</p><p className="text-2xl font-bold text-red-500">{selectedBooking.remaining} ج.م</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-[#D4AF37]">تقويم الحجوزات</h2>
        <div className="flex items-center gap-4 bg-[#111] px-2 py-1 rounded-xl border border-[#333] shadow-lg">
            <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#222] rounded-lg transition-colors" title="الشهر السابق">
                <ChevronRight size={24} />
            </button>
            <div className="text-xl font-bold min-w-[120px] text-center cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={goToToday} title="العودة للشهر الحالي">
                {monthNames[month]} {year}
            </div>
            <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-[#222] rounded-lg transition-colors" title="الشهر القادم">
                <ChevronLeft size={24} />
            </button>
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#333] p-6">
        <p className="text-gray-400 mb-4 text-sm"><span className="text-[#D4AF37] font-bold">💡 تلميح:</span> اضغط على أي يوم فارغ في التقويم لإضافة حجز جديد في هذا التاريخ.</p>
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4 text-center font-bold text-gray-400 text-sm md:text-base">
          <div>الأحد</div><div>الإثنين</div><div>الثلاثاء</div><div>الأربعاء</div><div>الخميس</div><div>الجمعة</div><div>السبت</div>
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-20 md:h-28 bg-black/20 rounded-xl border border-transparent"></div>;
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayBookings = bookings.filter(b => b.date === dateStr);
            
            return (
              <div 
                key={idx} 
                onClick={() => onDayClick(dateStr)}
                className={`h-20 md:h-28 p-1 md:p-2 rounded-xl border cursor-pointer hover:border-[#D4AF37] transition-colors ${dayBookings.length > 0 ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-[#222] bg-black'}`}
              >
                <span className="text-gray-500 text-xs md:text-sm font-bold">{day}</span>
                <div className="mt-1 space-y-1 overflow-y-auto max-h-12 md:max-h-16 no-scrollbar">
                  {dayBookings.map((b, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }} className="text-[9px] md:text-[10px] bg-[#D4AF37] text-black px-1 py-0.5 rounded font-bold truncate">
                      {b.sessionType === 'آخر' ? b.otherSessionType : b.sessionType} - {b.groomName}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ user, settings, bookings, onImportData, showToast, db, appId }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    if(!user) return;
    setIsSaving(true);
    try {
      const settingsRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'config');
      await setDoc(settingsRef, localSettings);
      showToast("تم حفظ الإعدادات بنجاح ☁️");
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ في حفظ الإعدادات", "error");
    }
    setIsSaving(false);
  };

  const updateArray = (key, newArray) => {
    setLocalSettings(prev => ({ ...prev, [key]: newArray }));
  };
  
  const updateField = (key, value) => {
     setLocalSettings(prev => ({ ...prev, [key]: value })); 
  };

  const handleLogoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 500;
                  const MAX_HEIGHT = 500;
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                    if (width > MAX_WIDTH) {
                      height *= MAX_WIDTH / width;
                      width = MAX_WIDTH;
                    }
                  } else {
                    if (height > MAX_HEIGHT) {
                      width *= MAX_HEIGHT / height;
                      height = MAX_HEIGHT;
                    }
                  }
                  
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  const dataUrl = canvas.toDataURL('image/png');
                  updateField('studioLogo', dataUrl);
              };
              img.src = event.target.result;
          };
          reader.readAsDataURL(file);
      }
  };

  // --- دوال النسخ الاحتياطي ---
  const handleExport = () => {
      const data = {
          settings: localSettings,
          bookings: bookings
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `mrakby_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode); 
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  // --- دالة التصدير إلى إكسل ---
  const handleExportCSV = () => {
      if (!bookings || bookings.length === 0) {
          showToast("لا توجد حجوزات لتصديرها", "error");
          return;
      }

      // تجهيز رؤوس الأعمدة
      const headers = ['اسم العريس', 'اسم العروسة', 'رقم الهاتف', 'التاريخ', 'نوع الحجز', 'اللوكيشن', 'الإجمالي', 'المدفوع', 'المتبقي', 'ملاحظات'];
      
      // تجهيز البيانات
      const csvRows = bookings.map(b => {
          const mainType = b.bookingMainType || '';
          const session = b.sessionType === 'آخر' ? b.otherSessionType : b.sessionType;
          const loc = b.location === 'آخر' ? b.otherLocation : b.location;
          // تنظيف الملاحظات من أي فواصل أسطر لتجنب كسر ملف الإكسل
          const cleanNotes = (b.notes || '').replace(/(\r\n|\n|\r)/gm, " ");

          return [
              `"${b.groomName || ''}"`,
              `"${b.brideName || ''}"`,
              `"=""${b.phone || ''}"""`, // خدعة صغيرة ليحتفظ الإكسل بالصفر في بداية الرقم
              `"${b.date || ''}"`,
              `"${mainType} - ${session}"`,
              `"${loc || ''}"`,
              `"${b.totalPrice || 0}"`,
              `"${b.paid || 0}"`,
              `"${b.remaining || 0}"`,
              `"${cleanNotes}"`
          ].join(',');
      });

      // إضافة علامة (BOM) لدعم اللغة العربية في إكسل
      const csvContent = "\uFEFF" + headers.join(',') + '\n' + csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings_excel_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast("تم تصدير ملف الإكسل بنجاح!");
  };

  const handleImportClick = () => {
      document.getElementById('import-file').click();
  };

  const handleImportFile = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const importedData = JSON.parse(event.target.result);
              onImportData(importedData);
          } catch (err) {
              showToast("الملف غير صالح أو تالف", "error");
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-[#D4AF37]/30 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-[#D4AF37] flex items-center gap-2"><Settings size={30}/> إعدادات النظام</h2>
          <p className="text-gray-400 mt-2">قم بتخصيص بياناتك، الباقات، والرسائل السريعة.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#D4AF37] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-500 transition-colors shrink-0"
        >
          <Save size={20} />
          {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-[#111] p-6 rounded-3xl border border-[#222] shadow-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Save size={20} className="text-[#D4AF37]"/> النسخ الاحتياطي واستعادة البيانات</h3>
          <p className="text-sm text-gray-400 mb-6">قم بتنزيل نسخة من جميع بياناتك وحجوزاتك تحسباً لأي طارئ، أو قم برفع ملف سابق لاستعادة البيانات.</p>
          <div className="flex flex-col md:flex-row gap-4">
              <button onClick={handleExportCSV} className="flex-1 flex justify-center items-center gap-2 bg-green-700 hover:bg-green-600 text-white py-3 rounded-xl transition-colors font-bold shadow-lg">
                  <FileText size={20} /> تصدير شيت إكسل (Excel)
              </button>
              
              <button onClick={handleExport} className="flex-1 flex justify-center items-center gap-2 bg-[#222] hover:bg-[#333] text-white py-3 rounded-xl border border-[#333] transition-colors font-bold">
                  <Download size={20} /> تصدير نسخة النظام (JSON)
              </button>
              
              <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleImportFile} />
              
              <button onClick={handleImportClick} className="flex-1 flex justify-center items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 py-3 rounded-xl transition-colors font-bold">
                  <Upload size={20} /> استيراد البيانات (رفع)
              </button>
          </div>
      </div>
      
      <div className="bg-[#111] p-6 rounded-3xl border border-[#222] shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none"></div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Camera size={20} className="text-[#D4AF37]"/> تخصيص هوية الاستوديو</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-2">اسم الاستوديو (يظهر في العقود)</label>
                  <input type="text" value={localSettings.studioName || ''} onChange={e => updateField('studioName', e.target.value)} className="bg-black border border-[#333] text-white rounded-xl p-3 focus:outline-none focus:border-[#D4AF37] transition-all" />
              </div>
              <div className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-2">شعار الاستوديو (اللوجو)</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="bg-black border border-[#333] text-gray-400 rounded-xl p-2 focus:outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#D4AF37]/20 file:text-[#D4AF37] hover:file:bg-[#D4AF37]/30 cursor-pointer" />
              </div>
          </div>
      </div>

      <div className="bg-[#111] p-6 rounded-3xl border border-[#222] shadow-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><MessageCircle size={20} className="text-[#D4AF37]"/> قوالب الرسائل السريعة</h3>
          <p className="text-sm text-gray-400 mb-6">يمكنك استخدام هذه المتغيرات داخل النص: <code className="text-[#D4AF37]">[الاسم]</code>, <code className="text-[#D4AF37]">[العروسة]</code>, <code className="text-[#D4AF37]">[التاريخ]</code>, <code className="text-[#D4AF37]">[المتبقي]</code>, <code className="text-[#D4AF37]">[اللوكيشن]</code></p>
          
          <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {(localSettings.quickMessages || []).map((msg, idx) => (
                      <div key={msg.id} className="bg-black p-4 rounded-2xl border border-[#333] relative group flex flex-col">
                          <button onClick={() => updateArray('quickMessages', localSettings.quickMessages.filter(m => m.id !== msg.id))} className="absolute top-4 left-4 text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded transition-colors"><Trash2 size={16}/></button>
                          <input type="text" value={msg.title} onChange={e => updateArray('quickMessages', localSettings.quickMessages.map(m => m.id === msg.id ? {...m, title: e.target.value} : m))} className="bg-transparent text-[#D4AF37] font-bold outline-none mb-3 w-10/12" placeholder="عنوان القالب..." />
                          <textarea value={msg.text} onChange={e => updateArray('quickMessages', localSettings.quickMessages.map(m => m.id === msg.id ? {...m, text: e.target.value} : m))} rows="4" className="flex-1 w-full bg-[#111] border border-[#333] text-white rounded-xl p-3 focus:outline-none focus:border-[#D4AF37] text-sm resize-none" placeholder="اكتب نص الرسالة هنا..." />
                      </div>
                  ))}
              </div>
              <button onClick={() => updateArray('quickMessages', [...(localSettings.quickMessages || []), { id: 'qm_' + Date.now(), title: 'رسالة جديدة', text: '' }])} className="flex items-center justify-center w-full gap-2 bg-[#222] text-[#D4AF37] py-3 rounded-2xl border border-[#333] hover:border-[#D4AF37] transition-colors font-bold"><Plus size={20}/> إضافة قالب جديد</button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SettingObjectList 
          title="الباكيدجات الأساسية" 
          items={localSettings.packages} 
          onChange={(arr) => updateArray('packages', arr)} 
        />
        <SettingObjectList 
          title="إضافات الفوتوغرافيا" 
          items={localSettings.addons} 
          onChange={(arr) => updateArray('addons', arr)} 
        />
        <SettingObjectList 
          title="خدمات الفيديو الأساسية" 
          items={localSettings.videoServices} 
          hasSubtext={true}
          onChange={(arr) => updateArray('videoServices', arr)} 
        />
        <SettingObjectList 
          title="إضافات الفيديو" 
          items={localSettings.videoAddons} 
          onChange={(arr) => updateArray('videoAddons', arr)} 
        />
        <SettingStringList 
          title="أماكن التصوير الأساسية" 
          items={localSettings.locations} 
          onChange={(arr) => updateArray('locations', arr)} 
        />
        <SettingStringList 
          title="أماكن تصوير الكاجوال" 
          items={localSettings.casualLocations} 
          onChange={(arr) => updateArray('casualLocations', arr)} 
        />
        <SettingStringList 
          title="أنواع السيشن" 
          items={localSettings.sessionTypes} 
          onChange={(arr) => updateArray('sessionTypes', arr)} 
        />
      </div>
    </div>
  );
}

function SettingObjectList({ title, items = [], hasSubtext, onChange }) {
  const [newItem, setNewItem] = useState({ name: '', price: '', subtext: '' });

  const handleAdd = () => {
    if(!newItem.name) return;
    const newArr = [...items, { id: 'id_' + Date.now(), name: newItem.name, price: Number(newItem.price) || 0, subtext: newItem.subtext || '' }];
    onChange(newArr);
    setNewItem({ name: '', price: '', subtext: '' });
  };

  const handleRemove = (id) => {
    onChange(items.filter(i => i.id !== id));
  };

  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
      <h3 className="text-xl font-bold text-white mb-4 border-b border-[#222] pb-2">{title}</h3>
      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
        {items.map(item => (
          <div key={item.id} className="flex justify-between items-center bg-black p-3 rounded-lg border border-[#222]">
            <div>
              <p className="font-bold text-white">{item.name} <span className="text-[#D4AF37] text-sm mr-2">({item.price} ج.م)</span></p>
              {hasSubtext && item.subtext && <p className="text-xs text-gray-500">{item.subtext}</p>}
            </div>
            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
      
      <div className="bg-black/50 p-4 rounded-xl border border-[#333] flex flex-col gap-2">
        <input 
          placeholder="الاسم..." 
          value={newItem.name} 
          onChange={e => setNewItem({...newItem, name: e.target.value})}
          className="bg-black border border-[#444] rounded p-2 text-sm text-white focus:border-[#D4AF37] outline-none"
        />
        <input 
          placeholder="السعر الافتراضي..." 
          type="number"
          min="0"
          value={newItem.price} 
          onChange={e => setNewItem({...newItem, price: e.target.value})}
          className="bg-black border border-[#444] rounded p-2 text-sm text-white focus:border-[#D4AF37] outline-none"
        />
        {hasSubtext && (
          <input 
            placeholder="ملاحظة أو نص صغير (اختياري)..." 
            value={newItem.subtext} 
            onChange={e => setNewItem({...newItem, subtext: e.target.value})}
            className="bg-black border border-[#444] rounded p-2 text-sm text-white focus:border-[#D4AF37] outline-none"
          />
        )}
        <button onClick={handleAdd} className="mt-2 flex items-center justify-center gap-1 bg-[#222] text-[#D4AF37] border border-[#D4AF37]/50 rounded py-2 hover:bg-[#D4AF37] hover:text-black transition-colors">
          <Plus size={16}/> إضافة
        </button>
      </div>
    </div>
  );
}

function SettingStringList({ title, items = [], onChange }) {
  const [newVal, setNewVal] = useState('');

  const handleAdd = () => {
    if(!newVal.trim() || items.includes(newVal.trim())) return;
    onChange([...items, newVal.trim()]);
    setNewVal('');
  };

  const handleRemove = (valToRemove) => {
    onChange(items.filter(i => i !== valToRemove));
  };

  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-[#333]">
      <h3 className="text-xl font-bold text-white mb-4 border-b border-[#222] pb-2">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-6 max-h-48 overflow-y-auto no-scrollbar">
        {items.map((item, idx) => (
          <div key={item} className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-full border border-[#222]">
            <span className="text-sm text-gray-300">{item}</span>
            <button onClick={() => handleRemove(item)} className="text-red-500 hover:text-red-400"><X size={14}/></button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input 
          placeholder="إضافة جديد..." 
          value={newVal} 
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-black border border-[#444] rounded p-2 text-sm text-white focus:border-[#D4AF37] outline-none"
        />
        <button onClick={handleAdd} className="bg-[#222] text-[#D4AF37] border border-[#D4AF37]/50 rounded px-4 hover:bg-[#D4AF37] hover:text-black transition-colors">
          إضافة
        </button>
      </div>
    </div>
  );
}


function ContractPrintView({ booking, settings, onClose }) {
  const isPhotoBooking = ['تصوير فوتوغرافي', 'فوتوغرافي وفيديو'].includes(booking.bookingMainType || 'فوتوغرافي وفيديو');
  const isVideoBooking = ['تصوير فيديو', 'فوتوغرافي وفيديو'].includes(booking.bookingMainType || 'فوتوغرافي وفيديو');

  const pkg = settings.packages.find(p => p.id === booking.packageId);
  const displayPkgName = booking.snapshotPackage?.name || pkg?.name || 'غير محدد';
  const displayPkgPrice = booking.snapshotPackage?.price || pkg?.price || 0;

  const addonsList = booking.snapshotAddons && booking.snapshotAddons.length > 0 
    ? booking.snapshotAddons 
    : (booking.addons || []).map(aId => settings.addons.find(a => a.id === aId)).filter(Boolean);

  const videoName = booking.snapshotVideoService?.name || settings.videoServices.find(v => v.id === booking.videoServiceId)?.name;
  const videoPrice = booking.snapshotVideoService?.price || booking.videoServicePrice;

  const handleDownloadImage = async () => {
      const element = document.getElementById('contract-content');
      if (!element) return;
      try {
          const canvas = await window.html2canvas(element, { 
              scale: 2, 
              useCORS: true,
              backgroundColor: "#ffffff"
          });
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `عقد_${booking.groomName}_${booking.date}.png`;
          link.href = dataUrl;
          link.click();
      } catch (err) {
          console.error("Error saving image", err);
          alert("حدث خطأ أثناء محاولة حفظ الصورة.");
      }
  };

  const handleShareImage = async () => {
      const element = document.getElementById('contract-content');
      if (!element) return;
      try {
          const canvas = await window.html2canvas(element, { 
              scale: 2, 
              useCORS: true,
              backgroundColor: "#ffffff"
          });
          
          canvas.toBlob(async (blob) => {
              const file = new File([blob], `عقد_${booking.groomName}.png`, { type: 'image/png' });
              
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  try {
                      await navigator.share({
                          files: [file],
                          title: 'عقد تصوير',
                          text: `مرحباً، مرفق لكم تفاصيل عقد التصوير الخاص بـ ${booking.groomName} و ${booking.brideName}`
                      });
                  } catch (error) {
                      console.log('Share was aborted or failed', error);
                  }
              } else {
                  alert("عذراً، متصفحك لا يدعم المشاركة المباشرة للصور. يمكنك حفظ الصورة ومشاركتها يدوياً.");
                  handleDownloadImage();
              }
          }, 'image/png');
      } catch (err) {
          console.error("Error generating image for sharing", err);
          alert("حدث خطأ أثناء تحضير العقد للمشاركة.");
      }
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans print-container" dir="rtl">
      <div className="print:hidden flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-gray-100 p-4 rounded-xl shadow-sm border max-w-3xl mx-auto mt-4">
          <p className="text-red-600 font-bold">جاهز للطباعة والمشاركة</p>
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
              <button onClick={handleShareImage} className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-colors">
                  <Share size={18} /> مشاركة
              </button>
              <button onClick={handleDownloadImage} className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <ImageIcon size={18} /> حفظ كصورة
              </button>
              <button onClick={() => window.print()} className="bg-black text-white px-4 md:px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                  <Printer size={18} /> طباعة
              </button>
              <button onClick={onClose} className="bg-gray-300 text-black px-4 md:px-6 py-2 rounded-xl font-bold hover:bg-gray-400 transition-colors">إلغاء</button>
          </div>
      </div>

      <div id="contract-content" className="max-w-3xl mx-auto border-2 border-black p-10 relative bg-white contract-print-container">
        
        <header className="mb-8 border-b-[3px] border-black pb-6 text-center">
            <h1 className="text-4xl font-black uppercase tracking-wider mb-2" style={{ color: '#000' }}>
                {settings.studioName || 'اسم الاستوديو'}
            </h1>
            <p className="text-sm font-bold text-gray-500 tracking-[0.3em] uppercase mb-6">Official Contract</p>
            
            <div className="flex flex-col items-center gap-2 mt-4">
                <h2 className="text-2xl font-black border-b-2 border-black inline-block px-4 pb-1">عقد اتفاق وتصوير</h2>
                <p className="text-base font-bold text-gray-700 mt-2">
                    التاريخ: <span className="font-medium text-black">{new Date().toLocaleDateString('ar-EG')}</span>
                </p>
            </div>
        </header>

        <section className="mb-6">
          <h3 className="text-xl font-black mb-3 border-r-[3px] border-black pr-3 bg-gray-100 py-1">بيانات التعاقد الأساسية</h3>
          <ul className="list-none space-y-3 bg-gray-50 p-4 rounded border border-gray-200 font-medium">
            <li className="flex flex-wrap items-center">
                <span className="font-bold text-gray-700 w-32">اسم العروسين:</span> 
                <span className="font-black text-lg">{booking.groomName} & {booking.brideName}</span>
            </li>
            {booking.phone && (
              <li className="flex flex-wrap items-center">
                  <span className="font-bold text-gray-700 w-32">رقم الهاتف:</span> 
                  <span dir="ltr" className="font-black">{booking.phone}</span>
              </li>
            )}
            {booking.address && (
              <li className="flex flex-wrap items-center mt-2">
                  <span className="font-bold text-gray-700 w-32">العنوان:</span> 
                  <span className="font-black">{booking.address}</span>
              </li>
            )}
          </ul>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-black mb-3 border-r-[3px] border-black pr-3 bg-gray-100 py-1">تفاصيل المناسبة</h3>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200 text-lg">
            <p><span className="font-bold text-gray-700 block mb-1">التاريخ:</span> <span dir="ltr" className="font-bold">{booking.date}</span></p>
            <p><span className="font-bold text-gray-700 block mb-1">النوع:</span> {booking.sessionType === 'آخر' ? booking.otherSessionType : booking.sessionType}</p>
            
            {booking.location && (
               <p><span className="font-bold text-gray-700 block mb-1">اللوكيشن الأساسي:</span> {booking.location === 'آخر' ? booking.otherLocation : booking.location}</p>
            )}

            {isPhotoBooking && booking.casualLocation && booking.casualLocation !== '---' && (
               <p><span className="font-bold text-gray-700 block mb-1">لوكيشن الكاجوال:</span> {booking.casualLocation === 'آخر' ? booking.otherCasualLocation : booking.casualLocation}</p>
            )}
            
            {isPhotoBooking && booking.makeupArtist && (
               <p><span className="font-bold text-gray-700 block mb-1">الميك أب:</span> {booking.makeupArtist}</p>
            )}
            
            {isPhotoBooking && booking.makeupLeaveTime && (
               <p><span className="font-bold text-gray-700 block mb-1">وقت الخروج:</span> <span dir="ltr" className="font-bold text-red-600">{booking.makeupLeaveTime}</span></p>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-xl font-black mb-3 border-r-[3px] border-black pr-3 bg-gray-100 py-1">الخدمات والأسعار</h3>
          <div className="bg-gray-50 p-5 rounded border border-gray-200 space-y-4 text-lg">
            
            {isPhotoBooking && (
                <div>
                    <p><span className="font-bold text-gray-800">الباكيدج الأساسي (فوتوغرافيا):</span> {displayPkgName} <span className="text-gray-600 font-bold">({displayPkgPrice} ج.م)</span></p>
                    {addonsList && addonsList.length > 0 && <p className="mt-2 text-base"><span className="font-bold text-gray-700">الإضافات:</span> {addonsList.map(a => `${a.name}`).join(' ، ')}</p>}
                </div>
            )}

            {isVideoBooking && booking.snapshotVideoService && (
                <div className={isPhotoBooking ? "border-t border-gray-300 pt-3" : ""}>
                    <p><span className="font-bold text-gray-800">خدمة الفيديو:</span> {videoName} <span className="text-gray-600 font-bold">({videoPrice} ج.م)</span> {booking.videoStartTime && <span className="text-red-600 mr-2">| وقت البدء: {booking.videoStartTime}</span>}</p>
                    {booking.videoAddons && booking.videoAddons.length > 0 && <p className="mt-2 text-base"><span className="font-bold text-gray-700">الإضافات:</span> {booking.videoAddons.map(a => `${a.name}`).join(' ، ')}</p>}
                </div>
            )}
            
            {booking.notes && (
                 <div className="border-t border-gray-300 pt-3">
                    <p><span className="font-bold text-gray-700">ملاحظات إضافية:</span></p>
                    <p className="text-base mt-1 whitespace-pre-wrap">{booking.notes}</p>
                </div>
            )}
            
            <div className="border-t-[2px] border-black pt-5 mt-5 grid grid-cols-3 gap-4 text-center">
                <div className="bg-white border border-gray-300 rounded-lg p-3"><p className="text-sm font-bold text-gray-500 mb-1">إجمالي الحساب</p><p className="text-2xl font-black">{booking.totalPrice}</p></div>
                <div className="bg-white border border-gray-300 rounded-lg p-3"><p className="text-sm font-bold text-gray-500 mb-1">المدفوع (عربون)</p><p className="text-2xl font-black">{booking.paid || 0}</p></div>
                <div className="bg-black text-white rounded-lg p-3 shadow-inner"><p className="text-sm font-bold opacity-80 mb-1">المبلغ المتبقي</p><p className="text-2xl font-black">{booking.remaining}</p></div>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-black mb-3 border-r-[3px] border-black pr-3 bg-gray-100 py-1">الشروط والأحكام</h3>
          <div className="text-base leading-loose text-gray-800 bg-gray-50 p-5 rounded border border-gray-200 font-medium">
            <p>١. يقر العميل بمعاينته لأسلوب التصوير ويوافق على التعديلات الفنية التي يراها الاستوديو مناسبة.</p>
            <p>٢. يلتزم الاستوديو بتسليم العمل خلال الفترة المتفق عليها بعد اختيار الصور.</p>
            <p className="text-red-700 font-bold">٣. العربون المدفوع لا يُسترد نهائياً في حالة الإلغاء من قبل العميل لأي سبب.</p>
            {isVideoBooking && (
                <p>٤. تصوير الفيديو Full HD ويُسلم على فلاشة. (لا يمكن الرجوع للاستوديو لاسترجاع البيانات بعد مرور ٣ أشهر).</p>
            )}
          </div>
        </section>

        <footer className="flex justify-between px-12 pt-8 border-t-[2px] border-black">
          <div className="text-center">
            <p className="font-bold text-xl mb-12">توقيع الاستوديو</p>
            <p className="border-t-2 border-gray-400 w-56 pt-2 font-bold text-gray-600 text-lg">{settings.studioName || 'اسم الاستوديو'}</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl mb-12">توقيع العميل</p>
            <p className="border-t-2 border-gray-400 w-56 pt-2"></p>
          </div>
        </footer>
      </div>

      <style>{`
        @media print {
          body { background: white; margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}