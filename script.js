"use strict";

let search = document.getElementById("search-input").value;
const output_ip = document.getElementById("ip");
const city = document.getElementById("city");
const country_and_postal = document.getElementById("country-and-postal");
const info_time_zone = document.getElementById("info-time-zone");
const company_name_first_part = document.getElementById(
  "company-name-first-part",
);
const company_name_second_part = document.getElementById(
  "company-name-second-part",
);

const form = document.querySelector("form");

let map;
let marker;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  search = document.getElementById("search-input").value;
  getIP(search);
});

if (!search) {
  getIP();
}

function initMap(lat, long) {
  map = L.map("map", {
    zoomControl: false,
    maxBounds: [
      [-85, -Infinity],
      [85, Infinity],
    ],
    maxBoundsViscosity: 1.0,
    minZoom: 2,
    zoomSnap: 0,
    zoomDelta: 0.1,
    worldCopyJump: true,
	}).setView([lat, long], 13);
	
	
	map.panBy([0, -50], { animate: false });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  L.control
    .zoom({
      position: "bottomleft",
    })
    .addTo(map);

  const customIcon = L.icon({
    iconUrl: "./loc-icon.png",
    iconSize: [46, 56],
    iconAnchor: [23, 56],
  });

  marker = L.marker([lat, long], { icon: customIcon }).addTo(map);
}

function updateMap(lat, long) {
  map.setView([lat, long], 13);
  marker.setLatLng([lat, long]);
}

async function resolveDomain(domain) {
  const res = await fetch(`https://dns.google/resolve?name=${domain}`);
  const data = await res.json();
  return data.Answer[0].data;
}

async function getIP(search = "") {
  let ip = search.trim();

  if (ip) {
    const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);

    if (!isIP) {
      ip = await resolveDomain(ip);
    }

    const res = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await res.json();
    console.log(data);
    const [lat, long] = data.loc.split(",").map(Number);

    output_ip.innerText = data.ip;
    city.innerText = data.city + ",";
    country_and_postal.innerText = data.postal
      ? data.country + " " + data.postal
      : data.country;
    info_time_zone.innerText = getUTCOffset(data.timezone);
    company_name_first_part.innerText = data.org.split(" ")[1];
    company_name_second_part.innerText = data.org.split(" ").slice(2).join(" ");
    if (!map) {
      initMap(lat, long);
    } else {
      updateMap(lat, long);
    }

    return;
  }

  const res = await fetch(`https://ipinfo.io/json`);
  const data = await res.json();
  console.log(data);
  const [lat, long] = data.loc.split(",").map(Number);

  output_ip.innerText = data.ip;
  city.innerText = data.city + ",";
  country_and_postal.innerText = data.postal
    ? data.country + " " + data.postal
    : data.country;
  info_time_zone.innerText = getUTCOffset(data.timezone);
  company_name_first_part.innerText = data.org.split(" ")[1];
  company_name_second_part.innerText = data.org.split(" ").slice(2).join(" ");
  if (!map) {
    initMap(lat, long);
  } else {
    updateMap(lat, long);
  }
}

function getUTCOffset(timeZone) {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  });

  const parts = formatter.formatToParts(now);
  return parts.find((p) => p.type === "timeZoneName").value;
}
