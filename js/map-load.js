/**
 Default body load function, all function and map load will flow from here
 */
bodyLoad();

/** Intialize all variable globally to user res-use variable data */

var map;
var contextMapMenu = null;
var marker = null;
var newContent;
var route,polygon,fillPolygon;
var infoWindowMarker = null;
/*callShowMarker - variable to set add marker functionality on map click*/
var callShowMarker = null;
/** Below function to load map in particular Div */
function bodyLoad()
{
    /* pass map parameter, to show function details. */
    loadDescription("mapDescription");

    var options = {
        //WMS_LINK: "http://wms.teampilot.co/gwc/service/wms",
        WMS_LINK : "http://api.tomtom.com/lbs/map/3/wms/?request=GetMap&version=1.1.1&srs=EPSG%3A4326&width=256&height=256&format=image%2Fpng&layers=basic&styles=+&service=WMS&key=8ek3t697jnd4af75ewxu8v7u",
        minX: "-180.0",
        minY: "-90.0",
        maxX: "180.0",
        maxY: "90.0",
        lat: '21.08409', lon: '79.08449',
        //lat :lat, lon:lon,
        layers: "TA_India_W",
        format: "image/png8",
        mapResolutions: [ 0.2239453125, 0.15197265625, 0.110986328125,0.0999453125, 0.0639453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4, 8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5, 1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6, 1.341104507446289E-6],
        minZoom: 3,
        zoom: 4,
        divId: "mapDiv",
        latitude: 21.145671959749755,
        longitude: 79.08851623535156,
        eventHandlers: {
            right_click: mapRightClickHandler,
            click: mapLeftClickHandler
        }
    };
    map = new Map(options).load();
};

/** When user click left click on map it will fire this function */
function mapLeftClickHandler(latitude, longitude){
    if(callShowMarker == true){
        var marker_options = {
            content     : samplePopup(),
            latitude 	: latitude,
            longitude	: longitude,
            image		: 'images/employee_icon.png',
            width 		:	40,
            height 		:	41,
            draggable	:	true,
            eventHandlers: {
                mouse_over : markerHoverEffect,
                mouse_out  : markerNormalEffect,
                click: function ()
                {
                    closeOpenInfowindow(this,infoWindowMarker);
                    infoWindowMarker = this;
                }
            }
        };
        marker = map.createMarker(marker_options);
       marker.addToMap();
    }
};



/** When user click right click on map it will fire this function */
function mapRightClickHandler(latitude, longitude)
{
    var point = {
        latitude : latitude,
        longitude: longitude
    };
    showMapMenu(point);
    //contextMapMenu.show(latitude,longitude);


};
/**
 function for showing marker on map
 */
function showMarker(){
    /* pass map parameter, to show function details. */
    loadDescription("AddMarkerDescription");
    var pointerArr = [],
        latLon = {
            latitude 	: 21.145671959749755,
            longitude	: 79.08851623535156
        };
    var marker_options = {
        content     : samplePopup(),
        latitude 	: latLon.latitude,
        longitude	: latLon.longitude,
        image		: 'images/employee_icon.png',
        width 		:	40,
        height 		:	41,
        draggable	:	true,
        eventHandlers: {
            mouse_over : markerHoverEffect,
            mouse_out  : markerNormalEffect,
            click: function ()
            {
                closeOpenInfowindow(this,infoWindowMarker);
                infoWindowMarker = this;
            },
            right_click : function(){
                var point = {
                    latitude : latLon.latitude,
                    longitude: latLon.longitude
                };
                showMapMenu(point);
            }

        }
    };
    marker = map.createMarker(marker_options);
    pointerArr.push({lat: marker_options.latitude, lon: marker_options.longitude});
    marker.addToMap();
    /*map.fitToViewPort(pointerArr);*/

};



/*
 * Add Marker Animation to show on hover marker
 *
 * */


