import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from 'qrcode.react';
import { generateUPIUri } from '@/utils/upiUtils';
import { Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface UPIPaymentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    upiId: string;
    merchantName: string;
    studentName: string;
    onPaymentSubmitted: (transactionId: string) => void;
}

const UPIPaymentSheet = ({
    isOpen,
    onClose,
    amount,
    upiId,
    merchantName,
    studentName,
    onPaymentSubmitted
}: UPIPaymentSheetProps) => {
    const [transactionId, setTransactionId] = useState('');
    const [copied, setCopied] = useState(false);
    const [isPaymentLaunched, setIsPaymentLaunched] = useState(false);
    const [launchTime, setLaunchTime] = useState<number | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'cancelled' | 'success'>('idle');
    const { toast } = useToast();

    const upiUri = generateUPIUri(upiId, merchantName, amount, `FEES-${Date.now()}`);

    useEffect(() => {
        const handleFocus = () => {
            if (isPaymentLaunched && launchTime) {
                const duration = (Date.now() - launchTime) / 1000;

                // If returned within 8 seconds, it's usually a cancellation or failure to open
                if (duration < 8) {
                    setPaymentStatus('cancelled');
                    toast({
                        title: "Payment Cancelled?",
                        description: "It looks like you returned very quickly. If the payment failed, please try again.",
                        variant: "destructive"
                    });
                } else {
                    setPaymentStatus('processing');
                    toast({
                        title: "Payment in Progress",
                        description: "Please enter the 12-digit UTR/Transaction ID from your app to confirm.",
                    });
                }
                setIsPaymentLaunched(false);
                setLaunchTime(null);
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [isPaymentLaunched, launchTime, toast]);

    const handleLaunchApp = () => {
        setIsPaymentLaunched(true);
        setLaunchTime(Date.now());
        setPaymentStatus('processing');
        window.location.href = upiUri;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(upiId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
            description: "UPI ID copied to clipboard",
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId.trim()) {
            toast({
                title: "Transaction ID Required",
                description: "Please enter the Transaction ID/UTR from your payment app.",
                variant: "destructive"
            });
            return;
        }
        onPaymentSubmitted(transactionId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#0B1121] border-white/5">
                <div className={`p-6 text-white text-center transition-colors duration-500 ${paymentStatus === 'cancelled' ? 'bg-rose-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white mb-1">
                            {paymentStatus === 'cancelled' ? 'Payment Failed' : 'Direct UPI Pay'}
                        </DialogTitle>
                        <DialogDescription className="text-emerald-100/80">
                            {paymentStatus === 'cancelled' ? 'The session was interrupted' : 'Secure instant transfer'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <span className="text-sm opacity-80 uppercase tracking-wider font-semibold">Amount to Pay</span>
                        <div className="text-4xl font-black mt-1">₹{amount.toLocaleString()}</div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Direct Pay Button */}
                    <div className="space-y-3">
                        <Button
                            className={`w-full h-14 text-lg font-black flex items-center justify-center gap-3 rounded-2xl transition-all active:scale-95 group border-0 ${paymentStatus === 'cancelled' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#6739B7] hover:bg-[#522b94]'} text-white shadow-xl`}
                            onClick={handleLaunchApp}
                        >
                            <ExternalLink className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                            {paymentStatus === 'cancelled' ? 'Retry Payment' : 'Launch Pay App'}
                        </Button>
                        <div className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${paymentStatus === 'processing' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {paymentStatus === 'processing' ? 'Awaiting UTR Confirmation' : 'Safe and Secure'}
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-100 dark:border-gray-800"></span>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                            <span className="bg-white dark:bg-[#0B1121] px-3 text-gray-400">Scan QR Code</span>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="hidden sm:flex flex-col items-center">
                        <div className="p-4 bg-white rounded-3xl shadow-2xl border border-emerald-100/20 mb-4 scale-90">
                            <QRCodeSVG value={upiUri} size={180} level="H" />
                        </div>
                    </div>

                    {/* Submission Form */}
                    <div className={`space-y-4 pt-2 transition-all duration-500 ${paymentStatus === 'processing' ? 'scale-105' : 'opacity-70'}`}>
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Step 2: Confirm Transaction</span>
                            {paymentStatus === 'processing' && (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none animate-pulse">Waiting for UTR</Badge>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="utr" className="text-xs font-bold text-gray-400 uppercase">Enter 12-Digit UTR / Transaction ID</Label>
                                <Input
                                    id="utr"
                                    placeholder="XXXX XXXX XXXX"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="h-12 border-white/10 bg-white/5 dark:bg-white/5 text-lg font-mono tracking-[0.2em] focus:ring-emerald-500/50 rounded-xl"
                                />
                            </div>
                            <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                                Verify & Update Portal
                            </Button>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UPIPaymentSheet;
