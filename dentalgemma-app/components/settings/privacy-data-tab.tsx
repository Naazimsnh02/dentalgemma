'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppStore } from '@/store/app-store';
import { Shield, Trash2, Download, Database, History, BookMarked, MapPin, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PrivacyDataTab() {
  const { 
    clearHistory, 
    treatments, 
    savedPapers, 
    favoriteDentists,
    analysisHistory,
    settings,
  } = useAppStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleClearHistory = () => {
    clearHistory();
    showToast('History cleared', 'All analysis history has been removed.');
  };

  const handleClearSavedPapers = () => {
    // Clear saved papers from localStorage
    localStorage.removeItem('dentalgemma-app-storage');
    window.location.reload();
  };

  const handleClearAllData = () => {
    // Clear all localStorage
    localStorage.clear();
    window.location.reload();
  };

  const handleExportData = () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        analysisHistory,
        treatments,
        savedPapers,
        favoriteDentists,
        settings,
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `dentalgemma-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Data exported', 'Your data has been exported successfully.');
    } catch (error) {
      showToast('Export failed', 'Failed to export data. Please try again.', 'destructive');
    } finally {
      setIsExporting(false);
    }
  };

  const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
    // Simple toast implementation - you can replace with actual toast hook
    alert(`${title}: ${description}`);
  };

  const getStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // KB
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy & Data
        </CardTitle>
        <CardDescription>
          Manage your data and privacy settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Overview */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Your Data
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Analysis History:</span>
              <span className="font-medium">{analysisHistory.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Treatments:</span>
              <span className="font-medium">{treatments.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Saved Papers:</span>
              <span className="font-medium">{savedPapers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Favorite Dentists:</span>
              <span className="font-medium">{favoriteDentists.length}</span>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Storage used: {getStorageSize()} KB
            </p>
          </div>
        </div>

        {/* Export Data */}
        <div className="space-y-2">
          <h3 className="font-medium">Export Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Download all your data in JSON format
          </p>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="outline"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export All Data (JSON)'}
          </Button>
        </div>

        {/* Clear History */}
        <div className="space-y-2">
          <h3 className="font-medium">Clear Analysis History</h3>
          <p className="text-sm text-muted-foreground">
            Remove all saved analysis results and history
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full" disabled={analysisHistory.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History ({analysisHistory.length} items)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Analysis History?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all {analysisHistory.length} analysis history items. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory}>
                  Clear History
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Clear Saved Items */}
        <div className="space-y-2">
          <h3 className="font-medium">Clear Saved Items</h3>
          <p className="text-sm text-muted-foreground">
            Remove saved papers, favorite dentists, and treatments
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                disabled={savedPapers.length === 0 && favoriteDentists.length === 0 && treatments.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Saved Items
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Saved Items?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all saved papers, favorite dentists, and treatment records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearSavedPapers}>
                  Clear Saved Items
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Clear All Data */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="font-medium text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete all data stored in your browser
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Clear All Data?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete ALL data including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Analysis history ({analysisHistory.length} items)</li>
                    <li>Treatment records ({treatments.length} items)</li>
                    <li>Saved papers ({savedPapers.length} items)</li>
                    <li>Favorite dentists ({favoriteDentists.length} items)</li>
                    <li>All settings and preferences</li>
                  </ul>
                  <p className="mt-3 font-semibold">This action cannot be undone and will reload the page.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Clear All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Privacy Notice */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h3 className="font-medium text-sm">Privacy Notice</h3>
          <p className="text-xs text-muted-foreground">
            All data is stored locally in your browser. DentalGemma does not store any personal or medical data on servers. 
            Data sent to AI services is processed ephemerally and not retained.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
