import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SystemNotification } from '../types';
import { Bell, Check, X, CreditCard, ShieldAlert, Sparkles, Clock } from 'lucide-react';

interface Props {
  userId: string;
}

export const NotificationsDropdown: React.FC<Props> = ({ userId }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'all', 'admin'])
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs
          .map((d) => ({ ...d.data(), id: d.id } as SystemNotification))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(items);
      },
      (err) => {
        console.warn('Notifications snapshot error (caught):', err.message);
      }
    );

    return () => unsub();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    for (const notif of notifications) {
      if (!notif.read) {
        try {
          await updateDoc(doc(db, 'notifications', notif.id), { read: true });
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fadeIn">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>Tiada notifikasi pada masa ini.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl transition text-xs ${n.read ? 'bg-white' : 'bg-emerald-50/50'}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {n.type === 'payment' ? (
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                      ) : n.type === 'subscription' ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <strong className="block text-slate-900 font-bold">{n.title}</strong>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString('ms-MY', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
