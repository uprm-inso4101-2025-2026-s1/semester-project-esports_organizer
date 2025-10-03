import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp, orderBy, query } from 'firebase/firestore';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  // Mostratara las notificaciones desde el firebase a la pagina in real time
  useEffect(() => {
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(docs);
    });
    return () => unsubscribe();
  }, []);

  // Escibir una notificacion se anadira al FireBase
  const addNotification = async () => {
    if (!newMessage.trim()) return;
    await addDoc(collection(db, 'notifications'), {
      message: newMessage,
      createdAt: serverTimestamp(),
    });
    setNewMessage('');
  };

  // Esto borara todas las notificaciones, Solo del Ui no del 
  const markAllRead = () => {
    setNotifications([]);
  };

  return (
    <div style={styles.container}>
      {/* 🔔 Bell icon */}
      <div style={styles.bellContainer} onClick={() => setShowList(!showList)}>
        <FaBell size={24} />
        {notifications.length > 0 && (
          <div style={styles.counter}>{notifications.length}</div>
        )}
      </div>

      {/* 🔔 Notifications dropdown */}
      {showList && (
        <div style={styles.list}>
          <div style={styles.listHeader}>
            <strong>Notificaciones</strong>
            {notifications.length > 0 && (
              <button style={styles.markReadButton} onClick={markAllRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Form to add new notification */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe notificación..."
              style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <button onClick={addNotification} style={styles.addButton}>
              Enviar
            </button>
          </div>

          {notifications.length === 0 ? (
            <div style={styles.empty}>No hay notificaciones.</div>
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

const styles = {
  container: {
    position: 'fixed',
    top: 20,
    right: 20,
    width: 320,
    fontFamily: 'Arial, sans-serif',
    zIndex: 1000,
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
    maxHeight: 400,
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
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
