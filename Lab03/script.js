function aktualizujKomunikat(idElementu, wiadomosc, kolor = "black") {
    const elementKomunikat = document.getElementById(idElementu);
    if (elementKomunikat) {
        elementKomunikat.textContent = wiadomosc;
        elementKomunikat.style.color = kolor;
    }
}

let map;
function initMap(lat = 52.2297, lng = 21.0122, zoom = 16) {
    if (typeof L === 'undefined') return;
    if (!map) {
        map = L.map('map', {
            zoomControl: true,
            maxZoom: 22,
            minZoom: 1,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 60
        }).setView([lat, lng], zoom);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 22,
            attribution: 'Tiles © Esri — Source: Esri, ...',
            crossOrigin: true
        }).addTo(map);

        const resetControl = L.control({ position: 'topright' });
        resetControl.onAdd = function () {
            const btn = L.DomUtil.create('button', 'leaflet-control-reset');
            btn.innerHTML = 'Reset';
            btn.onclick = () => map.setView([52.2297, 21.0122], 13);
            return btn;
        };
        resetControl.addTo(map);
    } else {
        map.setView([lat, lng], zoom);
    }
}
document.getElementById('export-btn').addEventListener('click', () => {
    if (!map || typeof leafletImage === 'undefined') {
        aktualizujKomunikat('komunikat', "[Export]: Brak mapy lub biblioteki leaflet-image.", "red");
        return;
    }
    leafletImage(map, function(err, canvas) {
        if (err) {
            aktualizujKomunikat('komunikat', "[Export]: Błąd generowania obrazu.", "red");
            return;
        }
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'map.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
});
function sukcesGeolokalizacji(pozycja) {
    const szerokosc = pozycja.coords.latitude;
    const dlugosc = pozycja.coords.longitude;
    aktualizujKomunikat('komunikat', `[Geolokalizacja]: ${szerokosc.toFixed(6)}, ${dlugosc.toFixed(6)}`, "green");
    initMap(szerokosc, dlugosc, 20);
}
function bladGeolokalizacji(blad) {
    let wiadomoscBledu = "[Geolokalizacja]: NIEUDZIELONA.";
    if (blad && blad.code === 1) wiadomoscBledu = "[Geolokalizacja]: Odmówiona.";
    aktualizujKomunikat('komunikat', wiadomoscBledu, "red");
}
if ("geolocation" in navigator) {
    aktualizujKomunikat('komunikat', "[Geolokalizacja]: Prośba o dostęp...");
    navigator.geolocation.getCurrentPosition(sukcesGeolokalizacji, bladGeolokalizacji);
} else {
    aktualizujKomunikat('komunikat', "[Geolokalizacja]: Nieobsługiwana.", "orange");
}
document.getElementById('loc-btn').addEventListener('click', () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(sukcesGeolokalizacji, bladGeolokalizacji);
});
document.getElementById('export-btn').addEventListener('click', () => {
    if (!map || typeof leafletImage === 'undefined') {
        aktualizujKomunikat('komunikat', "[Export]: Brak mapy lub biblioteki leaflet-image.", "red");
        return;
    }
    leafletImage(map, function(err, canvas) {
        if (err) {
            aktualizujKomunikat('komunikat', "[Export]: Błąd generowania obrazu.", "red");
            return;
        }
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'map.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
});

function splitCanvasToTiles(sourceCanvas, cols = 4, rows = 4) {
    const tiles = [];
    const tileW = Math.floor(sourceCanvas.width / cols);
    const tileH = Math.floor(sourceCanvas.height / rows);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const canvas = document.createElement('canvas');
            canvas.width = tileW;
            canvas.height = tileH;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(sourceCanvas, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
            const img = new Image();
            img.src = canvas.toDataURL('image/png');
            img.draggable = true;
            img.dataset.correctIndex = r * cols + c;
            tiles.push(img);
        }
    }
    return tiles;
}

function buildBoard(cols = 4, rows = 4) {
    const board = document.getElementById('board');
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    for (let i = 0; i < cols * rows; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.dataset.index = i;
        slot.addEventListener('dragover', e => e.preventDefault());
        slot.addEventListener('drop', e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain');
            const stol = document.getElementById('stol');

            const existing = slot.children[0];
            if (existing) {
                existing.draggable = true;
                delete existing.dataset.placed;
                stol.appendChild(existing);
            }
            let tile = document.querySelector(`#stol img[data-id="${id}"]`);
            if (!tile) tile = document.querySelector(`#board img[data-id="${id}"]`);

            if (!tile) return;
            tile.parentElement && tile.parentElement.removeChild(tile);
            slot.innerHTML = '';
            slot.appendChild(tile);
            tile.draggable = false;
            tile.dataset.placed = slot.dataset.index;
            checkSolved();
        });
        board.appendChild(slot);
    }
}

function renderTilesToStol(tiles) {
    const stol = document.getElementById('stol');
    stol.innerHTML = '';
    tiles.forEach((img, i) => {
        img.dataset.id = i;
        img.style.width = '';
        img.style.height = '';
        img.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', img.dataset.id);
        });
        stol.appendChild(img);
    });
}

