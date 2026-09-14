import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';

// 1. Lazy-loaded Core SaaS Pages (Code Splitting)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const CampaignDetailPage = lazy(() => import('./pages/CampaignDetailPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));
const AccountSettingsPage = lazy(() => import('./pages/AccountSettingsPage'));
const AdminConsolePage = lazy(() => import('./pages/AdminConsolePage'));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'));

// 2. Modals & Workspace Components
import Sidebar from './components/Sidebar';
import NotificationDropdown from './components/NotificationDropdown';
import CampaignModal from './components/CampaignModal';
import PayloadPreviewModal from './components/PayloadPreviewModal';
import { Menu, Briefcase } from 'lucide-react';

function PageLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] py-16 animate-in fade-in duration-150">
      <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-xs font-semibold text-slate-400">Loading view...</span>
    </div>
  );
}

const DEFAULT_WEBHOOK_URL = "https://n8n.inexlify.com/webhook-test/lead-machine";
const FASTAPI_URL = "http://127.0.0.1:8000";

// Dedicated Campaign Workspace Route Wrapper with Deep-linking & Direct Fetch
function CampaignWorkspaceRoute({
  allCampaigns,
  loadingData,
  onLaunchSearch,
  isSearching,
  onUpdateCampaign,
  onDeleteCampaign,
  refreshAllData
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [directCampaign, setDirectCampaign] = useState(null);
  const [fetchingDirect, setFetchingDirect] = useState(false);

  // Check cached campaigns in memory
  const foundCampaign = allCampaigns.find(c => String(c.id) === String(id));

  // If not found in memory (e.g. direct page refresh on /campaigns/:id), fetch directly from API
  useEffect(() => {
    if (!foundCampaign && id) {
      let isMounted = true;
      setFetchingDirect(true);
      const fetchSingleCampaign = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const token = data?.session?.access_token;
          const res = await fetch(`${FASTAPI_URL}/api/campaigns/${id}`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const json = await res.json();
            if (isMounted) {
              setDirectCampaign(json.campaign || json);
            }
          }
        } catch (err) {
          console.warn('Could not fetch single campaign:', err);
        } finally {
          if (isMounted) setFetchingDirect(false);
        }
      };
      fetchSingleCampaign();
      return () => { isMounted = false; };
    }
  }, [id, foundCampaign]);

  const activeCampaign = foundCampaign || directCampaign;

  // Only show full loading spinner if we don't have ANY campaign in memory yet
  if (!activeCampaign && (loadingData || fetchingDirect)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Loading Campaign Workspace...</span>
      </div>
    );
  }

  if (!activeCampaign) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4 max-w-md mx-auto my-12">
        <h3 className="text-lg font-bold text-slate-900">Campaign Not Found</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          The requested campaign could not be found or you may not have permission to view it.
        </p>
        <button
          type="button"
          onClick={() => navigate('/campaigns')}
          className="px-5 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-2xs"
        >
          Back to All Campaigns
        </button>
      </div>
    );
  }

  return (
    <CampaignDetailPage
      campaign={activeCampaign}
      onBack={() => navigate('/campaigns')}
      onLaunchSearch={onLaunchSearch}
      isSearching={isSearching}
      onUpdateCampaign={onUpdateCampaign}
      onDeleteCampaign={onDeleteCampaign}
    />
  );
}