function markerAnimation(){
    /* pass map parameter, to show function details. */
    loadDescription("MarkerAnimationDescription");
    var pointerArr = [];
    var marker_options = {
        latitude 	: 21.145671959749755,
        longitude	: 79.08851623535156,
        image		: 'images/emp_icon_animated.gif',
        width 		:	40,
        height 		:	41,
        draggable	:	true,
        eventHandlers: {
            mouse_over : markerHoverEffect,
            mouse_out  : markerNormalEffect
        }
    };
    marker = map.createMarker(marker_options);
    pointerArr.push({lat: marker_options.latitude, lon: marker_options.longitude});
    marker.addToMap();
    map.fitToViewPort(pointerArr);
};


function markerHoverEffect(){
    var properties = {};
    properties[Marker.IMAGE] = "images/emp_icon_animated.gif";
    this.updateOptions(properties);

};
function markerNormalEffect(){
    var properties = {};
    properties[Marker.IMAGE] = "images/employee_icon.png";
    this.updateOptions(properties);

};

/**
 function to show infowindow on marker on click
 */
function openInfowindow(){
    /* pass map parameter, to show function details. */
    loadDescription("OpenInfoWindowDescription");
    var pointerArr = [];
    var marker_options = {
        content		:	samplePopup(),
        latitude 	: 22.145671959749755,
        longitude	: 79.08851623535156,
        image		: 'images/employee_icon.png',
        width 		:	40,
        height 		:	41,
        draggable	:	true,
        eventHandlers: {
            click: function ()
            {
                closeOpenInfowindow(this,infoWindowMarker);
                infoWindowMarker = this;
            },
            drag_end : function(){

            },
        }
    };
    marker = map.createMarker(marker_options);
    pointerArr.push({lat: marker_options.latitude, lon: marker_options.longitude});
    marker.addToMap();
    map.fitToViewPort(pointerArr);
};

/**
 function to clear Complete Map
 */

function clearMap(){
    /* pass map parameter, to show function details. */
    loadDescription("ClearMapDescription");
    var pointerArr = [];
    pointerArr.push({lat: 21.145671959749755,lon: 79.08851623535156});
    map.fitToViewPort(pointerArr);
    map.setZoomLevel(4);
    map.clear();
    if(route != undefined){
        route.remove();
    }
    if(polygon != undefined){
       polygon.remove();
    }
    if(fillPolygon != undefined){
        fillPolygon.remove();
    }
    if(contextMapMenu != undefined) {
        contextMapMenu.remove();
    }
    if(marker_cluster != undefined && marker_cluster != ""){
        marker_cluster.clearMarkers();
    }

}


/**
 function to show route draw
 */

function drawRoute(){
    /* pass map parameter, to show function details. */
    if(route != undefined){
        route.remove();
    }
    loadDescription("DrawRouteDescription");
    var  pointerArr=[];

    /*rotePoint Array is for - route geometry lat & long */
   var rotePoint = [[ 21.110753, 79.070017],[21.111034, 79.068853], [21.111875, 79.066793], [21.112275, 79.064046], [21.113196, 79.060742], [21.113796, 79.058081], [21.113716, 79.055120], [21.113076, 79.052030], [21.112715, 79.050099],[21.113206, 79.045678], [21.114037, 79.043361],[21.116399, 79.037224], [21.118801, 79.038082], [21.119841, 79.038383], [21.120122, 79.040142]];
    var rotePointArray = [];
    for(var i = 0; i < rotePoint.length; i++) {
        for(var j = 0; j < rotePoint[i].length; j++) {
            rotePointArray[i] = [{
                content		: "Point"+i,
                latitude 	: rotePoint[i][0],
                longitude	: rotePoint[i][1],
                width		:40,
                height		:41,
                draggable	:true,
                image		: 'images/employee_icon.png', // null = default icon
                eventHandlers: {
                    click: function ()
                    {
                        closeOpenInfowindow(this,infoWindowMarker);
                        infoWindowMarker = this;
                    }
                }

            }];
        }
    }
    var routePoints = [];

    for(var i = 0; i < rotePointArray.length; i++) {
        var routePoint = map.createMarker(rotePointArray[i][0]);
        routePoint.addToMap();
        routePoints.push({ latitude :  rotePointArray[i][0].latitude, longitude : rotePointArray[i][0].longitude});
    }


    var polyOptions = {
        strokeColor: '#BF092B',
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: map
    };

    route =	map.createRoute(routePoints,polyOptions);

    route.addToMap();
    /*Zooming to particular area*/
    for(var i = 0; i < rotePointArray.length; i++) {
        pointerArr.push({ lat :  rotePointArray[i][0].latitude, lon : rotePointArray[i][0].longitude});
    }
    map.fitToViewPort(pointerArr);
}



