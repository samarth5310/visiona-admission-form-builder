import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';

export function AdminNotificationDialog() {
    const { sendNotification, notifications, deleteNotification } = useNotifications();
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message) return;
        setLoading(true);
        try {
            // Always send to 'all'
            await sendNotification(message, 'all', '');
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="send" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="send">Send New</TabsTrigger>
                        <TabsTrigger value="history">Sent History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="send" className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your notification here..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="text-sm text-gray-500">
                            This notification will be sent to all students.
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSend} disabled={loading || !message}>
                                {loading ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Notification</>}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            {notifications.length === 0 ? (
                                <div className="text-center text-sm text-gray-500 py-8">
                                    No notifications sent yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.map((notification) => (
                                        <div key={notification.id} className="flex items-start justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{notification.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                                                onClick={() => deleteNotification(notification.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
