import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import Navbar from "../components/shared/Navbar";


import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter
} from 'firebase/firestore';
import {
  FaInfoCircle,
  FaExclamationTriangle,
  FaBell
} from 'react-icons/fa';
import './NotificationHistoryPage.css';

export default function NotificationHistoryPage() {
  const [notifications, setNotifications] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch notifications with pagination
  const fetchNotifications = async (loadMore = false) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(8),
        ...(loadMore && lastDoc ? [startAfter(lastDoc)] : [])
      );

      const snapshot = await getDocs(q);
      const newDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setNotifications(prev =>
        loadMore ? [...prev, ...newDocs] : newDocs
      );
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.size === 8);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'info':
        return <FaInfoCircle color="#007bff" size={22} />;
      case 'warn':
        return <FaExclamationTriangle color="#ffc107" size={22} />;
      case 'alert':
        return <FaBell color="#dc3545" size={22} />;
      default:
        return <FaBell color="#6c757d" size={22} />;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="history-container">
      <Navbar />
      <h2 className="history-title">Notification History</h2>

      {notifications.length === 0 && !loading && (
        <p className="empty-text">No notifications yet.</p>
      )}

      {notifications.map((n) => (
        <div key={n.id} className="notif-card">
          <div className="notif-icon">{getIcon(n.type)}</div>
          <div className="notif-content">
            <strong>{n.title || 'Untitled Notification'}</strong>
            <p>{n.message || 'No message provided.'}</p>
            <small>{formatDate(n.createdAt)}</small>
          </div>
        </div>
      ))}

      {loading && <p className="loading-text">Loading...</p>}

      {hasMore && !loading && (
        <button
          onClick={() => fetchNotifications(true)}
          className="load-more"
        >
          Load More
        </button>
      )}
    </div>
  );
}