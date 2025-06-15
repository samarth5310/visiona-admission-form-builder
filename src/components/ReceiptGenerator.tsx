
import React from 'react';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Receipt } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
  created_at: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: string;
  paid_date: string | null;
  fee_id?: string;
}

interface ReceiptGeneratorProps {
  student: Student;
  disabled?: boolean;
}

const ReceiptGenerator = ({ student, disabled }: ReceiptGeneratorProps) => {
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const generateReceiptNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP${year}${month}${day}${random}`;
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const receiptNo = generateReceiptNumber();
      const currentDate = new Date().toLocaleDateString('en-IN');
      
      // Set font size for better compression
      doc.setFontSize(10);
      
      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FEE PAYMENT RECEIPT', 105, 20, { align: 'center' });
      
      // Receipt details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Receipt No: ${receiptNo}`, 20, 35);
      doc.text(`Date: ${currentDate}`, 150, 35);
      
      // Student details
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT DETAILS', 20, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${student.full_name}`, 20, 60);
      doc.text(`Class: ${student.class}`, 20, 70);
      doc.text(`Contact: ${student.contact_number}`, 20, 80);
      
      // Fee details
      doc.setFont('helvetica', 'bold');
      doc.text('FEE DETAILS', 20, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Fees: ${formatCurrency(student.total_fees)}`, 20, 110);
      doc.text(`Amount Paid: ${formatCurrency(student.paid_amount)}`, 20, 120);
      doc.text(`Pending Balance: ${formatCurrency(Math.max(0, student.total_fees - student.paid_amount))}`, 20, 130);
      doc.text(`Payment Status: ${student.payment_status.toUpperCase()}`, 20, 140);
      
      // Add paid date if available
      if (student.paid_date) {
        doc.text(`Paid Date: ${new Date(student.paid_date).toLocaleDateString('en-IN')}`, 20, 150);
      }
      
      // Payment summary box
      doc.setDrawColor(0, 0, 0);
      doc.rect(20, 170, 170, 30);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT SUMMARY', 25, 180);
      doc.setFont('helvetica', 'normal');
      doc.text(`Amount Received: ${formatCurrency(student.paid_amount)}`, 25, 190);
      doc.text(`Date: ${currentDate}`, 25, 195);
      
      // Footer
      doc.setFontSize(8);
      doc.text('This is a computer generated receipt.', 105, 230, { align: 'center' });
      doc.text('For any queries, please contact the administration.', 105, 235, { align: 'center' });
      
      // Generate filename
      const sanitizedName = student.full_name.replace(/[^a-zA-Z0-9]/g, '');
      const filename = `${sanitizedName}_Receipt_${receiptNo}.pdf`;
      
      // Save the PDF
      doc.save(filename);
      
      toast({
        title: "Success",
        description: `Receipt generated successfully: ${filename}`,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={generatePDF}
      disabled={disabled || student.total_fees <= 0}
      className="flex items-center gap-2"
    >
      <Receipt className="h-4 w-4" />
      Generate Receipt
    </Button>
  );
};

export default ReceiptGenerator;
