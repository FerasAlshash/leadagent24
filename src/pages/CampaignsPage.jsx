import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  PlusCircle, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Users, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { supabase } from '../lib/supabase';
import CampaignCard from '../components/CampaignCard';
import CampaignModal from '../components/CampaignModal';
import PageHeader from '../components/PageHeader';

const FASTAPI_URL = "http://127.0.0.1:8000";

export default function CampaignsPage({ 
  onOpenCampaign, 
  isModalOpen, 
  setIsModalOpen, 
  campaigns = [],
  leads = [],
  fetchCampaigns,
  loading = false
}) {
  const { session } = useAuth();
  const { confirm } = useConfirm();
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Helper to ensure fresh token
  const getValidToken = async () => {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || session?.access_token;
  };

  // Proactively fetch campaigns on mount to avoid empty state after tab switch
  useEffect(() => {
    if (fetchCampaigns) {
      fetchCampaigns();
    }
  }, []);

  // Handle Save (Create or Update)
  const handleSaveCampaign = async (payload, campaignId) => {
    const token = await getValidToken();
    if (!token) throw new Error('Not authenticated');

    if (campaignId) {
      // Update
      const res = await fetch(`${FASTAPI_URL}/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to update campaign');
      }
    } else {
      // Create
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
    }

    if (fetchCampaigns) await fetchCampaigns();
  };

  // Handle Delete
  const handleDeleteCampaign = async (campaignId) => {
    const ok = await confirm({
      title: 'Delete Campaign',
      message: 'Are you sure you want to delete this campaign? All extracted leads and data associated with this campaign will also be permanently deleted.',
      confirmText: 'Delete Campaign',
      isDanger: true
    });
    if (!ok) return;

    try {
      const token = await getValidToken();
      const res = await fetch(`${FASTAPI_URL}/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete campaign');
      }

      if (fetchCampaigns) await fetchCampaigns();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Aggregated totals
  const totalLeadsAcross = campaigns.reduce((acc, c) => acc + (c.total_leads || 0), 0);
  const totalSentAcross = campaigns.reduce((acc, c) => acc + (c.sent_leads || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header Card */}
      <PageHeader
        icon={Briefcase}
        title="My Business Campaigns"
        subtitle="Each campaign operates as an independent company workspace with its own prospects, search criteria, and value pitch."
        badges={
          <>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Multi-Tenant Campaign Hub
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600">
              {campaigns.length} {campaigns.length === 1 ? 'Workspace' : 'Workspaces'}
            </span>
          </>
        }
        actions={
          <button
            type="button"
            onClick={() => {
              setEditingCampaign(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        }
      />

      {/* Aggregated Unified Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div className="flex items-center gap-3.5 sm:pr-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{campaigns.length}</span>
              <span className="text-xs font-bold text-slate-700">Active Workspaces</span>
            </div>
            <p className="text-[11px] text-slate-400">Independent company campaigns</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 sm:px-6 pt-3 sm:pt-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{totalLeadsAcross}</span>
              <span className="text-xs font-bold text-slate-700">Total Scoped Leads</span>
            </div>
            <p className="text-[11px] text-slate-400">Across all targeted campaigns</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 sm:pl-6 pt-3 sm:pt-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-700">{totalSentAcross}</span>
              <span className="text-xs font-bold text-emerald-800">Emails Sent</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {totalLeadsAcross > 0 ? Math.round((totalSentAcross / totalLeadsAcross) * 100) : 0}% Reached
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Verified automated outbound emails</p>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading your campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 max-w-2xl mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No Campaigns Configured Yet</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Create your first campaign to define your company identity, value pitch, and target client niche. You can then run targeted scrapes and view isolated results per campaign.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingCampaign(null);
              setIsModalOpen(true);
            }}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Campaign</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {campaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              leads={leads.filter(l => l.campaign_id === camp.id)}
              onOpen={() => onOpenCampaign(camp)}
              onDelete={handleDeleteCampaign}
            />
          ))}
        </div>
      )}

      {/* Campaign Create/Edit Modal */}
      <CampaignModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCampaign(null);
        }}
        onSave={handleSaveCampaign}
        initialCampaign={editingCampaign}
      />
    </div>
  );
}
