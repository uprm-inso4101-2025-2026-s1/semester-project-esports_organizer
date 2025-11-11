import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, orderBy, query } from 'firebase/firestore';

export default function Notifications({ inline = false }) {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newTitle, setNewTitle] = useState('');

  // It will show notifications from firebase to the page in real time
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(docs);
    });
    return () => unsubscribe();
  }, []);

  //  notification will be added to FireBase
  const addNotification = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, 'notifications'), {
      title: newTitle,
      message: newMessage,
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
    setNewTitle('');
  };

  // This will delete all notifications, only from the UI not from Firebasde
  const markAllRead = () => {
    setNotifications([]);
  };

  const styles = getStyles(inline);

  return (
    <div style={styles.container}>
      {/* 🔔 Bell icon */}
      <div style={styles.bellContainer} onClick={() => setShowList(!showList)}>
        <FaBell size={30} color="#de9906ff" />
        {notifications.length > 0 && (
          <div style={styles.counter}>{notifications.length}</div>
        )}
      </div>

      {/* Drop-down notification bar*/}
      {showList && (
        <div style={styles.list}>
          <div style={styles.listHeader}>
            <strong>Notifications</strong>
            {notifications.length > 0 && (
              <button style={styles.markReadButton} onClick={markAllRead}>
                Mark all as read
              </button>
            )}
          </div>

          {/* Add new notification */}
          <div style={{  display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10}}>
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
              placeholder="Write notification..."
              style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <button onClick={addNotification} style={styles.addButton}>
              Send
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={styles.empty}>There are no notifications.</div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={styles.notification}>
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function getStyles(inline) {
  if (inline) {
    return {
      container: {
        position: 'relative',
        width: 'auto',
        fontFamily: 'Arial, sans-serif',
      },
      bellContainer: {
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
      },
      counter: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: 'red',
        color: 'white',
        borderRadius: '50%',
        width: 16,
        height: 16,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 10,
        fontWeight: 'bold',
      },
      list: {
        position: 'fixed',
        top: 70,
        right: 8,
        width: 'min(92vw, 320px)',
        maxHeight: 'min(70vh, 420px)',
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        color: '#333',
        padding: 10,
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        zIndex: 2000,
        overscrollBehavior: 'contain',
      },
      listHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      markReadButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '2px 6px',
        cursor: 'pointer',
        fontSize: 12,
      },
      addButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: 12,
      },
      notification: {
        backgroundColor: '#fff',
        padding: 8,
        marginBottom: 6,
        borderRadius: 8,
        boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
      },
      empty: { textAlign: 'center', color: '#888' },
    };
  }
  return {
    container: {
      position: 'fixed',
      top: 29,
      right: 1,
      width: 'auto',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1200,
    },
    bellContainer: {
      position: 'relative',
      cursor: 'pointer',
      display: 'inline-block',
    },
    counter: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      width: 18,
      height: 18,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 'bold',
    },
    list: {
      marginTop: 10,
      width: 'min(92vw, 320px)',
      maxHeight: 'min(70vh, 420px)',
      overflowY: 'auto',
      border: '1px solid #ccc',
      borderRadius: 12,
      backgroundColor: '#f9f9f9',
      color: '#333',
      padding: 10,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      overscrollBehavior: 'contain',
    },
    listHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    markReadButton: {
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '2px 6px',
      cursor: 'pointer',
      fontSize: 12,
    },
    addButton: {
      backgroundColor: '#28a745',
      color: '#fff',
      border: 'none',
      borderRadius: 6,
      padding: '6px 10px',
      cursor: 'pointer',
      fontSize: 12,
    },
    notification: {
      backgroundColor: '#fff',
      padding: 8,
      marginBottom: 6,
      borderRadius: 8,
      boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
    },
    empty: { textAlign: 'center', color: '#888' },
  };
}
