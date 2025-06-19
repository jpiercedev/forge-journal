// Smart Import Admin Page

import { useEffect, useState } from 'react';
import AdminLayout from 'components/admin/AdminLayout';
import { AdminProvider, useAdmin, withAdminAuth } from 'components/admin/AdminContext';
import SmartImportInterface from 'components/SmartImport/SmartImportInterface';
import { ImportResult } from 'types/smart-import';

function SmartImportPage() {
  const { state } = useAdmin();

  const handleImportComplete = (result: ImportResult) => {
    console.log('Import completed:', result);
    // Could add analytics or notifications here
  };

  return (
    <AdminLayout
      title="Smart Import"
      description="AI-powered content import for Forge Journal"
      currentSection="smart-import"
    >
      {/* Main Smart Import Interface */}
      <SmartImportInterface onComplete={handleImportComplete} />
    </AdminLayout>
  );
}

const SmartImportWithAuth = withAdminAuth(SmartImportPage)

export default function SmartImportPageWrapper() {
  return (
    <AdminProvider>
      <SmartImportWithAuth />
    </AdminProvider>
  )
}


