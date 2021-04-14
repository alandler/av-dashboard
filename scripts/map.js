// ************** Map variables *****************
markers = [
    [40.771556110430645, -111.88844141447915],
    [40.77157236070192, -111.89110216559557],
    [40.771507359483046, -111.89402040895384],
    [40.771539860118736, -111.89685282153329],//First row
    [40.769362282377635, -111.88837704146597],
    [40.76944353656015, -111.89110216569014],
    [40.76932978067681, -111.89389166292749],
    [40.769329780609894, -111.89683136379954],
    [40.76715213044132, -111.88826975304801],//Second row
    [40.76715213044132, -111.89110216562744],
    [40.767103376262625, -111.89397749354902],
    [40.767119627659504, -111.89685282147059],
    ]

intersectionNames = ["N Temple, 200 W", "N Temple, W Temple","N Temple, Main St","N Temple, 186",
                    "S Temple, 200 W", "S Temple, W Temple","S Temple, Main St","S Temple, 186",
                    "100 S, 200 W", "100 S, W Temple","100 S, Main St","100 S, 186"]

markerIDs = []
for (var i in markers){
    markerIDs.push(i+150)
}

intersectionID = 0
intersectionName = "Utah N, Utah W"

var mymap = L.map('mapid').setView([40.769362282341, -111.89292606763536], 17);

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

for (let i in markers){
    position = markers[i]
    var marker = L.marker([position[0], position[1]]).addTo(mymap).on('click', function(e) {
        console.log(typeof(i))
        intersectionID = 150 + parseInt(i)
        sessionStorage.setItem("intersectionID", intersectionID)
        sessionStorage.setItem("intersectionName", intersectionNames[i])
        window.location = "meta_controller.html";
    });;
    
}