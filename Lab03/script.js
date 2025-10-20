function aktualizujKomunikat(wiadomosc, kolor = "black") {
    const elementKomunikat = document.getElementById('komunikat');
    if (elementKomunikat) {
        elementKomunikat.textContent = wiadomosc;
        elementKomunikat.style.color = kolor;
        elementKomunikat.style.fontWeight = "bold";
    }
}

function sukcesGeolokalizacji(pozycja) {
    const szerokosc = pozycja.coords.latitude.toFixed(2);
    const dlugosc = pozycja.coords.longitude.toFixed(2);

    const wiadomosc = `Zgoda na lokalizację: Udzielona! Twoja pozycja to: Szerokość ${szerokosc}, Długość ${dlugosc}.`;
    aktualizujKomunikat(wiadomosc, "green");

    console.log("Lokalizacja pobrana:", pozycja);
}

function bladGeolokalizacji(blad) {
    let wiadomoscBledu = "Zgoda na lokalizację: NIEUDZIELONA.";

    switch(blad.code) {
        case blad.PERMISSION_DENIED:
            wiadomoscBledu = "Zgoda na lokalizację: Odmówiona przez użytkownika. Nie mogę pobrać Twojej pozycji.";
            break;
        case blad.POSITION_UNAVAILABLE:
            wiadomoscBledu = "Zgoda na lokalizację: Pozycja jest niedostępna (np. problem z GPS).";
            break;
        case blad.TIMEOUT:
            wiadomoscBledu = "Zgoda na lokalizację: Upłynął czas oczekiwania na pobranie pozycji.";
            break;
    }

    aktualizujKomunikat(wiadomoscBledu, "red");
    console.error("Błąd geolokalizacji:", blad.message);
}

if ("geolocation" in navigator) {
    aktualizujKomunikat("Trwa prośba o dostęp do Twojej lokalizacji...");
    navigator.geolocation.getCurrentPosition(sukcesGeolokalizacji, bladGeolokalizacji);

} else {
    aktualizujKomunikat("Przykro mi, ale Twoja przeglądarka nie obsługuje geolokalizacji.", "orange");
    console.warn("Geolokalizacja nie jest obsługiwana w tej przeglądarce.");
}