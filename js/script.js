"use strict";

const ACARA = {
  akad: {
    judul: "Akad Nikah Lee Su Ho & Ha-Eun",
    mulai: "2026-10-30T08:00+07:00",
    selesai: "2026-10-30T10:30:00+07:00",
    lokasi: "The Sun Hotel Sidoarjo Ballroom, Sidoarjo, Jawa Timur",
    detail: "Akad nikah Lee Su Ho & Ha-Eun. Khusus keluarga dan saudara dekat.",
  },
  resepsi: {
    judul: "Resepsi Pernikahan Lee Su Ho & Ha-Eun",
    mulai: "2026-10-30T18:00:00+07:00",
    selesai: "2026-10-30T22:00:00+07:00",
    lokasi: "The Sun Hotel Sidoarjo Ballroom, Sidoarjo, Jawa Timur",
    detail: "Resepsi pernikahan Lee Su Ho & Ha-Eun.",
  },
};

const KATEGORI_GALERI = {
  prewedding: "Pre-wedding",
  lamaran: "Propose",
};

const GALERI = [
  {
    kategori: "prewedding", kolom: "col-md-6 col-lg-4", rasio: "125%",
    url: "aset/galeri/prewedding/prewed1.jpg",
    alt: "Foto pre-wedding 1",
  },
  {
    kategori: "prewedding", kolom: "col-md-6 col-lg-4", rasio: "125%",
    url: "aset/galeri/prewedding/prewed2.jpg",
    alt: "Foto pre-wedding 2",
  },
  {
    kategori: "prewedding", kolom: "col-md-6 col-lg-4", rasio: "125%",
    url: "aset/galeri/prewedding/prewed3.jpg",
    alt: "Foto pre-wedding 3",
  },
  {
    kategori: "lamaran", kolom: "col-md-6 col-lg-4", rasio: "125%",
    url: "aset/galeri/lamaran/lamaran1.jpg",
    alt: "Foto lamaran 1",
  },
  {
    kategori: "lamaran", kolom: "col-md-6 col-lg-4", rasio: "125%",
    url: "aset/galeri/lamaran/lamaran2.jpg",
    alt: "Foto lamaran 2",
  },
  {
    kategori: "lamaran", kolom: "col-md-6 col-lg-4", rasio: "125%",
    url: "aset/galeri/lamaran/lamaran3.jpg",
    alt: "Foto lamaran 3",
  },
];

function $(selector, root) {
  return (root || document).querySelector(selector);
}

function $$(selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
}

function duaDigit(angka) {
  return String(angka).padStart(2, "0");
}

function tampilToast(pesan) {
  $("#toastPesan").textContent = pesan;
  bootstrap.Toast.getOrCreateInstance($("#toastUtama")).show();
}

function initHitungMundur() {
  const target = new Date(ACARA.akad.mulai).getTime();
  const elHari = $("#hari");
  const elJam = $("#jam");
  const elMenit = $("#menit");
  const elDetik = $("#detik");
  let timer;

  function perbarui() {
    const selisih = target - Date.now();

    if (selisih <= 0) {
      elHari.textContent = elJam.textContent = elMenit.textContent = elDetik.textContent = "00";
      clearInterval(timer);
      return;
    }

    const detikTotal = Math.floor(selisih / 1000);
    elHari.textContent = duaDigit(Math.floor(detikTotal / 86400));
    elJam.textContent = duaDigit(Math.floor((detikTotal % 86400) / 3600));
    elMenit.textContent = duaDigit(Math.floor((detikTotal % 3600) / 60));
    elDetik.textContent = duaDigit(detikTotal % 60);
  }

  perbarui();
  timer = setInterval(perbarui, 1000);
}

function initMusik() {
  const audio = $("#musikLatar");
  const tombol = $("#tombolMusik");
  const ikon = $("i", tombol);

  function sinkronkan() {
    const sedangPutar = !audio.paused;
    tombol.classList.toggle("active", sedangPutar);
    tombol.setAttribute("aria-pressed", String(sedangPutar));
    tombol.setAttribute("aria-label", sedangPutar ? "Jeda musik latar" : "Putar musik latar");
    ikon.classList.toggle("bi-music-note-beamed", !sedangPutar);
    ikon.classList.toggle("bi-pause-fill", sedangPutar);
  }

  tombol.addEventListener("click", function () {
    if (!audio.paused) {
      audio.pause();
      return;
    }
    audio.play().catch(function () {
      tampilToast("Musik belum bisa diputar.");
    });
  });

  audio.addEventListener("play", sinkronkan);
  audio.addEventListener("pause", sinkronkan);
}

