import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { safeStorage } from '@/utils/safeStorage';

export function StudentNotificationBell() {
    const { notifications, markAsRead, clearNotifications } = useNotifications();
    const [open, setOpen] = useState(false);

    const studentDataStr = safeStorage.getItem('visiona_student_data');
    const studentData = studentDataStr ? JSON.parse(studentDataStr) : null;

    const filteredNotifications = notifications.filter(n => {
        if (n.filter_type === 'all') return true;
        if (n.filter_type === 'class' && studentData?.class === n.filter_value) return true;
        if (n.filter_type === 'student' && (studentData?.id === n.filter_value || studentData?.admission_number === n.filter_value)) return true;
        return false;
    });

    const unreadCount = filteredNotifications.filter(n => !n.read).length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {filteredNotifications.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs text-red-500 h-auto p-1">
                            Clear All
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No notifications yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-sm leading-snug">{notification.message}</p>
                                        {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
