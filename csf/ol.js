function Map(options) {
    this.overlays = {};
    this.index = 0;
    this.div = document.getElementById(options.divId);
    this.options = options;
    this.eventListeners = {};
}

// Constants used to Handle the click events on map/marker and Layers

Map.LEFT_CLICK_EVENT = "click";
Map.DOUBLE_CLICK_EVENT = "dblclick";
Map.RIGHT_CLICK_EVENT = "rightclick";

// This function is used to load the map with mapOptions.
// load Layers

Map.prototype.load = function () {
    var options = this.options,
        bounds = new OpenLayers.Bounds(
            options.minX, options.minY,
            options.maxX, options.maxY
        ),
        position = new OpenLayers.LonLat(options.longitude, options.latitude),
        zoom = options.zoom || options.minZoom || 0;
    this.myNavControl = new OpenLayers.Control.Navigation({handleRightClicks: true});
    this.map = new OpenLayers.Map({
        div: this.div,
        projection: new OpenLayers.Projection("EPSG:4326"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        resolutions: options.mapResolutions,
        maxResolution: options.mapResolutions[0],
        maxExtent: bounds,
        units: "m",
        controls: [this.myNavControl,
            new OpenLayers.Control.PanZoomBar()]
    });

    this.mapLayer = (new OpenLayers.Layer.WMS(
        "Geoserver layers - Untiled", options.WMS_LINK,
        {
            width: "512",
            height: "512",
            layers: options.layers, // layer name
            styles: '',
            crs: '4326',
            format: options.format,
            tiled: 'true',
            tilesOrigin: options.longitude + "," + options.latitude
        }, {transitionEffect: 'resize'},
        {buffer: 0}
    ));
    this.lineLayer = new OpenLayers.Layer.Vector("LineLayer");
    this.circleLayer = new OpenLayers.Layer.Vector("CircleLayer");
    this.markerLayer = new OpenLayers.Layer.Markers("MarkerLayer");

    this.map.addLayers([this.mapLayer, this.lineLayer, this.circleLayer, this.markerLayer]);
    this.map.setCenter(position, zoom);
    var eventHandlers = options.eventHandlers || {};
    this._addEventHandler(this.map, Map.LEFT_CLICK_EVENT, eventHandlers.click, this);
    this._addEventHandler(this.map, Map.RIGHT_CLICK_EVENT, eventHandlers.right_click, this);
    this.markerObjectArray = new Array();
    this.circleObjectArray = new Array();
    this.infoWindowObjectArray = new Array();
    this.enableContextMenuPopup = true;
    this.contextMenuPopup = null; // hold the contextMenuPopup object
    this.route;
    this.routeArray = new Array();
    this.shapeLayer = new OpenLayers.Layer.Vector("Shape Vectors");
    this.map.addLayer(this.shapeLayer);
    this.markerLayer = new OpenLayers.Layer.Markers("My Marker Layer");
    this.map.addLayer(this.markerLayer);

    this.map.setCenter(new OpenLayers.LonLat(options.lon, options.lat), options.zoom);

    delete  this.div;
    delete  this.options;
    return this;
};

eventMarkerOver = function () {
    this.map.div.style.cursor = "pointer";
};
eventMarkerOut = function () {
    this.map.div.style.cursor = "default";
};
Map.prototype.addEventHandler = function (event, handler) {
    this._addEventHandler(this.map, event, handler, this);
};

// Add event handlers to handle the events

Map.prototype._addEventHandler = function (target, event, handler, context) {

    if (handler) {
        var map = this.map;
        if (event == Map.RIGHT_CLICK_EVENT) {
            this.myNavControl.handlers.click.callbacks.rightclick = function (event) {
                var location = map.getLonLatFromViewPortPx(event.xy),
                    latitude = location.lat,
                    longitude = location.lon;
                handler.call(context, latitude, longitude, event);
            }
        }
        else {
            target.events.register(event, target, function (event) {

                var location = map.getLonLatFromViewPortPx(event.xy),
                    latitude = location ? location.lat : null,
                    longitude = location ? location.lon : null;
                handler.call(context, latitude, longitude, event);
            });
        }
    }
};

// Release event handlers.

Map.prototype.removeEventHandler = function (event) {

    event == "rightclick" ? this.myNavControl.handlers.click.callbacks.rightclick = false :
        this.map.events.remove(event);
    return this;
};

//This method will create the markers and associated PopUp.

Map.prototype.createMarker = function (options) {

    var offset = options.offset || {x: -options.width / 2, y: -options.height},
        size = new OpenLayers.Size(options.width, options.height);

    offset = new OpenLayers.Pixel(offset.x, offset.y);
    options.icon = new OpenLayers.Icon(options.image, size, offset);
    options.position = new OpenLayers.LonLat(options.longitude, options.latitude);
    options.marker = new OpenLayers.Marker(options.position, options.icon);

    options.marker.events.register("mouseover", options.marker, eventMarkerOver);
    options.marker.events.register("mouseout", options.marker, eventMarkerOut);
    options.map = this;

    return new Marker(options);
};

// This method creates marker objects and registers events for markers.
function Marker() {
    if (arguments.length == 1) {
        var options = arguments[0];
        var marker = this.marker = options.marker,
            map_wrapper = this.map_wrapper = options.map,
            eventHandlers = options.eventHandlers || {},
            position = this.position = options.position,
            infoWindow = null,
            content = options.content || "";
        if (typeof content == "string") {
            this.infoWindow = new OpenLayers.Popup.FramedCloud("infoWindow", options.position, null, content, null, true,
                eventHandlers.close_click ? eventHandlers.close_click : null);
        }
        else {
            infoWindow = this.infoWindow = new OpenLayers.Popup.FramedCloud("infoWindow", options.position, null, null, null, true, function () {
                this.hide();
                eventHandlers.close_click ? eventHandlers.close_click() : null;
            });
            infoWindow.contentDiv.appendChild(content);
            infoWindow.updateSize();
        }
        var origin = {x: position.lon, y: position.lat},
            sides = 60,
            rotation = 0;
        if (options.circleOptions) {
            var circle = createCircle(origin, options.circleOptions.radius, sides, rotation);
            this.circleFeature = new OpenLayers.Feature.Vector(circle, null, this._createCircleOptions(options.circleOptions));
        }
        this.map = map_wrapper.map;
        this.eventListeners = {};

        this.addEventListener(marker, "click", eventHandlers.click, this);
        this.addEventListener(marker, "rightclick", eventHandlers.right_click, this);




        map_wrapper._addEventHandler(marker, "dblclick", eventHandlers.double_click, this);
        map_wrapper._addEventHandler(marker, "dragend", eventHandlers.drag_end, this);
        map_wrapper._addEventHandler(marker, "mouseout", eventHandlers.mouse_out, this);
        map_wrapper._addEventHandler(marker, "mouseover", eventHandlers.mouse_over, this);
    }
    else {
        var point = arguments[0];
        var markerOptions = arguments[1];
        this.OLMarker = null;
        this.lgMap;
        this.point = point;
        this.markerOptions = markerOptions;

        if (point != null || point != undefined) {

            var iconURL = this.markerOptions.getImageURL();
            var iconSize = new OpenLayers.Size(this.markerOptions.getWidth(), this.markerOptions.getHeight());
            var iconOffset = new OpenLayers.Pixel(-(this.markerOptions.getAnchorX()), -(this.markerOptions.getAnchorY()));

            markerIcon = new OpenLayers.Icon(iconURL, iconSize, iconOffset);
            markerIcon.image = this.markerOptions.getImageURL();
            markerIcon.iconAnchor = new OpenLayers.Pixel(this.markerOptions.getAnchorX(), this.markerOptions.getAnchorY());
            markerIcon.infoWindowAnchor = new OpenLayers.Pixel(this.markerOptions.getAnchorX(), this.markerOptions.getAnchorY());
            markerIcon.radius = this.markerOptions.getRadius();
            var point = new OpenLayers.LonLat(point.getLongitude(), point.getLatitude());
            this.OLMarker = new OpenLayers.Marker(point, markerIcon);
        }
    }
}

Marker.OPTIMIZED = "optimized";
Marker.IMAGE = "image";
Marker.LOCATION = "location";
Marker.SIZE = "size";

Marker.prototype.setLgMap = function (lgMap) {
    this.lgMap = lgMap;
};
Marker.prototype.getLgMap = function () {
    return this.lgMap;
};
Marker.prototype.getPoint = function () {
    return this.point;
};

Marker.prototype.getMarkerOptions = function () {
    return this.markerOptions;
};

Marker.prototype.openInfoWindowHTML = function (HTMLContent, closeBox) {
    if (this.getLgMap() != null) {
        this.markerInfoPopup = new InfoWindow(this.getPoint(), HTMLContent, closeBox);
        this.getLgMap().addInfoWindow(this.markerInfoPopup);
    }
};

Marker.prototype.closeInfoWindowHTML = function () {
    if (this.getLgMap() != null) {
        this.getLgMap().removeInfoWindow(this.markerInfoPopup);
    }
};
Marker.prototype.getMarker = function () {
    return this.OLMarker;
};

Marker.prototype.addEventListener = function (target, event, handler, context) {
    var map = this.map;
    if (handler) {
        if (event == "click" || event == "mouseover" || event == "mouseout") {
            this.marker.events.register(event, target, function (evt) {
                var location = map.getLonLatFromViewPortPx(evt.xy),
                    latitude = location ? location.lat : null,
                    longitude = location ? location.lon : null;

                handler.call(context, latitude, longitude, event);
            }.bind(this));
        }

        if (event == "rightclick") {
            this.marker.events.register("mousedown", target, function (evt) {
                if (OpenLayers.Event.isRightClick(evt)) {
                    var location = map.getLonLatFromViewPortPx(evt.xy),
                        latitude = location ? location.lat : null,
                        longitude = location ? location.lon : null;

                    handler.call(context, latitude, longitude, event);
                }
            }.bind(this));
        }
    }
};

Marker.prototype.removeEventHandler = function (event) {

    this.marker.events.remove(event);
    return this;
};

//Add created Markers to the map.

Marker.prototype.addToMap = function () {
    this.map_wrapper.markerLayer.addMarker(this.marker);
    this.marker.display(true);
    this.map_wrapper._addOverlay(this);
    return this;
};

//release the created markers and infowindow.

Marker.prototype.remove = function () {
    var infoWindow = this.infoWindow;
    this.map_wrapper.markerLayer.removeMarker(this.marker);
    if (this.circleFeature) {
        this.map_wrapper.circleLayer.removeFeatures([this.circleFeature]);
    }
    this.map_wrapper.map.removePopup(infoWindow);
    this.map_wrapper._removeOverlay(this);
    return this;
};

Marker.prototype.zoomHere = function () {
    var bounds = new OpenLayers.Bounds(),
        position = this.position;
    bounds.extend(position);
    this.map_wrapper._fitBounds(bounds);
    this.map_wrapper._panTo(position);
    return this;
};

Marker.prototype.getPosition = function () {
    var position = this.position;
    return {longitude: position.lon, latitude: position.lat};
};

// Open InfoWindow for markers.

Marker.prototype.openInfoWindow = function (content) {

    while (this.map.popups.length > 0) {
        this.map.removePopup(this.map.popups[0]);
    }

    var infoWindow = this.infoWindow;
    if (content) {
        infoWindow.setContentHTML(content);
    }

    this.map_wrapper.map.addPopup(infoWindow, false);
    infoWindow.show();
    return this;
};

// Close InfoWindow of markers.

Marker.prototype.closeInfoWindow = function () {

    this.map_wrapper.map.removePopup(this.infoWindow);
    return this;
};

// Changes Marker image Url path.

Marker.prototype.updateOptions = function (properties) {

    var image_key = Marker.IMAGE,
        location_key = Marker.LOCATION,
        marker = this.marker,
        optimized = Marker.OPTIMIZED;
    if (image_key in properties) {
        marker.setUrl(properties[image_key]);
    }
    if (location_key in properties) {
        var object = properties[location_key];
    }
};

Marker.prototype.setCircleOptions = function (options) {
    this.circleFeature.style = this._createCircleOptions(options);
    this.map_wrapper.circleLayer.redraw();
    return this;
};

Marker.prototype.showCircle = function () {

    this.map_wrapper.circleLayer.addFeatures([this.circleFeature]);
    return this;
};

Marker.prototype.hideCircle = function () {

    this.map_wrapper.circleLayer.removeFeatures([this.circleFeature]);
    return this;
};

Marker.prototype._createCircleOptions = function (options) {

    return {
        strokeColor: options.strokeColor,
        strokeOpacity: options.strokeOpacity,
        strokeWeight: options.strokeWeight,
        fillColor: options.fillColor,
        fillOpacity: options.fillOpacity
    };
};

Marker.prototype.click = function () {
    this.marker.events.triggerEvent(Map.LEFT_CLICK_EVENT, this.marker);
};

Map.prototype.addMarker = function (marker) {
    this.setLgMarker(marker);
    marker.setLgMap(this);
    var myMarker = marker.getMarker();
    this.markerObjectArray.push(myMarker);
    this.setMarkerObjectArray(this.markerObjectArray);
    this.markerLayer.setVisibility(true);
    /** *add this marker to map */
    this.map.raiseLayer(this.markerLayer, this.map.getNumLayers());// for
    // mozilla
    this.markerLayer.addMarker(myMarker);
    // draw circle around marker
    var circleObj = new Circle(marker.getPoint(), marker.getMarkerOptions().getRadius(), new CircleOptions());
    this.addCircle(circleObj);
};

Map.prototype.setLgMarker = function (lgmarker) {
    this.lgmarker = lgmarker;
};
Map.prototype.getLgMarker = function () {
    return this.lgmarker;
};

Map.prototype.addContextMenu = function (options) {
    options.map = this;
    return this.contextMenu = new ContextMenu(options);
};

//Set map to center
Map.prototype.setCenter = function (latitude, longitude, zoomLevel) {
    var mapCenter = new OpenLayers.LonLat(longitude, latitude);
    this.map.setCenter(mapCenter, zoomLevel);
    return this;
};

// Pan map to specified location.
Map.prototype._panTo = function (position) {
    this.map.panTo(position);
    return this;
};

Map.prototype.panTo = function (latitude, longitude) {
    var panlatLon = new OpenLayers.LonLat(longitude, latitude);
    this.map.panTo(panlatLon);
    return this;
};

//Set map zoom level

Map.prototype.setZoomLevel = function (zoomLevel) {
    this.map.zoomTo(zoomLevel);
    return this;
};

//Get map current zoom level

Map.prototype.getZoomLevel = function () {
    return this.map.getZoom();
};

//Display all marker within view port
Map.prototype.fitToViewPort = function (points) {
    var bounds = new OpenLayers.Bounds();
    for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        bounds.extend(new OpenLayers.LonLat(point.longitude, point.latitude));
    }
    this._fitBounds(bounds);
    return this;
};

