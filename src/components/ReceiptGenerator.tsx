
import React from 'react';
import jsPDF from 'jspdf';
import { Button } from "@/components/ui/button";
import { Receipt } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Student {
    id: string;
    full_name: string;
    class: string;
    contact_number: string;
    created_at: string;
    admission_number?: string;
    total_fees: number;
    paid_amount: number;
    pending_amount: number;
    payment_status: string;
    paid_date: string | null;
    fee_id?: string;
    fee_breakdown?: any;
}

interface ReceiptGeneratorProps {
    student: Student;
    disabled?: boolean;
}

const ReceiptGenerator = ({ student, disabled }: ReceiptGeneratorProps) => {
    const { toast } = useToast();

    const generateReceiptNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        return `RCP/${year}/${random}`;
    };

    const generatePDF = async () => {
        try {
            const receiptNo = generateReceiptNumber();
            const currentDate = new Date().toLocaleDateString('en-IN');

            // Fetch Institution Settings
            const { data: settings } = await supabase.from('institution_settings').select('*').maybeSingle();
            const academyName = settings?.merchant_name || 'VISIONA ACADEMY';
            const address = settings?.address || 'Your Institution Address Here';
            const phone = settings?.phone || student.contact_number;

            // Fetch last payment method
            const { data: lastPayment } = await supabase
                .from('fee_payments')
                .select('payment_method')
                .eq('student_fees_id', student.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const paymentMethod = lastPayment?.payment_method || 'N/A';

            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a5',
            });

            // --- STYLING & BORDER ---
            doc.setDrawColor(16, 185, 129); // Emerald color
            doc.setLineWidth(1.5);
            doc.rect(5, 5, 200, 138); // Outer border
            doc.setLineWidth(0.5);
            doc.rect(7, 7, 196, 134); // Inner accent border

            // --- HEADER SECTION ---
            doc.setFillColor(248, 250, 252);
            doc.rect(7.5, 7.5, 195, 30, 'F');

            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.text(academyName.toUpperCase(), 15, 22);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(address, 15, 28);
            doc.text(`Contact: ${phone} | Email: info@visiona.com`, 15, 33);

            doc.setDrawColor(226, 232, 240);
            doc.line(7.5, 37.5, 202.5, 37.5);

            // --- RECEIPT METADATA ---
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            doc.setFont('helvetica', 'bold');
            doc.text(`S.N. ${receiptNo}`, 12, 48);

            doc.setFont('helvetica', 'normal');
            doc.text(`DATE: ${currentDate}`, 170, 48);

            // --- STUDENT DETAILS GRID ---
            doc.setFillColor(241, 245, 249);
            doc.rect(12, 55, 186, 25, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('NAME:', 18, 62);
            doc.setFont('helvetica', 'normal');
            doc.text(student.full_name, 45, 62);

            doc.setFont('helvetica', 'bold');
            doc.text('ADMN NO:', 120, 62);
            doc.setFont('helvetica', 'normal');
            doc.text(student.admission_number || 'N/A', 145, 62);

            doc.setFont('helvetica', 'bold');
            doc.text('CLASS:', 18, 72);
            doc.setFont('helvetica', 'normal');
            doc.text(student.class, 45, 72);

            doc.setFont('helvetica', 'bold');
            doc.text('MOBILE:', 120, 72);
            doc.setFont('helvetica', 'normal');
            doc.text(student.contact_number, 145, 72);

            // --- FEE TABLE ---
            doc.setDrawColor(203, 213, 225);
            doc.rect(12, 85, 186, 35);
            doc.line(12, 93, 198, 93);
            doc.line(145, 85, 145, 120);

            doc.setFont('helvetica', 'bold');
            doc.text('PARTICULARS / DESCRIPTION', 18, 90);
            doc.text('AMOUNT (INR)', 155, 90);

            doc.setFont('helvetica', 'normal');
            let yPos = 100;

            if (student.fee_breakdown && Array.isArray(student.fee_breakdown)) {
                student.fee_breakdown.slice(0, 3).forEach((item: any) => {
                    doc.text(item.name.substring(0, 30), 18, yPos);
                    doc.text(Number(item.amount).toLocaleString(), 185, yPos, { align: 'right' });
                    yPos += 7;
                });
            } else {
                doc.text('Total Fees Structure', 18, yPos);
                doc.text(student.total_fees.toLocaleString(), 185, yPos, { align: 'right' });
            }

            // --- TOTAL SECTION ---
            doc.setFillColor(15, 23, 42);
            doc.rect(12, 120, 186, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text('NET PAID AMOUNT', 18, 126.5);
            doc.setFontSize(14);
            doc.text(`Rs. ${student.paid_amount.toLocaleString()}/-`, 185, 126.5, { align: 'right' });

            // --- FOOTER SECTION ---
            doc.setTextColor(15, 23, 42);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('PAYMENT MODE:', 12, 137);
            doc.setFont('helvetica', 'normal');
            doc.text(paymentMethod.toUpperCase(), 45, 137);

            doc.line(150, 135, 195, 135);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('AUTHORISED SIGNATURE', 172.5, 139, { align: 'center' });

            const filename = `${student.full_name.split(' ')[0]}_Receipt.pdf`;
            doc.save(filename);

            toast({
                title: "Receipt Downloaded",
                description: `Fee receipt for ${student.full_name} is ready.`,
            });

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast({
                title: "Error",
                description: "Could not generate receipt PDF.",
                variant: "destructive",
            });
        }
    };

    return (
        <Button
            variant="outline"
            onClick={generatePDF}
            disabled={disabled || student.total_fees <= 0}
            className="flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
        >
            <Receipt className="h-4 w-4" />
            Print Receipt
        </Button>
    );
};

export default ReceiptGenerator;
