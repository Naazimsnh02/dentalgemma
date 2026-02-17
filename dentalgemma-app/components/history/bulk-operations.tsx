'use client';

import { AnalysisHistoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Trash2, FileJson, FileText } from 'lucide-react';
import { useState } from 'react';
import jsPDF from 'jspdf';

interface BulkOperationsProps {
  selectedItems: AnalysisHistoryItem[];
  onDelete: (ids: string[]) => void;
  onClearSelection: () => void;
}

export function BulkOperations({
  selectedItems,
  onDelete,
  onClearSelection,
}: BulkOperationsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(selectedItems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `history-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Analysis History Export', margin, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 15;

    // Items
    selectedItems.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // Item header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${item.type.toUpperCase()}`, margin, yPosition);
      yPosition += 7;

      // Timestamp
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Date: ${new Date(item.timestamp).toLocaleString()}`,
        margin,
        yPosition
      );
      yPosition += 5;

      // Urgency
      if (item.urgency) {
        doc.text(`Urgency: ${item.urgency}`, margin, yPosition);
        yPosition += 5;
      }

      // Summary
      doc.setFontSize(10);
      const summaryLines = doc.splitTextToSize(
        `Summary: ${item.summary}`,
        pageWidth - 2 * margin
      );
      doc.text(summaryLines, margin, yPosition);
      yPosition += summaryLines.length * 5 + 10;
    });

    doc.save(`history-export-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDelete = () => {
    onDelete(selectedItems.map((item) => item.id));
    setShowDeleteDialog(false);
    onClearSelection();
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-8"
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} item
              {selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