Map.prototype._addOverlay = function (overlay) {
    var index = this.index++;
    overlay.index = index;
    this.overlays[index] = overlay;
};
Map.prototype._removeOverlay = function (overlay) {
    delete this.overlays[overlay.index];
};

//Clear everything from map

Map.prototype.clear = function () {
    var overlays = this.overlays;
    for (var key in overlays) {
        overlays[key].remove();
        delete overlays[key];
    }
    return this;
};

//contextMenu
function ContextMenu(options) {
    this.map_wrapper = options.map;
    this.position = new OpenLayers.LonLat(options.longitude, options.latitude);
    var contextMenuPopup = this.contextMenuPopup = new OpenLayers.Popup("LocationGuru", null, null, options.html, null, false);
    // TODO every ContextMenu object should be able to be added independently
    contextMenuPopup.autoSize = true;
    contextMenuPopup.panMapIfOutOfView = false;

}

// TODO verify if implementation is needed
ContextMenu.prototype.draw = function () {

};

// TODO implement this

ContextMenu.prototype.remove = function () {
    // TODO implement this properly
    this.map_wrapper.map.removePopup(this.contextMenuPopup);
};

ContextMenu.prototype.hide = function () {
    this.map_wrapper.map.removePopup(this.contextMenuPopup);
    return this;
};

