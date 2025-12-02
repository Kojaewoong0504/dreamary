"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface NotificationContextType {
    unreadCount: number;
    hasUnread: boolean;
    refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            // We can use the API or direct Supabase query if we have RLS setup for reading own notifications
            // Using API for consistency with existing logic
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                const count = data.notifications?.filter((n: any) => !n.read).length || 0;
                setUnreadCount(count);
            }
        } catch (error) {
            console.error("Failed to fetch unread count", error);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        refreshUnreadCount();
    }, []);

    return (
        <NotificationContext.Provider value={{ unreadCount, hasUnread: unreadCount > 0, refreshUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
