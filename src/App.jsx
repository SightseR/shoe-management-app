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
  const [sortOption, setSortOption] = useState('size-asc'); // New state for combined sort option

  // New states for filtering
  const [minSizeFilter, setMinSizeFilter] = useState('');
  const [maxSizeFilter, setMaxSizeFilter] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState([]); // Array to hold selected seasons

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

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleMinSizeChange = (e) => {
    setMinSizeFilter(e.target.value);
  };

  const handleMaxSizeChange = (e) => {
    setMaxSizeFilter(e.target.value);
  };

  const handleSeasonFilterChange = (e) => {
    const season = e.target.value;
    if (e.target.checked) {
      setSelectedSeasons([...selectedSeasons, season]);
    } else {
      setSelectedSeasons(selectedSeasons.filter(s => s !== season));
    }
  };

  const filteredAndSortedShoes = React.useMemo(() => {
    let currentShoes = [...shoes];

    // Apply search filter
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    currentShoes = currentShoes.filter(shoe => {
      return (
        String(shoe.size).toLowerCase().includes(lowerCaseSearchTerm) ||
        shoe.season.toLowerCase().includes(lowerCaseSearchTerm) ||
        (shoe.details && shoe.details.toLowerCase().includes(lowerCaseSearchTerm))
      );
    });

    // Apply size range filter
    const min = parseFloat(minSizeFilter);
    const max = parseFloat(maxSizeFilter);

    if (!isNaN(min)) {
      currentShoes = currentShoes.filter(shoe => shoe.size >= min);
    }
    if (!isNaN(max)) {
      currentShoes = currentShoes.filter(shoe => shoe.size <= max);
    }

    // Apply season filter
    if (selectedSeasons.length > 0) {
      currentShoes = currentShoes.filter(shoe => selectedSeasons.includes(shoe.season));
    }

    // Apply sorting
    const [sortKey, sortOrder] = sortOption.split('-');

    const sorted = [...currentShoes].sort((a, b) => {
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
  }, [shoes, searchTerm, sortOption, minSizeFilter, maxSizeFilter, selectedSeasons]);

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

  const handleSaveShoeForm = (shoeData) => {
    if (currentShoe) {
      updateShoe({ ...shoeData, id: currentShoe.id });
    } else {
      addShoe(shoeData);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['Shoe Size', 'Season', 'Image', 'Details'];
    const csvRows = [];

    csvRows.push(headers.map(header => `"${header}"`).join(','));

    shoes.forEach(shoe => {
      const row = [
        shoe.size,
        shoe.season,
        shoe.imageUrl || '',
        `"${(shoe.details || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'shoe_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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

        <div className="flex flex-wrap gap-4 mb-6 items-center justify-center sm:justify-start">
          {/* Sort Dropdown */}
          <div className="flex items-center">
            <label htmlFor="sort-by" className="text-gray-700 font-medium mr-2">Sort by:</label>
            <select
              id="sort-by"
              value={sortOption}
              onChange={handleSortChange}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="size-asc">Size (↑)</option>
              <option value="size-desc">Size (↓)</option>
              <option value="season-asc">Season (↑)</option>
              <option value="season-desc">Season (↓)</option>
              <option value="details-asc">Details (↑)</option>
              <option value="details-desc">Details (↓)</option>
            </select>
          </div>

          {/* Size Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Size Range:</span>
            <input
              type="number"
              placeholder="Min"
              value={minSizeFilter}
              onChange={handleMinSizeChange}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="20"
              max="50"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxSizeFilter}
              onChange={handleMaxSizeChange}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              min="20"
              max="50"
            />
          </div>

          {/* Season Checkbox Filter */}
          <div className="flex items-center gap-3">
            <span className="text-gray-700 font-medium">Seasons:</span>
            {['Summer', 'Autumn/Spring', 'Winter'].map(season => (
              <label key={season} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={season}
                  checked={selectedSeasons.includes(season)}
                  onChange={handleSeasonFilterChange}
                  className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                />
                <span className="ml-2 text-gray-700 text-sm">{season}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-6">
          
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
          <button
            onClick={handleDownloadCSV}
            className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-105"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              ></path>
            </svg>
            CSV
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
            onSave={handleSaveShoeForm}
            onCancel={handleCloseModal}
          />
        </Modal>
      </div>
    </div>
  );
}

export default App;