/*
 * function to draw polygon
 *
 * */

function drawPolygon(){

    if(polygon != undefined){
        polygon.remove();
    }
    /*pass map parameter, to show function details.*/
    loadDescription("DrawPolygonDescription");
    var pointerArr=[];
    var polygonPointArray = [];
    /* polygonPoint Array is for lat & long of boundary points*/
    var polygonPoint = [[21.145800, 79.11], [21.120785, 79.0666], [21.112275, 79.064046], [21.130785, 79.147658]];
    var endPointsArray = [];
    for(var i = 0; i < polygonPoint.length; i++) {
        for(var j = 0; j < polygonPoint[i].length; j++) {
            polygonPointArray[i] = [{
                latitude 	: polygonPoint[i][0],
                longitude	: polygonPoint[i][1]

            }];

        }
    }
    for(var i = 0; i < polygonPointArray.length; i++) {
        endPointsArray.push({ latitude :  polygonPointArray[i][0].latitude, longitude : polygonPointArray[i][0].longitude});
    }
    /*To Join the polygon End to the start point */
    endPointsArray.push({ latitude :  polygonPointArray[0][0].latitude, longitude : polygonPointArray[0][0].longitude});



    var polyOptions = {
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map
    };

    polygon =	map.createRoute(endPointsArray,polyOptions);
    polygon.addToMap();

    /*Zooming to particular area*/
    for(var i = 0; i < polygonPointArray.length; i++) {
        pointerArr.push({ lat :  polygonPointArray[i][0].latitude, lon : polygonPointArray[i][0].longitude});
    }
    map.fitToViewPort(pointerArr);
}

/*
 * function to draw Fill polygon draw
 *
 * */


function drawFillPolygon(){
    /* pass map parameter, to show function details. */
    loadDescription("DrawFillPolygonDescription");
    if(fillPolygon != undefined){
        fillPolygon.remove();
    }
    var pointerArr=[];
    var polygonPointArray = [];
    /* polygonPoint Array is for lat & long of boundary points*/
    var polygonPoint = [[19.145671959749755, 79.08851623535156], [20.145671959749755, 76.08851623535156], [22.145671959749755, 75.08851623535156], [24.145671959749755, 80.08851623535156], [20.145671959749755, 84.08851623535156]];
    var endPointsArray = [];
    for(var i = 0; i < polygonPoint.length; i++) {
        for(var j = 0; j < polygonPoint[i].length; j++) {
            polygonPointArray[i] = [{
                latitude 	: polygonPoint[i][0],
                longitude	: polygonPoint[i][1]

            }];

        }
    }
    for(var i = 0; i < polygonPointArray.length; i++) {
        endPointsArray.push({ latitude :  polygonPointArray[i][0].latitude, longitude : polygonPointArray[i][0].longitude});
    }
    /*To Join the polygon End to the start point */
    endPointsArray.push({ latitude :  polygonPointArray[0][0].latitude, longitude : polygonPointArray[0][0].longitude});



    var polyOptions = {
        strokeColor: '#F13251',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        fillColor :'#F13251',
        fillOpacity : 0.8,
        map :map
    };


    fillPolygon =	map.createFillPolygon(endPointsArray,polyOptions);
    fillPolygon.addToMap();

    /*Zooming to particular area*/
    for(var i = 0; i < polygonPointArray.length; i++) {
        pointerArr.push({ lat :  polygonPointArray[i][0].latitude, lon : polygonPointArray[i][0].longitude});
    }
    map.fitToViewPort(pointerArr);
}

