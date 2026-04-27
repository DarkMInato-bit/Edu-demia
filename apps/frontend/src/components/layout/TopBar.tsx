'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, HelpCircle, X, Info, CheckCircle2, Book } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export const TopBar = ({ title }: { title: string }) => {
  const { user, token } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  useEffect(() => {
    if (!user) return;

    // --- Institutional Realtime Pulse ---
    const channel = supabase
      .channel(`notifications-pulse-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🏛️ New Institutional Alert:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <Book size={16} color="var(--primary)" />;
      case 'grade': return <CheckCircle2 size={16} color="#10b981" />;
      default: return <Info size={16} color="var(--text-secondary)" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <header style={{
      height: '80px',
      position: 'sticky',
      top: 0,
      background: 'rgba(var(--background-rgb), 0.8)',
      backdropFilter: 'blur(var(--glass-blur))',
      WebkitBackdropFilter: 'blur(var(--glass-blur))',
      borderBottom: '1px solid var(--sidebar-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2.5rem',
      zIndex: 90,
      marginLeft: '260px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', fontFamily: 'Playfair Display, serif' }}>{title}</h2>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search academic catalog..." 
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--sidebar-border)',
              borderRadius: '10px',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              width: '300px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: 'relative', cursor: 'pointer', color: showNotifications ? 'var(--primary)' : 'var(--text-secondary)', transition: 'all 0.2s' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px',
                background: 'var(--error)', borderRadius: '50%', border: '2px solid var(--background)'
              }} />
            )}
          </div>

          {showNotifications && (
            <div className="glass-elevated fade-in" style={{
              position: 'absolute', top: '40px', right: '0', width: '350px', 
              borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--sidebar-border)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              maxHeight: '450px', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700' }}>Institutional Alerts</h4>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    All caught up! No new alerts.
                  </p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.is_read && markAsRead(n.id)}
                      style={{ 
                        display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', 
                        background: n.is_read ? 'transparent' : 'rgba(59, 111, 212, 0.05)',
                        border: n.is_read ? '1px solid transparent' : '1px solid rgba(59, 111, 212, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px', color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.title}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{n.message}</p>
                        <p style={{ fontSize: '0.65rem', color: 'var(--primary)', marginTop: '4px', fontWeight: '600' }}>{formatTime(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <div style={{ position: 'relative' }}>
          <HelpCircle 
            size={20} 
            onClick={() => setShowHelp(!showHelp)}
            style={{ color: showHelp ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }} 
          />
          {showHelp && (
            <div className="glass-elevated fade-in" style={{
              position: 'absolute', top: '40px', right: '0', width: '250px', 
              borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--sidebar-border)'
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Need Assistance?</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
                Access the knowledge base or contact institutional support.
              </p>
              <button style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'var(--primary)', border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                Contact Support
              </button>
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 12px', 
          background: 'rgba(255, 255, 255, 0.03)', borderRadius: '30px', border: '1px solid var(--sidebar-border)'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>
            ID: {user?.id?.slice(0, 8).toUpperCase()}
          </p>
          <div style={{ 
            width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)',
            fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold'
          }}>
            {user?.email?.[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
