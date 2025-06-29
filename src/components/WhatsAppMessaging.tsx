
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Edit3, Send } from 'lucide-react';

interface WhatsAppMessagingProps {
  studentName: string;
  amountPaid: number;
  paymentDate: string;
  paymentType: string;
  dueAmount: number;
  phoneNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppMessaging = ({
  studentName,
  amountPaid,
  paymentDate,
  paymentType,
  dueAmount,
  phoneNumber,
  isOpen,
  onClose
}: WhatsAppMessagingProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  const getDefaultMessage = () => {
    if (paymentType === "General Communication") {
      return `ನಮಸ್ಕಾರ 🙏

ಇದು **VISIONA EDUCATION ACADEMY** ಯಿಂದ ಸಂದೇಶ.

🧒 ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು: ${studentName}
📚 ಸಂಸ್ಥೆಯ ಮಾಹಿತಿ ಅಥವಾ ನವೀಕರಣಗಳ ಬಗ್ಗೆ ನಿಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕದಲ್ಲಿರಲು ಈ ಸಂದೇಶವನ್ನು ಕಳುಹಿಸುತ್ತಿದ್ದೇವೆ.

ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿಗೆ ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ.

ಧನ್ಯವಾದಗಳು,
**VISIONA EDUCATION ACADEMY**
📍 16th Cross, Vidyagiri, Bagalkot
📞 ಸಂಪರ್ಕಿಸಿ: 7349420496, 8722189292`;
    }
    
    return `ನಮಸ್ಕಾರ 🙏
ನಿಮ್ಮ ಮಗ/ಮಗುವಿನ ಫೀಸ್ ಪಾವತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ ✅

🧒 ವಿದ್ಯಾರ್ಥಿ ಹೆಸರು: ${studentName}
💰 ಪಾವತಿಸಿದ ಮೊತ್ತ: ₹${formatCurrency(amountPaid)}
📅 ಪಾವತಿ ದಿನಾಂಕ: ${formatDate(paymentDate)}
💼 ಮಾಸ / ಸಂಪೂರ್ಣ ಪಾವತಿ: ${paymentType}
📊 ಬಾಕಿ ಮೊತ್ತ: ₹${formatCurrency(dueAmount)}

ಧನ್ಯವಾದಗಳು,
**VISIONA EDUCATION ACADEMY**
📍 16th Cross, Vidyagiri, Bagalkot
📞 ಸಂಪರ್ಕಿಸಿ: 7349420496, 8722189292`;
  };

  const handleSendWhatsApp = () => {
    const message = isEditing ? customMessage : getDefaultMessage();
    const encodedMessage = encodeURIComponent(message);
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/91${cleanPhoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handleEditMessage = () => {
    setCustomMessage(getDefaultMessage());
    setIsEditing(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700 text-lg sm:text-xl">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Send WhatsApp Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Sending to:</p>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{studentName}</p>
            <p className="text-sm text-gray-600">+91 {phoneNumber}</p>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <Label className="text-blue-700 font-medium text-sm sm:text-base">Message Preview</Label>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditMessage}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-fit"
                >
                  <Edit3 className="h-3 w-3" />
                  <span className="text-xs sm:text-sm">Edit</span>
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                className="text-xs sm:text-sm font-mono border-blue-200 focus:border-blue-400"
                placeholder="Edit your WhatsApp message..."
              />
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs sm:text-sm font-mono whitespace-pre-wrap max-h-48 sm:max-h-64 overflow-y-auto">
                {getDefaultMessage()}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="w-full sm:flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendWhatsApp}
              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 text-sm"
            >
              <Send className="h-4 w-4" />
              Send WhatsApp
            </Button>
          </div>

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setCustomMessage('');
                }}
                className="w-full sm:flex-1 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
              >
                Cancel Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomMessage(getDefaultMessage())}
                className="w-full sm:flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
              >
                Reset to Default
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppMessaging;
