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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Send WhatsApp Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Sending to:</p>
            <p className="font-medium">{studentName}</p>
            <p className="text-sm text-gray-600">+91 {phoneNumber}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Message Preview</Label>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditMessage}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={10}
                className="text-sm font-mono"
                placeholder="Edit your WhatsApp message..."
              />
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                {getDefaultMessage()}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send WhatsApp
            </Button>
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setCustomMessage('');
                }}
                className="flex-1"
              >
                Cancel Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCustomMessage(getDefaultMessage())}
                className="flex-1"
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
