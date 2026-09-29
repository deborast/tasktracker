import { db, auth } from './firebase-config.js';
import { ref, push, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

let userUid = null;
let tugasRef = null;
let allTasks = []; 

const inputDeadline = document.getElementById('deadline');
if (inputDeadline) {
    const today = new Date().toISOString().split('T')[0];
    inputDeadline.setAttribute('min', today);
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        userUid = user.uid;
        tugasRef = ref(db, `ccds8/${userUid}`);
        tampilkanDataTugas(); 

        const greeting = document.getElementById('userGreeting');
        const avatar = document.getElementById('userAvatar');
        const namaUser = user.displayName || user.email.split('@')[0];
        
        if (greeting) greeting.textContent = `Hai, ${namaUser}`;
        
        if (avatar) {
            avatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${namaUser}&background=random&color=fff&bold=true`;
            avatar.style.display = 'block';
        }
    }
});

const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        Swal.fire({
            title: 'Ingin Keluar?',
            text: "Anda akan diarahkan ke halaman login.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                signOut(auth).then(() => window.location.href = "login.html");
            }
        });
    });
}

const btnAturProfil = document.getElementById('btnAturProfil');
if (btnAturProfil) {
    btnAturProfil.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
            const namaBaru = prompt("Masukkan nama panggilan baru:", user.displayName || "");
            if (namaBaru !== null && namaBaru.trim() !== "") {
                const fotoBaru = `https://ui-avatars.com/api/?name=${namaBaru}&background=random&color=fff&bold=true`;
                updateProfile(user, { displayName: namaBaru, photoURL: fotoBaru })
                    .then(() => {
                        Swal.fire('Berhasil!', 'Profil berhasil diperbarui.', 'success');
                        document.getElementById('userGreeting').textContent = `Hai, ${namaBaru}`;
                        document.getElementById('userAvatar').src = fotoBaru;
                    })
                    .catch((error) => Swal.fire('Gagal!', error.message, 'error'));
            }
        }
    });
}

//c
const formTugas = document.getElementById('tugasForm');
if (formTugas) {
    formTugas.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!tugasRef) return;
        push(tugasRef, {
            matkul: document.getElementById('matkul').value,
            namaTugas: document.getElementById('namaTugas').value,
            deadline: document.getElementById('deadline').value,
            prioritas: document.getElementById('prioritas').value,
            status: "Belum Selesai"
        });
        this.reset();
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Tugas berhasil ditambahkan',
            showConfirmButton: false,
            timer: 1500
        });
    });
}