/**
 function to draw circle
 */

function drawCircle(){
    /* pass map parameter, to show function details. */
    loadDescription("DrawCircleDescription");
    var CenterPoint = {
        width       :40,
        height      :41,
        image		: 'images/employee_icon.png', // null = default icon
        latitude 	: 21.145671959749755  + Math.random()*20,
        longitude	: 80.08851623535156  + Math.random() *15,
        /* circleOptions - only for open layers*/
        circleOptions :{
            radius: 8
        }

    };

    var circleStyleOptions = {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FFEA3D',
        fillOpacity:0.6,
        map: map,
        latitude 	: 21.145671959749755  + Math.random()*20,
        longitude	: 80.08851623535156  + Math.random() *15,
        radius: 8,
        visible :true
    };


    var pointerArr=[];
    var marker = map.createMarker(CenterPoint);
    marker.setCircleOptions(circleStyleOptions);

    marker.showCircle(); //To show circle
    marker.addToMap(); //To show Marker
    /*Zooming to particular area*/
    pointerArr.push({lat: CenterPoint.latitude, lon: CenterPoint.longitude});
    map.fitToViewPort(pointerArr);
}


/**
 function to add multiple marker on map with input count
 */
function addMultipleMarker(){
    /* pass map parameter, to show function details. */
    loadDescription("AddMultiMarkersDescription");
    /** Count is here from user input. */
    var count = prompt("Please enter count of marker", "");
    var pointerArr = [];

    if(count != 0 || count != undefined || count != null){
        for (var i =0; i < count; i++){
            var marker_options = null,marker = null;
            marker_options = {
                content		:	'Sample Content ' + i,
                latitude 	: 21.145671959749755 + Math.random(),
                longitude	: 79.08851623535156 + Math.random(),
                image		: 'images/employee_icon.png',
                width 		:	40,
                height 		:	41,
                draggable	:	true,
                eventHandlers	:	{
                    click: function ()
                    {
                        closeOpenInfowindow(this,infoWindowMarker);
                        infoWindowMarker = this;
                    },
                    mouse_over : markerHoverEffect,
                    mouse_out  : markerNormalEffect
                }

            };
            marker = map.createMarker(marker_options);
            marker.addToMap();
            pointerArr.push({lat: marker_options.latitude, lon: marker_options.longitude});
        }
    }
    map.fitToViewPort(pointerArr);
}


function closeOpenInfowindow(marker,infoWindowMarker){
    if(infoWindowMarker != null){
        infoWindowMarker.closeInfoWindow();
        marker.openInfoWindow(marker.infoWindow.content);
    }else{
        marker.openInfoWindow(marker.infoWindow.content);
    }
}

/**
 function to add MArker to given lattitude and longitude by user
 */

function addCustomMarker(){
    /* pass map parameter, to show function details. */
    loadDescription("AddCustomMarkerDescription");
    var lat = prompt("Please enter latitude", "");
    var lang = prompt("Please enter longitude", "");
    var pointerArr = [];

    var marker_options,marker;

    marker_options = {
        content		:	samplePopup(),
        latitude 	: lat,
        longitude	: lang,
        image		: 'images/employee_icon.png',
        width 		:	40,
        height 		:	41,
        draggable	:	true,
        eventHandlers	:	{
            click: function ()
            {
                closeOpenInfowindow(this,infoWindowMarker);
                infoWindowMarker = this;
            }
        }

    };
    marker = map.createMarker(marker_options);
    marker.addToMap();
    pointerArr.push({lat: marker_options.latitude, lon: marker_options.longitude});
    map.fitToViewPort(pointerArr);
}

