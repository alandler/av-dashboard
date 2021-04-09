var mymap = L.map('mapid').setView([42.3601, -71.0942], 17);

mapbox_token = "pk.eyJ1IjoiYWxhbmRsZXIiLCJhIjoiY2tidjU1a3duMDJwajJ5bnhyYnZoMWgwdCJ9.wf5Fpih6PEVLN-LW_uAY_A"
z = "512"
y = "1"
x = "1"

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: mapbox_token
}).addTo(mymap);