import React, { useMemo } from 'react';
import { Language, Translations, User, Product, Alert, MarketTrendData, Crop, ConnectionRequest, Conversation } from '../types';
import { QuickActions } from './dashboard/QuickActions';
import { UserStats } from './dashboard/UserStats';
import { WeatherCard } from './dashboard/WeatherCard';
import { FarmingTips } from './dashboard/FarmingTips';
import { ActivityFeed } from './dashboard/ActivityFeed';
import { MarketplaceSummary } from './dashboard/MarketplaceSummary';
import { Alerts } from './dashboard/Alerts';
import { MarketTrends } from './dashboard/MarketTrends';
import { CURRENT_USER_ID, AI_USER_ID } from '../constants';


interface DashboardPageProps {
  translations: Translations;
  language: Language;
  currentUser: User;
  users: Record<string, User>;
  conversations: Conversation[];
  products: Product[];
  alerts: Alert[];
  marketTrends: Record<Crop, MarketTrendData[]>;
  onAcceptRequest: (request: ConnectionRequest) => void;
  onRejectRequest: (request: ConnectionRequest) => void;
  setActiveView: (view: 'dashboard' | 'chat' | 'settings') => void;
}

const DashboardPage: React.FC<DashboardPageProps> = (props) => {
  const { 
    translations, 
    language, 
    currentUser, 
    users, 
    conversations, 
    products, 
    alerts, 
    marketTrends,
    onAcceptRequest,
    onRejectRequest,
    setActiveView
  } = props;
  const t = translations.dashboard;

  const connectionCount = useMemo(() => conversations.filter(c =>
    c.type === 'dm' &&
    c.participants.includes(CURRENT_USER_ID) &&
    !c.participants.includes(AI_USER_ID)
  ).length, [conversations]);

  const productsListedCount = products.filter(p => p.sellerId === CURRENT_USER_ID).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:pb-20">
       <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-300">
          {t.title}
        </h1>
        
        <QuickActions translations={t.quickActions} setActiveView={setActiveView} />

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {/* Column 1 */}
            <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
              <UserStats 
                translations={t.userStats} 
                connections={connectionCount} 
                productsSold={productsListedCount} 
              />
              <WeatherCard translations={translations.weather} />
            </div>

            {/* Column 2 */}
            <div className="lg:col-span-2 xl:col-span-2 flex flex-col gap-6">
                <FarmingTips translations={translations.farmingTips} language={language} />
                <ActivityFeed 
                    translations={t.activityFeed}
                    currentUser={currentUser}
                    users={users}
                    conversations={conversations}
                    onAcceptRequest={onAcceptRequest}
                    onRejectRequest={onRejectRequest}
                />
            </div>

            {/* Column 3 */}
            <div className="lg:col-span-3 xl:col-span-1 flex flex-col gap-6 lg:mt-6 xl:mt-0">
                <MarketplaceSummary translations={t.marketplace} products={products} users={users} />
                <MarketTrends translations={t.marketTrends} marketTrends={marketTrends} />
                <Alerts translations={t.alerts} alerts={alerts} />
            </div>
        </div>
    </div>
  );
};

export default DashboardPage;