function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function checkSolved() {
    const slots = Array.from(document.querySelectorAll('.slot'));
   
    if (slots.some(s => s.children.length === 0)) return; 
    
    // Sprawdź, czy każdy kafelek jest w poprawnym slocie
    const ok = slots.every(s => {
        const img = s.children[0];
        return img && String(img.dataset.correctIndex) === String(s.dataset.index);
    });
    
    if (ok) {
        console.log("PUZZLE UŁOŻONE POPRAWNIE!");
        window.requestAnimationFrame(() => {
   
            setTimeout(() => {
                if (Notification.permission === "granted") {
                 
                    aktualizujKomunikat('komunikat', "UKOŃCZONO: Gratulacje! Obrazek ułożony poprawnie.", "green");
                    new Notification("PUZZLE: Gratulacje!", { body: "Ułożyłeś obrazek. 🎉" });
                } else {
                    aktualizujKomunikat('komunikat', "UKOŃCZONO: Gratulacje! Obrazek ułożony poprawnie.", "green");
                    alert("Gratulacje! Ułożyłeś obrazek.");
                }
            }, 10); 
        });
    }
}

document.getElementById('raster-btn').addEventListener('click', () => {
    if (!map || typeof leafletImage === 'undefined') {
        aktualizujKomunikat('komunikat', "[Export]: Brak mapy lub biblioteki leaflet-image.", "red");
        return;
    }
    
    const RASTER_SIZE = { width: 480, height: 480 };
    
    leafletImage(map, function(err, canvas) {
        if (err) {
            aktualizujKomunikat('komunikat', "[Export]: Błąd generowania obrazu. Upewnij się, że używasz przeglądarki z włączonymi CORS dla kafelków mapy (często działa dobrze, ale może się nie udać z powodu zabezpieczeń).", "red");
            return;
        }
        
        const tiles = splitCanvasToTiles(canvas, 4, 4);
        const shuffled = shuffleArray(tiles.slice());
        buildBoard(4, 4);
        renderTilesToStol(shuffled);
        
        aktualizujKomunikat('komunikat', "[Puzzle]: Mapa została pobrana i podzielona na 16 kafelków (480x480px).", "blue");
    }, RASTER_SIZE); 
});



function poprosOZgodeNaPowiadomienia() {
    if (!("Notification" in window)) {
        aktualizujKomunikat('komunikat-powiadomienia', "[Powiadomienia]: Przeglądarka nie obsługuje powiadomień.", "orange");
        return;
    }

    const aktualnyStatus = Notification.permission;

    if (aktualnyStatus === "granted") {
        aktualizujKomunikat('komunikat-powiadomienia', "[Powiadomienia]: Zgoda na powiadomienia jest już Udzielona.", "green");
        return;
    }

    if (aktualnyStatus === "denied") {
        aktualizujKomunikat('komunikat-powiadomienia', "[Powiadomienia]: Zgoda na powiadomienia została Odmówiona (zablokowana).", "red");
        return;
    }

    aktualizujKomunikat('komunikat-powiadomienia', "[Powiadomienia]: Trwa prośba o zgodę na powiadomienia...", "blue");

    Notification.requestPermission().then(statusZgody => {
        if (statusZgody === "granted") {
            aktualizujKomunikat('komunikat-powiadomienia', "[Powiadomienia]: Zgoda na powiadomienia: Udzielona.", "green");
    
        } else if (statusZgody === "denied") {
            aktualizujKomunikat('komunikat-powiadomienia', "[Powiadomienia]: Zgoda na powiadomienia: Odmówiona.", "red");
        } else { 
             aktualizujKomunikat('komunikat-powiadomienia', "[Powiadomienia]: Zgoda na powiadomienia: Status domyślny (ignorowany).", "blue");
        }
    });
}



poprosOZgodeNaPowiadomienia();