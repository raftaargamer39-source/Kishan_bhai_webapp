import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { AppSidebar } from "./components/AppSidebar";
import { TopHeader } from "./components/TopHeader";
import { NfcModal } from "./components/NfcModal";
import { ToastContainer } from "./components/ToastContainer";
import { ApiRetryNotification } from "./components/ApiRetryNotification";
import { LogoIntroSplash } from "./components/LogoIntroSplash";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { OfflineManagerModal } from "./components/OfflineManagerModal";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { DevicePreviewToolbar, DeviceMode } from "./components/DevicePreviewToolbar";
import { motion, AnimatePresence } from "motion/react";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { FarmerDashboard } from "./pages/FarmerDashboard";
import { ChampionDashboard } from "./pages/ChampionDashboard";
import { BuyerDashboard } from "./pages/BuyerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { VirtualFarmClustersPage } from "./pages/VirtualFarmClusters";
import { BulkBuyingPage } from "./pages/BulkBuying";
import { HarvestPoolingPage } from "./pages/HarvestPooling";
import { BuyerMarketplacePage } from "./pages/BuyerMarketplace";
import { BuyerOffersPage } from "./pages/BuyerOffersPage";
import { MachineryPage } from "./pages/Machinery";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { WeatherModule } from "./pages/WeatherModule";
import { TransactionsPage } from "./pages/TransactionsPage";
import { FarmProfilePage } from "./pages/FarmProfile";
import { AuthPage } from "./pages/AuthPage";
import { LoginPage } from "./pages/LoginPage";
import { MyCropsPage } from "./pages/MyCropsPage";
import { DiseaseScannerPage } from "./pages/DiseaseScannerPage";
import { SmartIrrigationPage } from "./pages/SmartIrrigationPage";
import { SoilHealthPage } from "./pages/SoilHealthPage";
import { MarketPricesPage } from "./pages/MarketPrices/MarketPricesPage";
import { ProfitCalculatorPage } from "./pages/ProfitCalculatorPage";
import { CropRecommendationPage } from "./pages/CropRecommendationPage";
import { GovernmentSchemesPage } from "./pages/GovernmentSchemesPage";
import { FarmDiaryPage } from "./pages/FarmDiaryPage";
import { CommunityPage } from "./pages/CommunityPage";
import { TalkToExpertPage } from "./pages/TalkToExpertPage";
import { AlertsPage } from "./pages/AlertsPage";
import { SettingsPage } from "./pages/SettingsPage";

