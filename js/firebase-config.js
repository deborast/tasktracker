import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDTPFUj3Di1LwD0_Evzaxa_V4vAUqAnQyw",
    authDomain: "ccds8-49f0f.firebaseapp.com",
    databaseURL: "https://ccds8-49f0f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ccds8-49f0f",
    storageBucket: "ccds8-49f0f.firebasestorage.app",
    messagingSenderId: "790919798686",
    appId: "1:790919798686:web:cc3d5bdddc1fd1e71f808f",
    measurementId: "G-5KPC1VZ1LK"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);