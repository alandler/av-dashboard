var mymap = L.map('mapid').setView([42.3601, -71.0942], 17);

markers = [[42.357413, -71.092688],
            [42.357120, -71.092549],
            [42.360140, -71.094898],
            [42.360838, -71.096035],
            [42.361734, -71.097559],
            [42.362641, -71.098887]
]

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

for (let position of markers){
    console.log("Position: " + position)
    var marker = L.marker([position[0], position[1]]).addTo(mymap).on('click', function(e) {
        console.log(e.latlng)
        window.location = "meta_controller.html";
        // window.open("index.html");
    });;
    
}