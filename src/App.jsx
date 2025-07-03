import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from 'firebase/firestore';

import ShoeForm from './components/ShoeForm';
import ShoeTable from './components/ShoeTable';
import Modal from './components/Modal';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyBZGYMOE9H0BKJE7Kkb2Ie_FgWjIzkpncg",
      authDomain: "shoe-management-app.firebaseapp.com",
      projectId: "shoe-management-app",
      storageBucket: "shoe-management-app.firebasestorage.app",
      messagingSenderId: "Y93634111907",
      appId: "1:93634111907:web:4bfc0692b841f1bd221216",
      measurementId: "G-GPS6H47Y6B"
    };

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [shoes, setShoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShoe, setCurrentShoe] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('size');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestoreDb);
        setAuth(firebaseAuth);

        if (initialAuthToken) {
          await signInWithCustomToken(firebaseAuth, initialAuthToken);
          console.log("Signed in with custom token.");
        } else {
          await signInAnonymously(firebaseAuth);
          console.log("Signed in anonymously.");
        }

        onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("User ID set:", user.uid);
          } else {
            setUserId(null);
            console.log("User signed out or no user.");
          }
          setLoading(false);
        });

      } catch (err) {
        console.error("Error initializing Firebase or authenticating:", err);
        setError("Failed to connect to Firebase. Check console for details.");
        setLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  useEffect(() => {
    if (db && userId) {
      const shoesCollectionRef = collection(db, `artifacts/${appId}/public/data/shoes`);
      console.log(`Listening to collection: artifacts/${appId}/public/data/shoes`);

      const q = query(shoesCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const shoesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setShoes(shoesData);
        setLoading(false);
        console.log("Shoes data updated:", shoesData);
      }, (err) => {
        console.error("Error fetching shoes:", err);
        setError("Failed to load shoe data. Please try again.");
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [db, userId, appId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredAndSortedShoes = React.useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = shoes.filter(shoe => {
      return (
        String(shoe.size).toLowerCase().includes(lowerCaseSearchTerm) ||
        shoe.season.toLowerCase().includes(lowerCaseSearchTerm) ||
        (shoe.details && shoe.details.toLowerCase().includes(lowerCaseSearchTerm))
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let valA, valB;

      if (sortKey === 'size') {
        valA = a.size;
        valB = b.size;
      } else if (sortKey === 'season') {
        valA = a.season.toLowerCase();
        valB = b.season.toLowerCase();
      } else if (sortKey === 'details') {
        valA = (a.details || '').toLowerCase();
        valB = (b.details || '').toLowerCase();
      } else {
        return 0;
      }

      if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [shoes, searchTerm, sortKey, sortOrder]);

  const handleSaveShoe = async (shoeData) => {
    if (!db || !userId) {
      setError("Database not ready. Please wait.");
      return;
    }

    try {
      if (currentShoe) {
        const shoeDocRef = doc(db, `artifacts/${appId}/public/data/shoes`, currentShoe.id);
        await updateDoc(shoeDocRef, shoeData);
        console.log("Shoe updated successfully:", shoeData);
      } else {
        const shoesCollectionRef = collection(db, `artifacts/${appId}/public/data/shoes`);
        await addDoc(shoesCollectionRef, {
          ...shoeData,
          createdAt: new Date(),
        });
        console.log("Shoe added successfully:", shoeData);
      }
      setIsModalOpen(false);
      setCurrentShoe(null);
      setError('');
    } catch (err) {
      console.error("Error saving shoe:", err);
      setError("Failed to save shoe. Please try again.");
    }
  };

  const deleteShoe = async (id) => {
    if (!db || !userId) {
      setError("Database not ready. Please wait.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this shoe record?")) {
      try {
        const shoeDocRef = doc(db, `artifacts/${appId}/public/data/shoes`, id);
        await deleteDoc(shoeDocRef);
        console.log("Shoe deleted successfully:", id);
        setError('');
      } catch (err) {
        console.error("Error deleting shoe:", err);
        setError("Failed to delete shoe. Please try again.");
      }
    }
  };

  const handleAddClick = () => {
    setCurrentShoe(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (shoe) => {
    setCurrentShoe(shoe);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentShoe(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700">Loading application...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 p-4">
        <p className="text-lg text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          👟 Shoe Management App
        </h1>

        {userId && (
          <p className="text-sm text-gray-600 text-center mb-4">
            Current User ID: <span className="font-mono bg-gray-100 p-1 rounded">{userId}</span>
          </p>
        )}

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by size, season, or details..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-6 items-center justify-center sm:justify-start">
          <span className="text-gray-700 font-medium mr-2">Sort by:</span>
          {['size', 'season', 'details'].map((key) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-200 ease-in-out
                ${sortKey === key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}{' '}
              {sortKey === key && (
                sortOrder === 'asc' ? '▲' : '▼'
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddClick}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Add New Shoe
          </button>
        </div>

        <ShoeTable shoes={filteredAndSortedShoes} onEdit={handleEditClick} onDelete={deleteShoe} />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={currentShoe ? 'Edit Shoe Record' : 'Add New Shoe Record'}
        >
          <ShoeForm
            shoe={currentShoe}
            onSave={handleSaveShoe}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </div>
  );
}
 
export default App;