// TODO why latitude longitude is not used? .. Done
ContextMenu.prototype.show = function (latitude, logitude) {
    this.contextMenuPopup.lonlat = logitude && latitude ? new OpenLayers.LonLat(logitude, latitude) : this.position;
    this.map_wrapper.map.addPopup(this.contextMenuPopup, false);
    this.contextMenuPopup.show();
    return this;
};

// Create Route on map.

Map.prototype.createRoute = function (points, options) {
    var routePoints = [];
    for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        routePoints.push(new OpenLayers.Geometry.Point(point.longitude, point.latitude));
    }
    var line = new OpenLayers.Geometry.LineString(routePoints);
    options.polyLine = new OpenLayers.Feature.Vector(line, null, options);
    options.map = this;
    return new Route(options);
};

// Route create options.

function Route(options) {
    this.map_wrapper = options.map;
    this.polyLine = options.polyLine;

}

// Add Route to Map.

Route.prototype.addToMap = function () {
    this.map_wrapper.lineLayer.addFeatures([this.polyLine]);
    return this;
};

// Remove Route From map.
Route.prototype.remove = function () {
    this.map_wrapper.lineLayer.removeFeatures([this.polyLine]);
};

Map.prototype._fitBounds = function (bounds) {
    this.map.zoomToExtent(bounds);
};

