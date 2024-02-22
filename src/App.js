
import React, { useEffect, useState } from 'react';
import {addMusicFile, openDatabase, storeLastPlayedSongInfo, retrieveLastPlayedSongInfo } from './db/indexDb';
import './App.css';

const App = function () {
  const [currentSongs, setCurrentSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playnow, setPlaynow] = useState(null);
  const [songname, setSongname] = useState(null);

  useEffect(() => {
    retrieveSongsFromIndexedDB();
    async function fetchData() {
      const lastPlayedInfo = await retrieveLastPlayedSongInfo();
      if (lastPlayedInfo) {
        setCurrentIndex(lastPlayedInfo.index);
      }
    }
    fetchData();
  }, []);

  async function handleFile(event) {
    const files = event.target.files;
    const newSongs = [...currentSongs, ...files];
    setCurrentSongs(newSongs);
    await storeSongsInIndexedDB(newSongs);
  }

  function handleSongClick(index) {
    setCurrentIndex(index);
    setPlaynow(currentSongs[index]);
    setSongname(currentSongs[index].name);
    storeLastPlayedSongInfo(index, 0); 
  }

  function handleEndSong() {
    setCurrentIndex(index => index + 1);
    storeLastPlayedSongInfo(currentIndex + 1, 0); 
  }

  useEffect(() => {
    setPlaynow(currentSongs[currentIndex]);
  }, [currentIndex, currentSongs, playnow]);

  async function storeSongsInIndexedDB(songs) {
    try {
      for (const song of songs) {
        await addMusicFile(song);
      }
    } catch (error) {
      console.error('Error storing songs:', error);
    }
  }

  async function retrieveSongsFromIndexedDB() {
    try {
      const db = await openDatabase();
      const transaction = db.transaction(['music'], 'readonly');
      const objectStore = transaction.objectStore('music');
      const getRequest = objectStore.getAll();
      getRequest.onsuccess = function (event) {
        const songs = event.target.result || [];
        setCurrentSongs(songs.filter(song => song));
      };
      getRequest.onerror = function (event) {
        console.error('Error retrieving songs:', event.target.error);
      };
    } catch (error) {
      console.error('Error retrieving songs:', error);
    }
  }

 async function storeLastPlayedSongInfo(index, position) {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['lastplayed'], 'readwrite');
    const objectStore = transaction.objectStore('lastplayed');
    console.log(index);
    const putRequest = objectStore.put({ id: 'lastPlayed', index, position });
    putRequest.onsuccess = function (event) {
      console.log('Last played song info stored successfully');
    };
    putRequest.onerror = function (event) {
      console.error('Error storing last played song info:', event.target.error);
    };
  } catch (error) {
    console.error('Error storing last played song info:', error);
  }
}


 async function retrieveLastPlayedSongInfo() {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(['lastplayed'], 'readonly');
    const objectStore = transaction.objectStore('lastplayed');
    const getRequest = objectStore.get('lastPlayed');
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = function (event) {
        const lastPlayedInfo = event.target.result;
        console.log(lastPlayedInfo.in+"last");
        return resolve(lastPlayedInfo);
      };
      getRequest.onerror = function (event) {
        console.error('Error retrieving last played song info:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (error) {
    console.error('Error retrieving last played song info:', error);
    return null;
  }
}


  return (
    <div className="app-container">
      <h1>MP3 PLAYER</h1>
      <input type="file" className="file-input" id="fileInput" onChange={handleFile} multiple />
      <label htmlFor="fileInput" className="custom-file-input">Choose Music Files</label>
      <div className="center-content">
        <img src='/music.png' alt="Music" className="music-icon" />
      </div>
      <div className="main-audio">
        {playnow && (
          <div>
            <h2>{songname}</h2>
            <audio controls src={URL.createObjectURL(playnow)} onEnded={handleEndSong} autoPlay />
          </div>
        )}
      </div>
      <div className="song-list">
        {currentSongs.map((playsong, index) => (
          <div key={index} onClick={() => handleSongClick(index)} className={`song-item ${currentIndex === index ? 'active' : ''}`}>
            <div className="song-name">{playsong.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
