﻿var marker, route, circle, polyline, fillPolygon;
var mapMarkers = [];
var mapCircles = [];

var markers = new L.MarkerClusterGroup({
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: false
});

var myIcon1 = L.icon({
    iconUrl: 'images/employee_icon.png',
    iconSize: [40, 41],
    iconAnchor: [20, 41],
    popupAnchor: [-3, -45],
});

var myIcon2 = L.icon({
    iconUrl: 'images/emp_icon_animated.gif',
    iconSize: [40, 41],
    iconAnchor: [20, 41],
    popupAnchor: [-3, -45],
});

/* pass map parameter, to show function details. */
loadDescription("mapDescription");

// Used to set the default view with position , zoom 
mymap = L.map('mapDiv').setView([21.094, 79.04], 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(mymap);



/**
 function for showing marker on map
 */
function showMarker() {
    loadDescription("AddMarkerDescription");
    marker = L.marker([20.365228, 77.080078], { draggable: true, icon: myIcon1 }).addTo(mymap);
    marker.bindPopup(samplePopup());
    markerEffect(marker);
    this.mapMarkers.push(marker);
}



/**
function to add multiple marker on map with input count
*/
function addMultipleMarker() {
    /* pass map parameter, to show function details. */
    loadDescription("AddMultiMarkersDescription");
    /** Count is here from user input. */
    var count = prompt("Please enter count of marker", "");

    if (count != 0 || count != undefined || count != null) {
        for (var i = 0; i < count; i++) {
            marker = L.marker([21.094 + Math.random(), 79.04 + Math.random()], { icon: myIcon1, draggable: true }).addTo(mymap);
            marker.bindPopup("Sample Popup " + i);
            // Add marker to this.mapMarker for future reference
            this.mapMarkers.push(marker);
            markerEffect(marker);
        }
    }


}

/**
 function to show clusters of markers
 */
function showCluster() {
    /** Count is here from user input. */
    var count = prompt("Please enter marker count to view cluster", "10");
    loadDescription("AddClusterDescription");

    if (count != 0 || count != undefined || count != null) {
        for (var i = 0; i < count; i++) {
            marker = L.marker([21.094 + Math.random(), 77.04 + Math.random()], { icon: myIcon1, draggable: true });
            marker.bindPopup("Sample Popup " + i);
            this.mapMarkers.push(marker);
            markers.addLayer(marker);
            markerEffect(marker);
        }
    }
    mymap.addLayer(markers);
}

markers.on('clusterclick', function (a) {
    var marker = a.layer.getAllChildMarkers()[0];
    var cluster = a.target.getVisibleParent(marker);
    var content = "<div class='cluster'>";
    for (var i = 0; i < a.layer.getAllChildMarkers().length; i++)
        content = content + samplePopup();
    content = content + '</div>';    
    cluster.bindPopup(content).openPopup();
});


/**
 function to add MArker to given lattitude and longitude by user
 */

function addCustomMarker() {
    loadDescription("AddCustomMarkerDescription");
    var lat = prompt("Please enter latitude", "");
    var lang = prompt("Please enter longitude", "");
    marker = L.marker([lat, lang], { draggable: true, icon: myIcon1 }).addTo(mymap);
    marker.bindPopup(samplePopup());
    markerEffect(marker);
    this.mapMarkers.push(marker);
}



/**
 function to show infowindow on marker on click
 */


function openInfowindow() {
    /* pass map parameter, to show function details. */
    loadDescription("OpenInfoWindowDescription");
    marker = L.marker([21.094, 79.04], { icon: myIcon1, draggable: true }).addTo(mymap);
    // Add marker to this.mapMarker for future reference
    this.mapMarkers.push(marker);
    marker.bindPopup(samplePopup());
    markerEffect(marker);
};



/** 
  Add Marker Animation to show on hover marker
*/

function markerAnimation() {
    loadDescription("MarkerAnimationDescription");
    marker = L.marker([20.365228, 77.080078], { draggable: true, icon: myIcon2 }).addTo(mymap);
    markerEffect(marker);
    this.mapMarkers.push(marker);
}



/**
 function to show route draw
 */

function drawRoute() {
    /* pass map parameter, to show function details. */
    if (route != undefined) {
        route.remove();
    }
    loadDescription("DrawRouteDescription");

    // create a red polyline from an array of rotePoint points
    var rotePoint = [[21.110753, 79.070017], [21.111034, 79.068853], [21.111875, 79.066793], [21.112275, 79.064046], [21.113196, 79.060742], [21.113796, 79.058081], [21.113716, 79.055120], [21.113076, 79.052030], [21.112715, 79.050099], [21.113206, 79.045678], [21.114037, 79.043361], [21.116399, 79.037224], [21.118801, 79.038082], [21.119841, 79.038383], [21.120122, 79.040142]];
    route = L.polyline(rotePoint, { color: 'red' }).addTo(mymap);

    for (var i = 0; i < rotePoint.length; i++) {
        marker = L.marker([rotePoint[i][0], rotePoint[i][1]], { icon: myIcon1 }).addTo(mymap);
        marker.bindPopup("Point " + (i + 1));
        this.mapMarkers.push(marker);
    }
}



/*
 * function to draw polygon
 *
 * */

function drawPolygon() {
    if (polyline != undefined) {
        mymap.removeLayer(polyline);
    }
    var latlngs = [[20, 80], [22, 82], [19, 84], [18, 81], [20, 80]];
    polyline = L.polyline(latlngs, { color: 'red' }).addTo(mymap);
    loadDescription("DrawPolygonDescription");
}



/**
 function to draw circle
 */

function drawCircle() {
    loadDescription("DrawCircleDescription");
    var lat = 18 + Math.random() * 10;
    var lang = 75 + Math.random() * 12;
    circle = L.circle([lat, lang], { radius: 20000, color: 'red' }).addTo(mymap);
    marker = L.marker([lat, lang], { icon: myIcon1 }).addTo(mymap);
    this.mapMarkers.push(marker);
    this.mapCircles.push(circle);
}


/**
 function to Reset Map View
 */


function setMapView() {
    loadDescription("ResetMapDescription");
    /*Set to default Boundaries*/
    mymap.setView([21.094, 79.04], 4);
}


/*
 * function to draw Fill polygon draw
 *
 * */


function drawFillPolygon() {
    /* pass map parameter, to show function details. */
    loadDescription("DrawFillPolygonDescription");
    if (fillPolygon != undefined) {
        fillPolygon.remove();
    }
    var latlngs = [[19.145671959749755, 79.08851623535156], [20.145671959749755, 76.08851623535156], [22.145671959749755, 75.08851623535156], [24.145671959749755, 80.08851623535156], [20.145671959749755, 84.08851623535156]];
    fillPolygon = L.polygon(latlngs, { color: '#F13251', fillOpacity: 0.8 }).addTo(mymap);
}



/**
 function to clear Complete Map
 */

function clearMap() {
    /* pass map parameter, to show function details. */
    loadDescription("ClearMapDescription");
    if (marker != undefined) {
        for (var i = 0; i < this.mapMarkers.length; i++) {
            this.mymap.removeLayer(this.mapMarkers[i]);
        }
    }
    if (circle != undefined) {
        for (var i = 0; i < this.mapCircles.length; i++) {
            this.mymap.removeLayer(this.mapCircles[i]);
        }
    }
    if (fillPolygon != undefined) {
        fillPolygon.remove();
    }
    if (polyline != undefined) {
        polyline.remove();
    }
    if (route != undefined) {
        route.remove();
    }
    mymap.removeLayer(markers);
}



/**
 Sample popup will return html.
 */
function samplePopup() {
    var htmlPopup = "<div style='background: #EDEEFC;margin:5px !important;border:1px solid #BBBBBB; padding: 4px;'><div style='height:30px; width:100%'>Sample Popup Header.</div>" +
        "<div style='height:100px; width:100%'>Popup Content goes here.</div>" +
        "<div style='height:30px; width:100%'>Sample normal text of popup with link will goes here.</div></div>"

    return htmlPopup;
}

/**
 This method will be used to apply mouseover and mouseout events to a marker
 */

function markerEffect(marker) {
    marker.on("mouseover", function (event) {
        marker.setIcon(myIcon2);
    });
    marker.on("mouseout", function (event) {
        marker.setIcon(myIcon1);
    });
}


/**
 *  This method will set description to show map functions details.
 * */

function loadDescription(parameter) {
    if (parameter == "mapDescription") {
        newContent = "<h3>Map Loaded</h3>" +
            "<p>This functionality is used to load the map.</p>";
    }
    if (parameter == "AddMarkerDescription") {
        newContent = "<h3>Add Marker</h3>" +
            "<p>This functionality is used to add a marker point</p>";
    }
    if (parameter == "MarkerAnimationDescription") {
        newContent = "<h3>Add Marker Animation</h3>" +
            "<p>This functionality is used to show Animation on marker.</p>";
    }
    if (parameter == "OpenInfoWindowDescription") {
        newContent = "<h3>Open Info Window</h3>" +
            "<p>This functionality is used to Open Info Window.</p>";
    }
    if (parameter == "ClearMapDescription") {
        newContent = "<h3>Clear Map</h3>" +
            "<p>This functionality is used to clear Map</p>";
    }
    if (parameter == "DrawRouteDescription") {
        newContent = "<h3>Route Options</h3>" +
            "<p>This functionality is used to show route between two or more points</p>";
    }
    if (parameter == "DrawPolygonDescription") {
        newContent = "<h3>Polygon Options</h3>" +
            "<p>This functionality is used to draw polygon between multiple points</p>";
    }
    if (parameter == "DrawFillPolygonDescription") {
        newContent = "<h3>Fill Polygon Options</h3>" +
            "<p>This functionality is used to draw polygon between multiple points with fill color.</p>";
    }
    if (parameter == "DrawCircleDescription") {
        newContent = "<h3>Draw Circle</h3>" +
            "<p>This functionality is used to draw circle around a particular point</p>";
    }
    if (parameter == "AddMultiMarkersDescription") {
        newContent = "<h3>Add Multiple Markers</h3>" +
            "<p>This functionality is used to add  multiple markers.</p>";
    }
    if (parameter == "AddCustomMarkerDescription") {
        newContent = "<h3>Custom Marker</h3>" +
            "<p>This functionality is used to add marker on given Latitude & Longitude.</p>";
    }
    if (parameter == "AddClusterDescription") {
        newContent = "<h3>Add Cluster</h3>" +
            "<p>This functionality is used to add Cluster.</p>";
    }
    if (parameter == "ResetMapDescription") {
        newContent = "<h3>Reset Map</h3>" +
            "<p>This functionality is used to Reset Map to the defined Latitude & Longitude.</p>";
    }
    document.getElementById("functionDetails").innerHTML = newContent;
}