Map.prototype.resize = function () {
    this.map.updateSize();
};

// Additional Method in OpenLayers to draw circle

function createCircle(origin, radius, sides, rotation) {
    var lonlat = new OpenLayers.LonLat(origin.x, origin.y),
        angle, new_lonlat, geom_point, points = [];

    for (var i = 0; i < sides; i++) {
        angle = (i * 360 / sides) + rotation;
        new_lonlat = OpenLayers.Util.destinationVincenty(lonlat, angle, radius);
        geom_point = new OpenLayers.Geometry.Point(new_lonlat.lon, new_lonlat.lat);
        points.push(geom_point);
    }
    var ring = new OpenLayers.Geometry.LinearRing(points);
    return new OpenLayers.Geometry.Polygon([ring]);

}

Map.prototype.removeMarker = function (markerObject) {
    var markerObjectList = this.getMarkerObjectArray();
    if (markerObjectList.length > 0) {
        var marker = markerObject.getMarker();
        for (var i in markerObjectList) {
            if (markerObjectList[i] instanceof OpenLayers.Marker) {
                if (marker == markerObjectList[i]) {
                    this.markerLayer.removeMarker(markerObjectList[i]);
                    this.getMarkerObjectArray().splice(i, 1);
                    this.shapeLayer.removeFeatures(this.circleObjectArray[i]);
                    this.circleObjectArray.splice(i, 1);
                }
            }
        }
    }
};

