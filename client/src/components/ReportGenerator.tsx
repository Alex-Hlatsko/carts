import * as React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Report } from '@/types';

interface ReportGeneratorProps {
  reports: Report[];
  standName?: string;
}

export function ReportGenerator({ reports, standName }: ReportGeneratorProps) {
  const generatePDF = async () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Title
    pdf.setFontSize(16);
    pdf.text(standName ? `Отчёт по стенду: ${standName}` : 'Отчёт по стендам', 20, yPosition);
    yPosition += 20;

    // Date
    pdf.setFontSize(10);
    pdf.text(`Создано: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPosition);
    yPosition += 20;

    reports.forEach((report, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${report.standName}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Действие: ${report.action === 'receive' ? 'Принят' : 'Выдан'}`, 25, yPosition);
      yPosition += 8;

      pdf.text(`Дата: ${report.timestamp.toLocaleDateString('ru-RU')} ${report.timestamp.toLocaleTimeString('ru-RU')}`, 25, yPosition);
      yPosition += 8;

      pdf.text(`Сотрудник: ${report.handledBy}`, 25, yPosition);
      yPosition += 8;

      if (report.handledTo) {
        pdf.text(`Получатель: ${report.handledTo}`, 25, yPosition);
        yPosition += 8;
      }

      if (report.comments) {
        pdf.text(`Комментарии: ${report.comments}`, 25, yPosition);
        yPosition += 8;
      }

      // Checklist
      if (report.checklist && Object.keys(report.checklist).length > 0) {
        pdf.text('Чек-лист:', 25, yPosition);
        yPosition += 8;

        Object.entries(report.checklist).forEach(([key, value]) => {
          const text = `${key}: ${value}`;
          pdf.text(text, 30, yPosition);
          yPosition += 8;
        });
      }

      yPosition += 10; // Space between reports
    });

    // Save the PDF
    const fileName = standName 
      ? `report_${standName.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      : `stands_report_${Date.now()}.pdf`;
    
    pdf.save(fileName);
  };

  return (
    <Button onClick={generatePDF} className="w-full">
      <FileText className="h-4 w-4 mr-2" />
      Экспорт в PDF
    </Button>
  );
}