/**
 function to Reset Map View
 */

function setMapView(){
    /* pass map parameter, to show function details. */
    loadDescription("ResetMapDescription");
    /*Set to default Boundaries*/
    var pointerArr = [];
    pointerArr.push({lat: 21.145671959749755,lon: 79.08851623535156});
    map.fitToViewPort(pointerArr);
    map.setZoomLevel(4);
}

/**
 Showing cluster on map count
 */

function showCluster(){
    /** Count is here from user input. */
    var count = prompt("Please enter marker count to view cluster", "10");
    /* pass map parameter, to show function details. */
    loadDescription("AddClusterDescription");
    var pointerArr = [];
    var markers = [];
    initMarkerCluster();


    if(count != 0 || count != undefined || count != null){
        for (var i =0; i < count; i++){
            var marker_options = null,marker = null;
            marker_options = {
                content		:	samplePopup(),
                latitude 	: 21.145671959749755 + Math.random(),
                longitude	: 79.08851623535156 + Math.random(),
                image		: 'images/employee_icon.png',
                width 		:	40,
                height 		:	41,
                draggable	:	true,
                eventHandlers	:	{
                    click: function ()
                    {
                        closeOpenInfowindow(this,infoWindowMarker);
                        infoWindowMarker = this;
                    }
                }

            };
            marker = map.createMarker(marker_options);
            var content = marker.infoWindow;
            //var content = marker.infoWindow.contentHTML;
            //var content = marker.infoWindow.getContent();
            marker.marker.content = content;
            marker_cluster.addMarker(marker.marker, false);
            marker.addToMap();
            pointerArr.push({lat: marker_options.latitude, lon: marker_options.longitude});

        }
    }
    map.fitToViewPort(pointerArr);
    map.setZoomLevel(6);
}

/**
 Sample popup will return html.
 */

function samplePopup(){
    var htmlPopup = "<div style='height:30px; width:100%'>Sample Popup Header.</div>"+
        "<div style='height:100px; width:100%'>Popup Content goes here.</div>"+
        "<div style='height:30px; width:100%'>Sample normal text of popup with link will goes here.</div>"

    return htmlPopup;

}

/** Below code is used for cluster to show while creating markers */
var marker_cluster = '' ;

function initMarkerCluster(){
    marker_cluster = this.marker_cluster = new MarkerClusterer(map.map, [], {
        gridSize          : 25,
        minimumClusterSize: 2,
        maxZoom           : 21,
        imagePath         : "images/m",
        imageExtension    : "png",
        zoomOnClick       : false,
        averageCenter     : false
    });
}

/*
 * Add Context Menu on Right click on Map
 *
 * */
function showMapMenu(point)
{
    var clickedMarker = point;
    var menuWidth = 175;
    var menuHeight = 100;
    var latitude = clickedMarker.latitude;
    var longitude = clickedMarker.longitude;
    var liW = 160;
    var ulW = liW + 10;
    var divW = ulW + 4;
    var contextMenuHTML = {
       html: "<div style='background-color:#FFF;position:relative;'><ul id='context_menu' style='width:"
        + ulW + "px;'><li>"
        + "<a href='#' onclick='fireShowClosestEmployee("
        + latitude + "," + longitude + "," + null
        + ")' style='border-bottom: 1px dashed grey; width:" + liW
        + "px'>Get the Closest Team Member</a>"
        + "</li><li><a href='#' onclick='fireShowAllEmployee("
        + latitude + "," + longitude
        + ")' style='border-bottom: 1px dashed grey; width:" + liW
        + "px' >Show All Team Members</a></li>"
        + "</li><li><a href='#' onclick='clearMap()' style='width:" + liW + "px' >Clear Map</a></li>"
        + "</ul></div>"

    };
    width = divW;
    height = 78;

    if (contextMapMenu)
    {
        contextMapMenu.remove();
    }

    setMapContextMenu(point, contextMenuHTML, width, height);
    contextMapMenu = map.addContextMenu(contextMenuHTML);
    contextMapMenu.show(latitude, longitude);

}

