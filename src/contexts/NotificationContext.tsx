import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { safeStorage } from '@/utils/safeStorage';

export type Notification = {
    id: string;
    created_at: string;
    message: string;
    filter_type: 'all' | 'class' | 'student';
    filter_value?: string;
    sender_id?: string;
    read?: boolean; // Local state for students
};

type NotificationContextType = {
    notifications: Notification[];
    unreadCount: number;
    sendNotification: (message: string, filterType: 'all' | 'class' | 'student', filterValue?: string) => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    markAsRead: (id: string) => void;
    clearNotifications: () => void;
    loading: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Load notifications from local storage AND fetch from DB on mount
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                // 1. Load from local storage first for immediate display
                const stored = safeStorage.getItem('visiona_notifications');
                let localNotifications: Notification[] = [];
                if (stored) {
                    const parsed: Notification[] = JSON.parse(stored);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    localNotifications = parsed.filter(n => new Date(n.created_at) > sevenDaysAgo);
                    setNotifications(localNotifications);
                }

                // 2. Fetch latest from DB (last 7 days)
                const sevenDaysAgoISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
                const { data: dbNotifications, error } = await supabase
                    .from('notifications' as any)
                    .select('*')
                    .gt('created_at', sevenDaysAgoISO)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (dbNotifications) {
                    // Merge DB notifications with local state (preserving 'read' status)
                    const mergedNotifications = dbNotifications.map((dbNotif: any) => {
                        const localMatch = localNotifications.find(ln => ln.id === dbNotif.id);
                        return {
                            ...dbNotif,
                            read: localMatch ? localMatch.read : false // Default to unread if new
                        };
                    });

                    setNotifications(mergedNotifications);
                    safeStorage.setItem('visiona_notifications', JSON.stringify(mergedNotifications));
                }

            } catch (e) {
                console.error("Failed to load notifications", e);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, []);

    // Subscribe to real-time changes
    useEffect(() => {
        let mounted = true;
        let channel: ReturnType<typeof supabase.channel> | null = null;

        // Use unique channel name to avoid duplicate subscription errors in React Strict Mode
        const channelId = `notifications-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const setupSubscription = () => {
            if (!mounted) return;

            channel = supabase
                .channel(channelId)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications' as any,
                    },
                    (payload) => {
                        if (!mounted) return;

                        const newNotification = payload.new as Notification;

                        setNotifications(prev => {
                            // Avoid duplicates
                            if (prev.find(n => n.id === newNotification.id)) return prev;

                            const updated = [newNotification, ...prev];
                            safeStorage.setItem('visiona_notifications', JSON.stringify(updated));
                            return updated;
                        });

                        toast({
                            title: "New Notification",
                            description: newNotification.message,
                        });
                    }
                )
                .subscribe();
        };

        setupSubscription();

        return () => {
            mounted = false;
            if (channel) {
                // Delay cleanup to avoid "closed before established" errors
                setTimeout(() => {
                    if (channel) {
                        supabase.removeChannel(channel);
                    }
                }, 100);
            }
        };
    }, [toast]);

    const sendNotification = async (message: string, filterType: 'all' | 'class' | 'student', filterValue?: string) => {
        try {
            const { error } = await supabase
                .from('notifications' as any)
                .insert({
                    message,
                    filter_type: filterType,
                    filter_value: filterValue,
                });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Notification sent successfully",
            });
        } catch (error: any) {
            console.error('Error sending notification:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send notification",
            });
            throw error;
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNotifications(prev => {
                const updated = prev.filter(n => n.id !== id);
                safeStorage.setItem('visiona_notifications', JSON.stringify(updated));
                return updated;
            });

            toast({
                title: "Success",
                description: "Notification deleted successfully",
            });
        } catch (error: any) {
            console.error('Error deleting notification:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to delete notification",
            });
            throw error;
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => {
            const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
            safeStorage.setItem('visiona_notifications', JSON.stringify(updated));
            return updated;
        });
    };

    const clearNotifications = () => {
        setNotifications([]);
        safeStorage.removeItem('visiona_notifications');
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            sendNotification,
            deleteNotification,
            markAsRead,
            clearNotifications,
            loading
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