export default function App() {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isSuperAdmin = (user?.email || '').toLowerCase() === 'ferasalshash@gmail.com';

  // Guest routing state
  const [guestView, setGuestView] = useState('landing');
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  
  // Data state
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [allLeads, setAllLeads] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState(null);

  // Notifications State for Header Bell Dropdown
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'campaign',
      title: 'Campaign Ready: Marketing Agencies in London',
      message: '5 verified B2B leads gathered and verified in your workspace.',
      time: '10m ago',
      read: false,
      target: {
        tab: 'campaign-detail',
        campaignName: 'Marketing Agencies in London'
      }
    },
    {
      id: 'notif-2',
      type: 'email',
      title: 'Cold Outreach Sequence Active',
      message: 'Outreach emails sent to verified decision-maker contacts with high delivery rate.',
      time: '25m ago',
      read: false,
      target: {
        tab: 'dashboard'
      }
    },
    {
      id: 'notif-3',
      type: 'lead',
      title: 'Google Ratings & Reviews Synced',
      message: 'All 5 companies have updated star ratings and multi-channel links.',
      time: '1h ago',
      read: true,
      target: {
        tab: 'campaign-detail',
        campaignName: 'Marketing Agencies in London'
      }
    }
  ]);

  // Navigate to relevant section when notification is clicked
  const handleNotificationClick = (item) => {
    // 1. Mark clicked notification as read
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));

    // 2. Perform contextual routing via navigate
    if (item.target) {
      if (item.target.tab === 'campaign-detail' && item.target.campaignId) {
        navigate(`/campaigns/${item.target.campaignId}`);
      } else if (item.target.tab === 'campaigns') {
        navigate('/campaigns');
      } else if (item.target.tab === 'dashboard') {
        navigate('/dashboard');
      } else if (item.target.tab === 'settings') {
        navigate('/settings');
      } else if (item.target.tab === 'admin') {
        navigate('/admin');
      } else if (item.target.campaignId) {
        navigate(`/campaigns/${item.target.campaignId}`);
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Modals & Navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isPayloadOpen, setIsPayloadOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('n8n_lead_machine_webhook') || DEFAULT_WEBHOOK_URL;
  });

  // Fetch all campaigns for the user
  const fetchCampaigns = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      let token = sessionData?.session?.access_token || session?.access_token;
      
      if (!token) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        token = refreshData?.session?.access_token;
      }
      if (!token) return;

      let res = await fetch(`${FASTAPI_URL}/api/campaigns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        // Auto refresh session and retry once
        const { data: refreshData } = await supabase.auth.refreshSession();
        const freshToken = refreshData?.session?.access_token;
        if (freshToken) {
          res = await fetch(`${FASTAPI_URL}/api/campaigns`, {
            headers: { 'Authorization': `Bearer ${freshToken}` }
          });
        }
      }

      if (res.ok) {
        const data = await res.json();
        setAllCampaigns(data || []);
        
        // Update selectedCampaign if currently viewed
        if (selectedCampaign) {
          const updated = (data || []).find(c => c.id === selectedCampaign.id);
          if (updated) setSelectedCampaign(updated);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err);
    }
  };

  // Fetch all leads for the user across campaigns
  const fetchAllLeads = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAllLeads(data);
      }
    } catch (err) {
      console.warn('Failed to fetch leads:', err);
    }
  };

  // Synchronize active webhook setting from backend
  const syncWebhookFromBackend = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || session?.access_token;
      if (!token) return;
      const res = await fetch(`${FASTAPI_URL}/api/admin/webhook`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        if (result?.config?.active_url) {
          setWebhookUrl(result.config.active_url);
          localStorage.setItem('n8n_lead_machine_webhook', result.config.active_url);
        }
      }
    } catch {
      // Ignored for non-admins
    }
  };

  // Initial and reactive data sync (stale-while-revalidate pattern)
  const refreshAllData = async (isInitial = false) => {
    if (isInitial && allCampaigns.length === 0) {
      setLoadingData(true);
    }
    try {
      await Promise.all([fetchCampaigns(), fetchAllLeads(), syncWebhookFromBackend()]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refreshAllData(true);

      // Realtime subscription to leads table
      const channel = supabase
        .channel(`global-user-leads-channel-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leads', filter: `user_id=eq.${user.id}` },
          () => {
            fetchAllLeads();
            fetchCampaigns();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  // Navigate to Campaign Detail Workspace via URL
  const handleOpenCampaign = (campaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  // Helper to ensure fresh token from Supabase storage
  const getValidToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || session?.access_token;
  };

  // Create Campaign Handler
  const handleCreateCampaign = async (payload) => {
    const token = await getValidToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${FASTAPI_URL}/api/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to create campaign');
    }

    const resData = await res.json();
    await refreshAllData();

    if (resData.campaign) {
      const created = resData.campaign;
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'campaign',
        title: `Campaign Created: ${created.company_name || created.title}`,
        message: `New workspace configured for ${created.business_type} in ${created.location}.`,
        time: 'Just now',
        read: false,
        target: {
          tab: 'campaign-detail',
          campaignId: created.id,
          campaignName: created.company_name || created.title
        }
      };
      setNotifications(prev => [newNotif, ...prev]);
      navigate(`/campaigns/${created.id}`);
    }
  };

  // Update Campaign Handler
  const handleUpdateCampaign = async (campaignId, payload) => {
    const token = await getValidToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${FASTAPI_URL}/api/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error('Failed to update campaign');
    }

    await refreshAllData();
  };

  // Delete Campaign Handler
  const handleDeleteCampaign = async (campaignId) => {
    const token = await getValidToken();
    if (!token) return;

    try {
      const res = await fetch(`${FASTAPI_URL}/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete campaign');

      await refreshAllData();
      navigate('/campaigns');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Launch Search inside Campaign Handler
  const handleLaunchSearchInCampaign = async (searchPayload) => {
    setIsSearching(true);
    setStatus(null);

    try {
      const token = await getValidToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${FASTAPI_URL}/api/campaigns/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          campaign_id: searchPayload.campaign_id,
          campaign_title: searchPayload.campaign_title,
          "Business Type": searchPayload["Business Type"],
          "Location": searchPayload["Location"],
          "Lead Number": Number(searchPayload["Lead Number"]) || 10,
          "Email Style": searchPayload["Email Style"] || "Professional",
          "Your Name": searchPayload["Your Name"] || "Alex",
          "Your Company/Agency Name": searchPayload["Your Company/Agency Name"] || "",
          "What does your company do?": searchPayload["What does your company do?"] || "",
          schedule_type: "once",
          webhook_url: webhookUrl
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      // Add notification to header bell dropdown
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'campaign',
        title: `Prospecting Initiated: ${searchPayload["Business Type"] || 'Target Business'}`,
        message: `Searching and qualifying verified leads for ${searchPayload["Your Company/Agency Name"] || 'Campaign'} in ${searchPayload["Location"] || 'Target Area'}.`,
        time: 'Just now',
        read: false,
        target: {
          tab: 'campaign-detail',
          campaignId: selectedCampaign?.id,
          campaignName: selectedCampaign?.company_name || selectedCampaign?.title
        }
      };
      setNotifications(prev => [newNotif, ...prev]);

      await refreshAllData();
    } catch (err) {
      console.error('Error dispatching search:', err);
      const errorNotif = {
        id: `notif-${Date.now()}`,
        type: 'system',
        title: 'Prospecting Search Failed',
        message: 'Could not complete the search request. Please verify your connection or try again.',
        time: 'Just now',
        read: false,
        target: {
          tab: 'campaigns'
        }
      };
      setNotifications(prev => [errorNotif, ...prev]);
    } finally {
      setIsSearching(false);
    }
  };

  // Loading spinner during auth hydration
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-500">Initializing Lead Machine...</span>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: UNAUTHENTICATED GUESTS (STRICT ISOLATION - NO WORKSPACE EXPOSURE)
  // =========================================================================
  if (!user) {
    if (guestView === 'auth' || pathname === '/auth') {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <AuthPage
            initialMode={authMode}
            onBackToHome={() => {
              setGuestView('landing');
              navigate('/');
            }}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <LandingPage
          onGetStarted={() => {
            setAuthMode('signup');
            setGuestView('auth');
            navigate('/auth');
          }}
          onSignIn={() => {
            setAuthMode('signin');
            setGuestView('auth');
            navigate('/auth');
          }}
        />
      </Suspense>
    );
  }

  // Active route matching for header & breadcrumbs
  const isDashboard = pathname === '/dashboard' || pathname === '/';
  const isCampaigns = pathname === '/campaigns';
  const isCampaignDetail = pathname.startsWith('/campaigns/') && pathname !== '/campaigns';
  const isAudit = pathname.startsWith('/audit');
  const isSettings = pathname.startsWith('/settings');
  const isAdminPath = pathname.startsWith('/admin');

  // Look up active campaign for header breadcrumbs
  const campaignIdMatch = pathname.match(/^\/campaigns\/([^/]+)/);
  const currentCampaignId = campaignIdMatch ? campaignIdMatch[1] : null;
  const headerCampaign = currentCampaignId 
    ? allCampaigns.find(c => String(c.id) === String(currentCampaignId)) 
    : null;

  // =========================================================================
  // VIEW 2: AUTHENTICATED USERS (STREAMLINED SAAS WORKSPACE)
  // =========================================================================
  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        {/* Top Header Bar */}
        <header className="h-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Workspace</span>
                <span>/</span>
                {isDashboard && <span className="text-slate-700 font-semibold">Dashboard</span>}
                {isCampaigns && <span className="text-slate-700 font-semibold">My Campaigns</span>}
                {isAudit && <span className="text-emerald-700 font-semibold">Activity Audit</span>}
                {isSettings && <span className="text-slate-700 font-semibold">Account & Security</span>}
                {isAdminPath && <span className="text-purple-700 font-semibold">Admin Automation</span>}
                {isCampaignDetail && (
                  <>
                    <button 
                      onClick={() => navigate('/campaigns')}
                      className="hover:underline text-slate-500"
                    >
                      Campaigns
                    </button>
                    <span>/</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {headerCampaign?.company_name || headerCampaign?.title || 'Campaign Workspace'}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 capitalize leading-tight mt-0.5">
                {isDashboard && 'Analytics & Outreach Intelligence'}
                {isCampaigns && 'My Outbound Campaigns'}
                {isAudit && 'Activity & Outbound Audit Log'}
                {isCampaignDetail && (headerCampaign?.company_name || headerCampaign?.title || 'Campaign Workspace')}
                {isSettings && 'Account Settings & Security'}
                {isAdminPath && '👑 Admin Automation Console'}
              </h2>
            </div>
          </div>

          {/* Notifications, User Profile & Logout */}
          <div className="flex items-center gap-3">
            {/* Dedicated Notifications Bell Dropdown */}
            <NotificationDropdown
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onClearAll={handleClearAllNotifications}
            />

            <div className="flex items-center pl-3 border-l border-slate-200">
              <div 
                className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0 aspect-square cursor-default ring-2 ring-emerald-500/20 select-none"
                title={user.email || 'User Profile'}
              >
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Main Page Content via URL Routes */}
        <main className="flex-1 w-full workspace-fluid-layout">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route 
                path="/" 
                element={
                  <DashboardPage
                    leads={allLeads}
                    campaigns={allCampaigns}
                    onOpenCampaign={handleOpenCampaign}
                    onCreateCampaign={() => setIsCreateCampaignOpen(true)}
                    onRefresh={refreshAllData}
                    loading={loadingData}
                  />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <DashboardPage
                    leads={allLeads}
                    campaigns={allCampaigns}
                    onOpenCampaign={handleOpenCampaign}
                    onCreateCampaign={() => setIsCreateCampaignOpen(true)}
                    onRefresh={refreshAllData}
                    loading={loadingData}
                  />
                } 
              />
              <Route 
                path="/campaigns" 
                element={
                  <CampaignsPage
                    campaigns={allCampaigns}
                    leads={allLeads}
                    fetchCampaigns={fetchCampaigns}
                    onOpenCampaign={handleOpenCampaign}
                    isModalOpen={isCreateCampaignOpen}
                    setIsModalOpen={setIsCreateCampaignOpen}
                    loading={loadingData}
                  />
                } 
              />
              <Route 
                path="/campaigns/:id" 
                element={
                  <CampaignWorkspaceRoute
                    allCampaigns={allCampaigns}
                    loadingData={loadingData}
                    onLaunchSearch={handleLaunchSearchInCampaign}
                    isSearching={isSearching}
                    onUpdateCampaign={handleUpdateCampaign}
                    onDeleteCampaign={handleDeleteCampaign}
                    refreshAllData={refreshAllData}
                  />
                } 
              />
              <Route 
                path="/audit" 
                element={
                  <AuditLogPage
                    leads={allLeads}
                    campaigns={allCampaigns}
                    onRefresh={refreshAllData}
                    loading={loadingData}
                  />
                } 
              />
              <Route 
                path="/docs" 
                element={<DocumentationPage />} 
              />
              <Route 
                path="/settings" 
                element={
                  <AccountSettingsPage
                    leadsCount={allLeads.length}
                    campaignsCount={allCampaigns.length}
                  />
                } 
              />
              <Route 
                path="/admin" 
                element={
                  isSuperAdmin ? (
                    <AdminConsolePage 
                      onOpenPayload={() => setIsPayloadOpen(true)}
                      currentWebhookUrl={webhookUrl}
                      onWebhookUpdated={(newUrl) => {
                        setWebhookUrl(newUrl);
                        localStorage.setItem('n8n_lead_machine_webhook', newUrl);
                      }}
                    />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                } 
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Global Campaign Create Modal */}
      <CampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        onSave={handleCreateCampaign}
      />

      {/* Live Payload Preview Modal (For Admin) */}
      <PayloadPreviewModal
        isOpen={isPayloadOpen}
        onClose={() => setIsPayloadOpen(false)}
        payload={{
          tenant_id: user.id,
          campaigns_count: allCampaigns.length,
          leads_count: allLeads.length
        }}
      />
    </div>
  );
}
