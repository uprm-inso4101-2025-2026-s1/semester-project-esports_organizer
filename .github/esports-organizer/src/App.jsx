import { useEffect, useState } from 'react'
import './App.css'
import { db } from './lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import ProfileForm from './ProfileForm';

function App() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const ref = doc(db, 'samples', 'hello')
        await setDoc(
          ref,
          { message: 'Hello from Firestore (emulator expected)', updatedAt: serverTimestamp() },
          { merge: true }
        )
        const snap = await getDoc(ref)
        setData(snap.exists() ? snap.data() : null)
      } catch (e) {
        setError(e?.message || String(e))
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  return (
    <>
      <div>Hello World!</div>
      <div style={{ marginTop: 16 }}>
        <strong>Firestore check:</strong>
        {loading && <div>Contacting Firestore…</div>}
        {!loading && error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {!loading && !error && (
          data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <div>No data yet.</div>
        )}
      </div>
    </>
  )
}

export default App