Map.prototype.addInfoWindow = function (infoWindowObject) {
    this.currentInfowWindow = infoWindowObject.getInfoWindowPopup();
    this.infoWindowObjectArray.push(this.currentInfowWindow);
    this.map.addPopup(this.currentInfowWindow, true);
};

Map.prototype.closeCurrentInfoWindow = function () {
    if (this.currentInfowWindow != null || this.currentInfowWindow != undefined) {
        this.map.removePopup(this.currentInfowWindow);
    }
};

Map.prototype.setContextMenuHTML = function (point, contextMenuHTML, contextMenuOptions) {
    if (this.enableContextMenuPopup) {
        this.contextMenuPopup = new OpenLayers.Popup("locationGuru",
            new OpenLayers.LonLat(point.longitude, point.latitude),
            new OpenLayers.Size(200, 200),
            contextMenuHTML.html,
            null, false, null);
        if (contextMenuOptions) {
            if (contextMenuOptions.getStyleClassName()) {
                this.contextMenuPopup.contentDisplayClass = contextMenuOptions.getStyleClassName();
            }
        }
        this.contextMenuPopup.autoSize = true;
        this.contextMenuPopup.panMapIfOutOfView = true;
        this.map.addPopup(this.contextMenuPopup, true);
    }
};

Map.prototype.hideContextMenu = function () {
    if (this.contextMenuPopup != null) {
        this.map.removePopup(this.contextMenuPopup);
        this.contextMenuPopup.destroy();
        this.contextMenuPopup = null;
    }
};
Map.prototype.disableContextMenu = function () {
    this.enableContextMenuPopup = false;
};
Map.prototype.enableContextMenu = function () {
    this.enableContextMenuPopup = true;
};
Map.prototype.setMarkerObjectArray = function (markerObjectArray) {
    this.markerObjectArray = markerObjectArray;
};
Map.prototype.getMarkerObjectArray = function () {
    return this.markerObjectArray;
};
Map.prototype.setRoute = function (route) {
    this.route = route;
};
Map.prototype.getRoute = function () {
    return this.route;
};
Map.prototype.setRouteArray = function (routeArray) {
    this.routeArray = routeArray;
};
Map.prototype.getRouteArray = function () {
    return this.routeArray;
};
Map.prototype.clearAllMapOverlays = function () {

    // remove Marker
    var markerObjectList = this.getMarkerObjectArray();
    if (markerObjectList.length > 0) {
        for (var i in markerObjectList) {
            if (markerObjectList[i] instanceof OpenLayers.Marker) {
                this.markerLayer.removeMarker(markerObjectList[i]);
            }
        }
        this.markerObjectArray = new Array();
    }

    // remove circle
    if (this.circleObjectArray.length > 0) {
        for (var i in this.circleObjectArray) {
            this.shapeLayer.removeFeatures(this.circleObjectArray[i]);
        }
        this.circleObjectArray = new Array();
    }
    // remove InfoWindow
    if (this.infoWindowObjectArray.length > 0) {
        for (var i in this.infoWindowObjectArray) {
            if (this.infoWindowObjectArray[i] instanceof OpenLayers.Popup.FramedCloud) {
                this.map.removePopup(this.infoWindowObjectArray[i]);
            }
        }
        this.infoWindowObjectArray = new Array();
    }

    // remove route

    if (this.getRoute() != null) {
        var vertexArr = this.getRoute().getVertexMarkerArray();
        var polyLineFeatureArr = this.getRoute().getPolyLineFeatureArray();
        if (vertexArr.length > 0) {
            for (var i in vertexArr) {
                this.geometryLayer.removeFeatures(vertexArr[i]);
                this.routeVertexMarkerLayer.removeFeatures(vertexArr[i]);
                this.setGeometryLayer(this.geometryLayer);
            }
            this.getRoute().setVertexMarkerArray(new Array());
        }

        if (polyLineFeatureArr.length > 0) {
            for (var i in polyLineFeatureArr) {
                this.geometryLayer.removeFeatures(polyLineFeatureArr[i]);
                this.setGeometryLayer(this.geometryLayer);
            }
            this.getRoute().setPolyLineFeatureArray(new Array());
        }
        var routes = this.getRouteArray();
        if (routes.length > 0) {
            for (var i in routes) {
                if (routes[i] instanceof Route) {
                    this.removeRoute(routes[i])
                }
            }
        }
    }
    // remove context Menu
    this.hideContextMenu();
};