const AppContent: React.FC = () => {
  const {
    currentView,
    isLogoSplashOpen,
    setIsLogoSplashOpen,
  } = useApp();

  const [deviceMode, setDeviceMode] = useState<DeviceMode>('full');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentView) {
      case "landing":
        return <LandingPage />;
      case "farmer-dashboard":
        return <FarmerDashboard />;
      case "champion-dashboard":
        return <ChampionDashboard />;
      case "buyer-dashboard":
        return <BuyerDashboard />;
      case "admin-dashboard":
        return <AdminDashboard />;
      case "clusters":
        return <VirtualFarmClustersPage />;
      case "bulk-buying":
      case "group-buying":
        return <BulkBuyingPage />;
      case "harvest":
        return <HarvestPoolingPage />;
      case "marketplace":
        return <BuyerMarketplacePage />;
      case "buyer-offers":
        return <BuyerOffersPage />;
      case "machinery":
        return <MachineryPage />;
      case "ai-assistant":
        return <AIAssistantPage />;
      case "weather":
        return <WeatherModule />;
      case "transactions":
        return <TransactionsPage />;
      case "profile":
        return <FarmProfilePage />;
      case "my-crops":
        return <MyCropsPage />;
      case "disease-scanner":
        return <DiseaseScannerPage />;
      case "smart-irrigation":
        return <SmartIrrigationPage />;
      case "soil-health":
        return <SoilHealthPage />;
      case "market-prices":
        return <MarketPricesPage />;
      case "profit-calculator":
        return <ProfitCalculatorPage />;
      case "crop-recommendation":
        return <CropRecommendationPage />;
      case "government-schemes":
        return <GovernmentSchemesPage />;
      case "farm-diary":
        return <FarmDiaryPage />;
      case "community":
        return <CommunityPage />;
      case "talk-to-expert":
        return <TalkToExpertPage />;
      case "alerts":
        return <AlertsPage />;
      case "settings":
        return <SettingsPage />;
      case "auth":
      case "login":
      case "signin":
        return <LoginPage initialMode="login" />;
      case "register":
      case "signup":
        return <LoginPage initialMode="register" />;
      case "forgot-password":
      case "reset-password":
        return <LoginPage initialMode="forgot-password" />;
      case "verify-otp":
        return <LoginPage initialMode="otp-login" />;
      default:
        return <LandingPage />;
    }
  };

  const isAuthRoute =
    currentView === "login" ||
    currentView === "auth" ||
    currentView === "signin" ||
    currentView === "register" ||
    currentView === "signup" ||
    currentView === "forgot-password" ||
    currentView === "reset-password" ||
    currentView === "verify-otp";

  const isLanding = currentView === "landing" || isAuthRoute;

  // Buyer and Champion sections get a dedicated full-width layout (no sidebar, no bottom nav)
  const isFullWidthView = currentView === "buyer-dashboard" || currentView === "champion-dashboard";

  // Device frame wrapper style classes
  let frameContainerClass = "min-h-screen bg-transparent flex flex-col text-stone-900 font-sans antialiased selection:bg-green-200 w-full";
  let innerFrameStyle: React.CSSProperties = {};

  if (deviceMode === 'mobile') {
    frameContainerClass = "my-auto mx-auto w-[375px] h-[812px] max-h-[92vh] rounded-[40px] border-[12px] border-stone-800 bg-white shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300";
  } else if (deviceMode === 'tablet') {
    frameContainerClass = "my-auto mx-auto w-[768px] h-[1024px] max-h-[94vh] rounded-[32px] border-[16px] border-stone-800 bg-white shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300";
  } else if (deviceMode === 'desktop') {
    frameContainerClass = "my-auto mx-auto w-[1280px] max-w-[96vw] min-h-[85vh] rounded-2xl border border-stone-300 bg-white shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300 my-6";
  }

  const wrapperClass = deviceMode !== 'full' 
    ? "min-h-screen bg-stone-950/90 flex items-center justify-center p-2 sm:p-6 overflow-auto" 
    : "min-h-screen bg-transparent flex flex-col text-stone-900 font-sans antialiased selection:bg-green-200 w-full";

  return (
    <div className={wrapperClass}>
      <div className={frameContainerClass}>
        {/* Realistic Mobile / Tablet Status Bar */}
        {(deviceMode === 'mobile' || deviceMode === 'tablet') && (
          <div className="bg-stone-900 text-white px-6 py-2 flex items-center justify-between text-xs font-mono select-none shrink-0 z-50">
            <span>9:41</span>
            {deviceMode === 'mobile' && (
              <div className="w-24 h-4 bg-black rounded-full mx-auto flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-stone-800"></div>
              </div>
            )}
            <div className="flex items-center space-x-2 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Top Header - Hidden on all authentication pages */}
        {!isAuthRoute && (
          <div className="shrink-0 z-40">
            <TopHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
          </div>
        )}

        <div className="flex-1 flex w-full relative overflow-hidden">
          {/* Dark-Green Vertical App Sidebar - hidden on Buyer/Champion Dashboard */}
          {!isAuthRoute && !isFullWidthView && (
            <AppSidebar
              isOpenOnMobile={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          )}

          <main
            className={`flex-1 overflow-y-auto scroll-smooth ${
              isFullWidthView
                ? "min-h-screen pb-0 bg-[#F0F4F0]"
                : isAuthRoute
                ? "min-h-screen pb-0 bg-[#F7F8F2]"
                : "min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 pb-24 bg-[#F7F8F2]"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={isFullWidthView ? "w-full h-full" : "w-full h-full max-w-7xl mx-auto"}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Realistic Home Indicator for Mobile */}
        {deviceMode === 'mobile' && (
          <div className="bg-white dark:bg-stone-900 py-2 flex items-center justify-center shrink-0 z-50">
            <div className="w-32 h-1 bg-stone-300 dark:bg-stone-700 rounded-full"></div>
          </div>
        )}

        {/* Global Modals & Notifications */}
        <ApiRetryNotification />
        <NfcModal />
        <OfflineManagerModal />
        <LogoIntroSplash
          isOpen={isLogoSplashOpen}
          onClose={() => setIsLogoSplashOpen(false)}
        />
        <ToastContainer />
        <ScrollToTopButton />
        {!isLanding && !isAuthRoute && !isFullWidthView && <MobileBottomNav />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
