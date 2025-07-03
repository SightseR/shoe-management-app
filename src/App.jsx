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
  orderBy,
} from 'firebase/firestore';

import ShoeForm from './components/ShoeForm';
import ShoeTable from './components/ShoeTable';
import Modal from './components/Modal';

// Global variables provided by the Canvas environment for Firebase setup
// These are mandatory and should NOT be prompted from the user.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// IMPORTANT: For local development, replace this with your actual Firebase config from the Firebase Console.
// When deployed to Canvas, __firebase_config will be provided automatically.
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
                shoesData.sort((a, b) => a.size - b.size);
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

  

  /**
   * Adds a new shoe record to Firestore.
   * @param {Object} newShoe - The shoe data to add.
   */
  const addShoe = async (newShoe) => {
    if (!db || !userId) {
      setError("Database not ready. Please wait.");
      return;
    }
    try {
      const shoesCollectionRef = collection(db, `artifacts/${appId}/public/data/shoes`);
      await addDoc(shoesCollectionRef, {
        ...newShoe,
        createdAt: new Date(), 
      });
      console.log("Shoe added successfully:", newShoe);
      setIsModalOpen(false); 
    } catch (err) {
      console.error("Error adding shoe:", err);
      setError("Failed to add shoe. Please try again.");
    }
  };

  /**
   * Updates an existing shoe record in Firestore.
   * @param {Object} updatedShoe - The updated shoe data, including its ID.
   */
  const updateShoe = async (updatedShoe) => {
    if (!db || !userId) {
      setError("Database not ready. Please wait.");
      return;
    }
    try {
      
      if (!updatedShoe.id) {
        setError("Cannot update shoe: ID is missing.");
        return;
      }
      const shoeDocRef = doc(db, `artifacts/${appId}/public/data/shoes`, updatedShoe.id);
      
      const { id, ...dataToUpdate } = updatedShoe;
      await updateDoc(shoeDocRef, dataToUpdate);
      console.log("Shoe updated successfully:", updatedShoe);
      setIsModalOpen(false); 
      setCurrentShoe(null); 
    } catch (err) {
      console.error("Error updating shoe:", err);
      setError("Failed to update shoe. Please try again.");
    }
  };

  /**
   * Deletes a shoe record from Firestore.
   * @param {string} id - The ID of the shoe to delete.
   */
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

  const handleSaveShoe = (shoeData) => {
    if (currentShoe) {
      
      updateShoe({ ...shoeData, id: currentShoe.id });
    } else {
      
      addShoe(shoeData);
    }
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

        {/* User ID Display */}
        {userId && (
          <p className="text-sm text-gray-600 text-center mb-4">
            Current User ID: <span className="font-mono bg-gray-100 p-1 rounded">{userId}</span>
          </p>
        )}

        {/* Add New Record Button */}
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

        {/* Shoe Table */}
        <ShoeTable shoes={shoes} onEdit={handleEditClick} onDelete={deleteShoe} />

        {/* Add/Edit Shoe Modal */}
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