/* class Point start */
function Point(lat, lon) {
    this.latitude = lat;
    this.longitude = lon;
}
Point.prototype.getLatitude = function () {
    return this.latitude;
};
Point.prototype.setLatitude = function (latitude) {
    this.latitude = latitude;
};

Point.prototype.getLongitude = function () {
    return this.longitude;
};
Point.prototype.setLongitude = function (longitude) {
    this.longitude = longitude;
};

/* class MarkerConstants start */
function MarkerConstants() {
}
MarkerConstants.imageURL = "../image/purpleMarker.png";
MarkerConstants.height = 25;
MarkerConstants.width = 25;
MarkerConstants.rdius = 0;
/* class MarkerConstants end */

/* class InfoWindow start */
function InfoWindow(point, contentHTML, closeBox) {

    this.point = point;
    this.contentHTML = contentHTML;
    this.closeBox = closeBox;
    this.infoWindowPopup = new OpenLayers.Popup.FramedCloud("chicken",
        new OpenLayers.LonLat(point.getLongitude(), point.getLatitude()),
        new OpenLayers.Size(0, 0),
        "<div style='width:auto;height:auto;'>" + contentHTML + "</div>",
        null,
        closeBox, closeInfoBox_OL(point.getLongitude(), point.getLatitude()));
}

