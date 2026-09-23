import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const tugasRef = ref(db, 'ccds8');

//c
document.getElementById('tugasForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    push(tugasRef, {
        matkul: document.getElementById('matkul').value,
        namaTugas: document.getElementById('namaTugas').value,
        deadline: document.getElementById('deadline').value,
        prioritas: document.getElementById('prioritas').value,
        status: "Belum Selesai"
    });

    this.reset(); 
});

//r
onValue(tugasRef, (snapshot) => {
    const tabel = document.getElementById('tabelTugas');
    tabel.innerHTML = ''; 

    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const data = childSnapshot.val();

        const statusBadge = data.status === "Selesai" ? "bg-success" : "bg-warning text-dark";

        tabel.innerHTML += `
            <tr>
                <td>${data.matkul}</td>
                <td>${data.namaTugas}</td>
                <td>${data.deadline}</td>
                <td>${data.prioritas}</td>
                <td><span class="badge ${statusBadge}">${data.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="updateStatus('${key}', '${data.status}')">✔ Selesai</button>
                    <button class="btn btn-sm btn-danger" onclick="hapusTugas('${key}')">🗑 Hapus</button>
                </td>
            </tr>
        `;
    });
});

//u
window.updateStatus = function(key, currentStatus) {
    const statusBaru = currentStatus === "Selesai" ? "Belum Selesai" : "Selesai";
    const itemRef = ref(db, 'ccds8/' + key); 
    update(itemRef, { status: statusBaru });
};

//d
window.hapusTugas = function(key) {
    if(confirm('Yakin ingin menghapus tugas ini?')) {
        const itemRef = ref(db, 'ccds8/' + key);
        remove(itemRef);
    }
};