//r
function tampilkanDataTugas() {
    onValue(tugasRef, (snapshot) => {
        allTasks = []; 
        snapshot.forEach((childSnapshot) => {
            allTasks.push({
                key: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        renderTable(); 
    });
}

const inputSearch = document.getElementById('searchInput');
if (inputSearch) inputSearch.addEventListener('input', renderTable);

const inputSort = document.getElementById('sortInput');
if (inputSort) inputSort.addEventListener('change', renderTable);

function renderTable() {
    const tabel = document.getElementById('tabelTugas');
    if (!tabel) return;

    const elSearch = document.getElementById('searchInput');
    const elSort = document.getElementById('sortInput');
    const searchValue = elSearch ? elSearch.value.toLowerCase() : "";
    const sortValue = elSort ? elSort.value : "default";
    const total = allTasks.length;
    const selesai = allTasks.filter(t => t.status === "Selesai").length;
    const belum = total - selesai;
    const progress = total === 0 ? 0 : Math.round((selesai / total) * 100);

    if (document.getElementById('statTotal')) document.getElementById('statTotal').textContent = total;
    if (document.getElementById('statSelesai')) document.getElementById('statSelesai').textContent = selesai;
    if (document.getElementById('statBelum')) document.getElementById('statBelum').textContent = belum;
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${progress}%`;
    }

    let filteredTasks = allTasks.filter(t => 
        t.namaTugas.toLowerCase().includes(searchValue) || 
        t.matkul.toLowerCase().includes(searchValue)
    );

    filteredTasks.sort((a, b) => {
        if (a.status === "Belum Selesai" && b.status === "Selesai") return -1;
        if (a.status === "Selesai" && b.status === "Belum Selesai") return 1;

        if (sortValue === "deadlineAsc") {
            return new Date(a.deadline) - new Date(b.deadline); 
        } else if (sortValue === "deadlineDesc") {
            return new Date(b.deadline) - new Date(a.deadline); 
        } else if (sortValue === "prioritas") {
            if (a.prioritas === "Tinggi" && b.prioritas !== "Tinggi") return -1;
            if (a.prioritas !== "Tinggi" && b.prioritas === "Tinggi") return 1;
            return 0;
        }
        
        return 0;
    });
    tabel.innerHTML = ''; 
    if (filteredTasks.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    <h5 class="fw-bold">📭 Tidak ada tugas yang ditampilkan.</h5>
                    <p>Waktunya bersantai ☕ atau tambahkan tugas baru di atas.</p>
                </td>
            </tr>
        `;
        return;
    }

    filteredTasks.forEach(data => {
        const statusBadge = data.status === "Selesai" ? "bg-success" : "bg-warning text-dark";
        tabel.innerHTML += `
            <tr>
                <td class="fw-semibold">${data.matkul}</td>
                <td>${data.namaTugas}</td>
                <td>${data.deadline}</td>
                <td><span class="${data.prioritas === 'Tinggi' ? 'text-danger fw-bold' : ''}">${data.prioritas}</span></td>
                <td><span class="badge ${statusBadge}">${data.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-success me-1" onclick="updateStatus('${data.key}', '${data.status}')">✔ Selesai</button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editTugas('${data.key}', '${data.namaTugas}', '${data.deadline}', '${data.prioritas}')">✏️ Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="hapusTugas('${data.key}')">🗑 Hapus</button>
                </td>
            </tr>
        `;
    });
}

//u
window.updateStatus = function(key, currentStatus) {
    const statusBaru = currentStatus === "Selesai" ? "Belum Selesai" : "Selesai";
    const itemRef = ref(db, `ccds8/${userUid}/${key}`);
    update(itemRef, { status: statusBaru });
};

//d
window.hapusTugas = function(key) {
    Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: "Tugas yang dihapus tidak bisa dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            const itemRef = ref(db, `ccds8/${userUid}/${key}`);
            remove(itemRef);
            Swal.fire('Terhapus!', 'Data tugas berhasil dihapus.', 'success');
        }
    });
};

//edit&dm
window.editTugas = function(key, oldNama, oldDeadline, oldPrioritas) {
    Swal.fire({
        title: 'Edit Detail Tugas',
        html: `
            <div class="text-start mb-2"><small>Nama Tugas</small></div>
            <input id="swal-edit-nama" class="swal2-input m-0 w-100 mb-3" value="${oldNama}">
            
            <div class="text-start mb-2"><small>Deadline Baru</small></div>
            <input id="swal-edit-deadline" type="date" class="swal2-input m-0 w-100 mb-3" value="${oldDeadline}">
            
            <div class="text-start mb-2"><small>Prioritas</small></div>
            <select id="swal-edit-prioritas" class="swal2-input m-0 w-100 mb-2">
                <option value="Biasa" ${oldPrioritas === 'Biasa' ? 'selected' : ''}>Biasa</option>
                <option value="Tinggi" ${oldPrioritas === 'Tinggi' ? 'selected' : ''}>Tinggi</option>
            </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Simpan Perubahan',
        cancelButtonText: 'Batal',
        preConfirm: () => {
            return {
                namaTugas: document.getElementById('swal-edit-nama').value,
                deadline: document.getElementById('swal-edit-deadline').value,
                prioritas: document.getElementById('swal-edit-prioritas').value
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const itemRef = ref(db, `ccds8/${userUid}/${key}`);
            update(itemRef, { 
                namaTugas: result.value.namaTugas,
                deadline: result.value.deadline,
                prioritas: result.value.prioritas
            });
            Swal.fire('Tersimpan!', 'Detail tugas berhasil diubah.', 'success');
        }
    });
};

// dmtoggle
const btnDarkMode = document.getElementById('btnDarkMode');
if (btnDarkMode) {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        btnDarkMode.textContent = '☀️';
        btnDarkMode.classList.replace('btn-outline-dark', 'btn-outline-light');
    }
    btnDarkMode.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            btnDarkMode.textContent = '☀️';
            btnDarkMode.classList.replace('btn-outline-dark', 'btn-outline-light');
            localStorage.setItem('theme', 'dark');
        } else {
            btnDarkMode.textContent = '🌙';
            btnDarkMode.classList.replace('btn-outline-light', 'btn-outline-dark');
            localStorage.setItem('theme', 'light');
        }
    });
}