// following functions are used intarnaly
function closeInfoBox_OL(lon, lat) {
}
InfoWindow.prototype.getInfoWindowPopup = function () {
    return this.infoWindowPopup;
};
InfoWindow.prototype.getPoint = function () {
    return this.point;
};
InfoWindow.prototype.getContentHTML = function () {
    return this.contentHTML;
};
InfoWindow.prototype.getClosBox = function () {
    return this.contentHTML;
};

Map.prototype.removeInfoWindow = function (infoWindowObject) {
    if (this.infoWindowObjectArray.length > 0) {
        for (var i in this.infoWindowObjectArray) {
            if (this.infoWindowObjectArray[i] instanceof  OpenLayers.Popup.FramedCloud) {
                if (infoWindowObject.getPoint().getLatitude() == this.infoWindowObjectArray[i].lonlat.lat || infoWindowObject.getPoint().getLongitude() == this.infoWindowObjectArray[i].lonlat.lon) {
                    this.map.removePopup(this.infoWindowObjectArray[i]);
                    this.infoWindowObjectArray.splice(i, 1);
                }
            }
        }
    }
};
Map.prototype.closeCurrentInfoWindow = function () {
    if (this.currentInfowWindow != null || this.currentInfowWindow != undefined) {
        this.map.removePopup(this.currentInfowWindow);
    }
};

/* class MarkerOptions start */
function MarkerOptions() {
    this.imageURL = MarkerConstants.imageURL;
    this.height = MarkerConstants.height;
    this.width = MarkerConstants.width;
    this.anchorX;
    this.anchorY;
    this.radius = MarkerConstants.rdius;
}

MarkerOptions.prototype.getImageURL = function () {
    return this.imageURL;
};
MarkerOptions.prototype.setImageURL = function (imageURL) {
    this.imageURL = imageURL;
}
;
MarkerOptions.prototype.getHeight = function () {
    return this.height;
};
MarkerOptions.prototype.setHeight = function (height) {
    this.height = height;
};

MarkerOptions.prototype.getWidth = function () {
    return this.width;
};
MarkerOptions.prototype.setWidth = function (width) {
    this.width = width;
};

MarkerOptions.prototype.getAnchorX = function () {
    return this.anchorX;
};
MarkerOptions.prototype.setAnchorX = function (anchorX) {
    this.anchorX = anchorX;
};

MarkerOptions.prototype.getAnchorY = function () {
    return this.anchorY;
};
MarkerOptions.prototype.setAnchorY = function (anchorY) {
    this.anchorY = anchorY;
};
MarkerOptions.prototype.setRadius = function (radius) {
    this.radius = radius;
};
MarkerOptions.prototype.getRadius = function () {
    return this.radius;
};
Map.prototype.panMapTo = function (point) {
    this.map.panTo(new OpenLayers.LonLat(point.getLongitude(), point.getLatitude()));
};


function Util() {
}
/**
 * This function generate the bounds from latlon Array
 *
 * @returns bounds
 * @param latLonArray
 */
