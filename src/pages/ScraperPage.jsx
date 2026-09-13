import React from 'react';
import LeadForm from '../components/LeadForm';
import ExecutionTimer from '../components/ExecutionTimer';

export default function ScraperPage({
  formData,
  setFormData,
  onLaunchCampaign,
  isLoading,
  webhookUrl,
  selectedCampaign,
  allCampaigns,
  onSelectCampaign,
  onClearCampaign
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Live Execution Timer */}
      {isLoading && (
        <ExecutionTimer
          targetQuery={formData["Business Type"]}
          targetLocation={formData["Location"]}
          leadCount={formData["Lead Number"]}
        />
      )}

      {/* The Campaign Setup Form */}
      <LeadForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onLaunchCampaign}
        isLoading={isLoading}
        webhookUrl={webhookUrl}
        selectedCampaign={selectedCampaign}
        allCampaigns={allCampaigns}
        onSelectCampaign={onSelectCampaign}
        onClearCampaign={onClearCampaign}
      />
    </div>
  );
}