function formatKalender(iso) {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function urlGoogleCalendar(kunci) {
  const a = ACARA[kunci];
  return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(a.judul) +
    "&dates=" + formatKalender(a.mulai) + "/" + formatKalender(a.selesai) +
    "&details=" + encodeURIComponent(a.detail) +
    "&location=" + encodeURIComponent(a.lokasi);
}

function initKalender() {
  $$("[data-kalender]").forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      window.open(urlGoogleCalendar(tombol.dataset.kalender), "_blank", "noopener");
    });
  });
}

function renderGaleri() {
  const grid = $("#galeriGrid");

  GALERI.forEach(function (item, i) {
    const kolom = document.createElement("div");
    kolom.className = "galeri-col " + item.kolom;
    kolom.dataset.kategori = item.kategori;
    kolom.dataset.index = i;

    kolom.innerHTML =
      '<figure class="galeri-item position-relative">' +
        '<div class="ratio" style="--bs-aspect-ratio: ' + item.rasio + ';">' +
          '<img class="object-fit-cover" src="' + item.url + '" alt="' + item.alt + '" loading="lazy">' +
        '</div>' +
        '<span class="badge badge-kategori">' + KATEGORI_GALERI[item.kategori] + '</span>' +
        '<button type="button" class="stretched-link btn p-0 border-0" data-lightbox>' +
        '<span class="visually-hidden">Perbesar foto</span>' +
        '</button>' +
      '</figure>';

    const figure = $("figure", kolom);
    $("img", kolom).addEventListener("error", function () {
      figure.classList.add("foto-kosong");
    });

    grid.append(kolom);
  });
}

function initFilterGaleri() {
  const tombolFilter = $$("#filterGaleri [data-filter]");

  tombolFilter.forEach(function (tombol) {
    tombol.addEventListener("click", function () {
      const filter = tombol.dataset.filter;

      tombolFilter.forEach(function (t) {
        t.classList.toggle("active", t === tombol);
        t.setAttribute("aria-pressed", String(t === tombol));
      });

      $$(".galeri-col").forEach(function (kolom) {
        const cocok = filter === "semua" || kolom.dataset.kategori === filter;
        kolom.classList.toggle("d-none", !cocok);
      });
    });
  });
}

function initLightbox() {
  const elModal = $("#modalLightbox");
  const modal = bootstrap.Modal.getOrCreateInstance(elModal);
  const gambar = $("#lightboxImg");
  const judul = $("#lightboxJudul");
  const tag = $("#lightboxTag");

  let urutan = [];
  let posisi = 0;

  function tampilkan() {
    const item = GALERI[urutan[posisi]];
    gambar.src = item.url;
    gambar.alt = item.alt;
    judul.textContent = item.alt;
    tag.textContent = KATEGORI_GALERI[item.kategori];
  }

  function geser(arah) {
    posisi = (posisi + arah + urutan.length) % urutan.length;
    tampilkan();
  }

  $("#galeriGrid").addEventListener("click", function (e) {
    if (!e.target.closest("[data-lightbox]")) return;

    const kolom = e.target.closest(".galeri-col");
    if (kolom.querySelector(".foto-kosong")) return;

    urutan = $$(".galeri-col:not(.d-none)").map(function (k) { return Number(k.dataset.index); });
    posisi = urutan.indexOf(Number(kolom.dataset.index));
    tampilkan();
    modal.show();
  });

  $("#lightboxPrev").addEventListener("click", function () { geser(-1); });
  $("#lightboxNext").addEventListener("click", function () { geser(1); });

  document.addEventListener("keydown", function (e) {
    if (!elModal.classList.contains("show")) return;
    if (e.key === "ArrowLeft") geser(-1);
    if (e.key === "ArrowRight") geser(1);
  });
}

function initRSVP() {
  const form = $("#formRsvp");
  const status = $("#statusHadir");
  const jumlah = $("#jumlahTamu");
  const alertRsvp = $("#alertRsvp");

  function sinkronJumlah() {
    jumlah.disabled = (status.value === "Tidak hadir");
  }
  status.addEventListener("change", sinkronJumlah);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const data = {
      nama: $("#namaTamu").value.trim(),
      kontak: $("#kontakTamu").value.trim(),
      status: status.value,
      jumlah: jumlah.disabled ? 0 : Number(jumlah.value),
      pesan: $("#pesanTamu").value.trim(),
    };

    console.log("Data RSVP:", data);

    form.reset();
    form.classList.remove("was-validated");
    sinkronJumlah();

    alertRsvp.textContent = "Terima kasih, " + data.nama + ". Konfirmasi Anda sudah masuk.";
    alertRsvp.classList.remove("d-none");
    setTimeout(function () {
      alertRsvp.classList.add("d-none");
    }, 6000);
  });
}

function initNavbar() {
  $$("#menuNavbar .nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      const menu = bootstrap.Collapse.getInstance($("#menuNavbar"));
      if (menu) menu.hide();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initHitungMundur();
  initMusik();
  initKalender();
  renderGaleri();
  initFilterGaleri();
  initLightbox();
  initRSVP();
  initNavbar();
});