Util.getBoundsFromLatLon = function (points) {
    var latLonArray = new Array();
    if (points.length > 0) {
        for (var i in points) {
            latLonArray.push(new OpenLayers.LonLat(points[i].longitude, points[i].latitude));
        }
    }
    var bounds = new OpenLayers.Bounds();
    if (latLonArray != null) {
        for (var i in latLonArray) {
            bounds.extend(latLonArray[i]);
        }
    }
    return bounds;
}
Util.getCenterPointFromPoints = function (points) {
    var latLonArray = new Array();
    if (points.length > 0) {
        for (var i in points) {
            latLonArray.push(new OpenLayers.LonLat(points[i].getLongitude(), points[i].getLatitude()));
        }
    }
    var bounds = new OpenLayers.Bounds();
    if (latLonArray != null) {
        for (var i in latLonArray) {
            bounds.extend(latLonArray[i]);
        }
    }
    var boundsCenter = bounds.getCenterLonLat();

    return new Point(boundsCenter.lat, boundsCenter.lon);
}
Util.getMMILat = function (latitude) {
    var sxne = 6999999.98;
    var sxwg84 = 62.9525;
    var lat = ((latitude * sxne)) / sxwg84;
    var y = 4096.00 + (4521000.00 - lat) / 1000.00;
    latitude = (4521000.00 - (y - 4096.00) * 1000.00) + 3000000.00;
    return latitude;
}
Util.getMMILon = function (longitude) {
    var syne = 425000.04;
    var sywgs84 = 3.82212;
    var lon = (longitude * syne) / sywgs84;
    var x = 4096.00 + (lon - 6999999.00) / 1000.00;
    longitude = (6999999.00 + (x - 4096.00) * 1000.00) - 10000000.00;
    return longitude;
}
Util.getWSGFromMMILat = function (latitude) {
    var sxne = 6999999.98;
    var sxwg84 = 62.9525;
    var y = (3000000.00 + 4521000.00 - latitude + 4096000.00) / 1000;
    var lat = 4096000.00 + 4521000.00 - (y * 1000);
    latitude = (lat * sxwg84) / sxne;

    return latitude;
}
Util.getWSGFromMMILon = function (longitude) {
    var syne = 425000.04;
    var sywgs84 = 3.82212;
    var x = (longitude + 10000000.00 - 6999999.00 + 4096000.00) / 1000.00;
    var lon = (x * 1000) - 4096000.00 + 6999999.00;
    longitude = (lon * sywgs84) / syne;

    return longitude;
}
Util.degreeToRadian = function (de) {
    var pi = Math.PI;
    var de_ra = ((de) * (pi / 180));
    return de_ra;
}
Util.getDistanceBetweenLatLonPair = function (lat1, lon1, lat2, lon2) {
    var srcLat = lat1;
    var srcLon = lon1;
    var destLat = lat2;
    var destLon = lon2;

    var R = 6371; // km
    var dLat = (destLat - srcLat) * Math.PI / 180;
    var dLon = (destLon - srcLon) * Math.PI / 180;

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(srcLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180)
        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000;// in meters

    return d;
}

/*
 * Function to create Fill polygon
 *
 * */

Map.prototype.createFillPolygon = function (points, options) {
    var polygonPoints = [];
    for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        polygonPoints.push(new OpenLayers.Geometry.Point(point.longitude, point.latitude));
    }
    var polyFill = new OpenLayers.Geometry.LinearRing(polygonPoints);
    options.polygon = new OpenLayers.Feature.Vector(polyFill, null, options);//
    options.map = this;
    return new Polygon(options);
};

// Polygon create options.

function Polygon(options) {
    this.map_wrapper = options.map;
    this.polygon = options.polygon;

}

// Add Polygon to Map.

Polygon.prototype.addToMap = function () {
    this.map_wrapper.lineLayer.addFeatures([this.polygon]);
    return this;
};

// Remove Polygon From map.
Polygon.prototype.remove = function () {

    this.map_wrapper.lineLayer.removeFeatures([this.polygon]);
};

