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
    // console.log("Position: " + position)
    position = markers[i]
    var marker = L.marker([position[0], position[1]]).addTo(mymap).on('click', function(e) {
        console.log(typeof(i))
        intersectionID = 150 + parseInt(i)
        sessionStorage.setItem("intersectionID", intersectionID)
        sessionStorage.setItem("intersectionName", intersectionNames[i])
        console.log("Intersection " + (intersectionID) + ": " + intersectionNames[i])
        window.location = "meta_controller.html";
        // window.open("index.html");
    });;
    
}