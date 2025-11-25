
import React, { useEffect, useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { db } from '../lib/firebase';
import {collection,onSnapshot,orderBy,query,addDoc,serverTimestamp,getDocs,collection as coll} from 'firebase/firestore';
import NotificationService from '../services/notificationsService';
import { checkUserPermission } from '../Roles/checkUserPermission';
import Event from "../events/EventClass.js";
import { deleteDoc,updateDoc, doc } from "firebase/firestore";

export default function Notifications({ inline = false }) {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [canSend, setCanSend] = useState(false);
  const containerRef = useRef(null);

  const currentUserUid = localStorage.getItem('currentUserUid') || localStorage.getItem('uid') || '';

  // ========================
  // Listen to notifications
  // ========================


  //  TESTING only
  // useEffect(() => {
  //   setCanSend(true);
  // }, []);

  useEffect(() => {
  if (!currentUserUid) return;
  try {
    const userNotifsRef = collection(db, 'User', currentUserUid, 'notifications');
    const q = query(userNotifsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(docs);
    });

    return () => unsubscribe();
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
}, [currentUserUid]);


  useEffect(() => {
    if (!currentUserUid) return;
    try {
      const userNotifsRef = collection(db, 'User', currentUserUid, 'notifications');
      const q = query(userNotifsRef, orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotifications(docs);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [currentUserUid]);

  // ========================
  // Load events safely
  // ========================
  useEffect(() => {
    async function loadEvents() {
      try {
        const list = await Event.ListEvents({ max: 200 });
        const safeList = (list || []).map(ev => ({
          id: ev.id || Math.random(),
          title: ev.title || 'Untitled'
        }));
        setEvents(safeList);
      } catch (err) {
        console.error('Error loading events', err);
        setEvents([]);
      }
    }
    loadEvents();
  }, []);

  // ========================
  // Check permission
  // ========================
  useEffect(() => {
    async function checkPerm() {
      if (!currentUserUid) { setCanSend(false); return; }
      try {
        const ok = await checkUserPermission(currentUserUid, 'sendNotifications');
        const okManager = await checkUserPermission(currentUserUid, 'canSendNotifications');
        setCanSend(Boolean(ok || okManager));
      } catch (err) {
        console.error("Error checking permissions:", err);
        setCanSend(false);
      }
    }
    checkPerm();
  }, [currentUserUid]);

  // ========================
  // Click outside to close
  // ========================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========================
  // Handle send
  // ========================
  const handleSend = async () => {
    if (!canSend) {
      alert('You do not have permission to send notifications.');
      return;
    }
    if (!selectedEventId) {
      alert('Please select an event.');
      return;
    }
    if (!newMessage.trim()) {
      alert('Please write a message.');
      return;
    }

    try {
      const ns = new NotificationService(currentUserUid);
      const res = await ns.sendToEventParticipants(selectedEventId, {
        title: newTitle,
        message: newMessage
      });

      if (res.success) {
        setNewMessage('');
        setNewTitle('');
        alert('Notification sent to participants.');
      } else {
        alert('Error: ' + (res.error || 'unknown'));
      }
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("An error occurred while sending the notification.");
    }
  };

  // ========================
  // Render safely
  // ========================
  return (
    <div ref={containerRef} style={getStyles(inline).container}>
      {(() => {
        try {
          return (
            <>
              <div style={getStyles(inline).bellContainer} onClick={() => setShowList(!showList)}>
                <FaBell size={30} color="#de9906ff" />
                {notifications.length > 0 && (
                  <div style={getStyles(inline).counter}>{notifications.length}</div>
                )}
              </div>

              {showList && (
                <div style={getStyles(inline).list}>
                  <div style={getStyles(inline).listHeader}>
                    <strong>Notifications</strong>
                  </div>

                  <div style={getStyles(inline).listHeader}>
                

                {/* --- Button: Mark all as read --- */}
                {notifications.length >= 0 && (
                  <button
                    onClick={async () => {
                      await markAllAsRead(currentUserUid);
                      setNotifications([]);
                    }}
                    style={{
                      marginLeft: 'auto',
                      fontSize: 12,
                      background: 'transparent',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

                  {canSend && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                      <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                        <option value="">--Select an event--</option>
                        {events.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.title}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title..."
                        style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
                      />
                      <button onClick={handleSend} style={getStyles(inline).addButton}>Send to participants</button>
                    </div>
                  )}

                  {notifications.length === 0 ? (
                    <div style={getStyles(inline).empty}>No notifications available.</div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id || Math.random()} style={getStyles(inline).notification}>
                        <div><strong>{n.title || 'Untitled'}</strong></div>
                        <div>{n.message || ''}</div>
                        {n.eventTitle && <div style={{ fontSize: 12, color: '#666' }}>Event: {n.eventTitle}</div>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          );
        } catch (err) {
          console.error("Render error:", err);
          return <div>An error occurred while loading notifications.</div>;
        }
      })()}
    </div>
  );
}

// ========================
// Delete all notifications 
// ========================
const markAllAsRead = async (uid) => {
  if (!uid) return;

  try {
    const userNotifsRef = collection(db, 'User', uid, 'notifications');
    const snapshot = await getDocs(userNotifsRef);

    if (snapshot.empty) {
      console.log("No notifications to delete");
      return;
    }

    const deletions = snapshot.docs.map(docSnap => {
      const ref = doc(db, 'User', uid, 'notifications', docSnap.id);
      return deleteDoc(ref)
        .then(() => console.log(`Deleted: ${docSnap.id}`))
        .catch(err => console.error(`Error deleting ${docSnap.id}:`, err));
    });

    await Promise.all(deletions);
    console.log("All notifications deletion attempted");
  } catch (err) {
    console.error("Error deleting notifications:", err);
  }
};


// ========================
// Styles
// ========================
function getStyles(inline) {
  if (inline) {
    return {
      container: { position: 'relative', width: 'auto', fontFamily: 'Arial, sans-serif' },
      bellContainer: { position: 'relative', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
      counter: { position: 'absolute', top: -6, right: -6, backgroundColor: 'red', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 10, fontWeight: 'bold' },
      list: { position: 'fixed', top: 70, right: 8, width: 'min(92vw, 320px)', maxHeight: 'min(70vh, 420px)', overflowY: 'auto', border: '1px solid #ccc', borderRadius: 12, backgroundColor: '#f9f9f9', color: '#333', padding: 10, boxShadow: '0 8px 20px rgba(0,0,0,0.25)', zIndex: 2000, overscrollBehavior: 'contain' },
      listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
      addButton: { backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 },
      notification: { backgroundColor: '#fff', padding: 8, marginBottom: 6, borderRadius: 8, boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' },
      empty: { textAlign: 'center', color: '#888' }
    };
  }

  return {
    container: { position: 'fixed', top: 29, right: 1, width: 'auto', fontFamily: 'Arial, sans-serif', zIndex: 1200 },
    bellContainer: { position: 'relative', cursor: 'pointer', display: 'inline-block' },
    counter: { position: 'absolute', top: -8, right: -8, backgroundColor: 'red', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 12, fontWeight: 'bold' },
    list: { marginTop: 10, width: 'min(92vw, 320px)', maxHeight: 'min(70vh, 420px)', overflowY: 'auto', border: '1px solid #ccc', borderRadius: 12, backgroundColor: '#f9f9f9', color: '#333', padding: 10, boxShadow: '0 4px 8px rgba(0,0,0,0.2)', overscrollBehavior: 'contain' },
    listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    addButton: { backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 },
    notification: { backgroundColor: '#fff', padding: 8, marginBottom: 6, borderRadius: 8, boxShadow: '0px 1px 3px rgba(0,0,0,0.2)' },
    empty: { textAlign: 'center', color: '#888' }
  };
}