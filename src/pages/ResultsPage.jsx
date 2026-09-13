import React from 'react';
import ResultsTable from '../components/ResultsTable';

export default function ResultsPage({
  results,
  onClear,
  onOpenAuth,
  selectedCampaign,
  onClearCampaignFilter,
  allCampaigns,
  onSelectCampaign
}) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <ResultsTable
        results={results}
        onClear={onClear}
        onOpenAuth={onOpenAuth}
        selectedCampaign={selectedCampaign}
        onClearCampaignFilter={onClearCampaignFilter}
        allCampaigns={allCampaigns}
        onSelectCampaign={onSelectCampaign}
      />
    </div>
  );
}