/**
 * This method is used to get context menu styles.
 * @param point return point with lat long
 * @param contextMenuHTML context menu html div popup
 * @param width return width of context menu
 * @param height return height of context menu
 */


function setMapContextMenu(point, contextMenuHTML, width, height)
{
    var contextMenuOpt = new ContextMenuOptions();
}

function ContextMenuOptions()
{
    this.styleClassName = "";
    this.itemNames= [];
    this.itemCallbacks = [];
}
ContextMenuOptions.prototype.getStyleClassName = function()
{
    return this.styleClassName;
}
ContextMenuOptions.prototype.setStyleClassName = function(styleClassName)
{
    this.styleClassName = styleClassName;
}
ContextMenuOptions.prototype.getItemNames = function()
{
    return this.itemNames;
}
ContextMenuOptions.prototype.setItemNames = function(itemNames)
{
    this.itemNames = itemNames;
}
ContextMenuOptions.prototype.getItemCallbacks = function()
{
    return this.itemCallbacks;
}
ContextMenuOptions.prototype.setItemCallbacks = function(itemCallbacks)
{
    this.itemCallbacks = itemCallbacks;
}



/**
 *  This method will set description to show map functions details.
 * */

function loadDescription(parameter){
    callShowMarker = false;
    if(parameter == "mapDescription" ){
        newContent = "<h3>Map Loaded</h3>" +
            "<p>This functionality is used to load the map.</p>";
    }
    if(parameter == "AddMarkerDescription"){
        callShowMarker = true;
        newContent = "<h3>Add Marker</h3>" +
        "<p>This functionality is used to add a marker point</p>";
    }
    if(parameter == "MarkerAnimationDescription"){
        newContent = "<h3>Add Marker Animation</h3>" +
        "<p>This functionality is used to show Animation on marker.</p>";
    }
    if(parameter == "OpenInfoWindowDescription"){
        newContent = "<h3>Open Info Window</h3>" +
        "<p>This functionality is used to Open Info Window.</p>";
    }
    if(parameter == "ClearMapDescription"){
        newContent = "<h3>Clear Map</h3>" +
        "<p>This functionality is used to clear Map</p>";
    }
    if(parameter == "DrawRouteDescription"){
        newContent = "<h3>Route Options</h3>" +
        "<p>This functionality is used to show route between two or more points</p>";
    }
    if(parameter == "DrawPolygonDescription"){
        newContent = "<h3>Polygon Options</h3>" +
        "<p>This functionality is used to draw polygon between multiple points</p>";
    }
    if(parameter == "DrawFillPolygonDescription"){
        newContent = "<h3>Fill Polygon Options</h3>" +
        "<p>This functionality is used to draw polygon between multiple points with fill color.</p>";
    }
    if(parameter == "DrawCircleDescription"){
        newContent = "<h3>Draw Circle</h3>" +
        "<p>This functionality is used to draw circle around a particular point</p>";
    }
    if(parameter == "AddMultiMarkersDescription"){
        newContent = "<h3>Add Multiple Markers</h3>" +
        "<p>This functionality is used to add  multiple markers.</p>";
    }
    if(parameter == "AddCustomMarkerDescription"){
        newContent = "<h3>Custom Marker</h3>" +
        "<p>This functionality is used to add marker on given Latitude & Longitude.</p>";
    }
    if(parameter == "AddClusterDescription"){
        newContent = "<h3>Add Cluster</h3>" +
        "<p>This functionality is used to add Cluster.</p>";
    }
    if(parameter =="ResetMapDescription"){
        newContent = "<h3>Reset Map</h3>" +
        "<p>This functionality is used to Reset Map to the defined Latitude & Longitude.</p>";
    }
    document.getElementById("functionDetails").innerHTML =  newContent;
}


