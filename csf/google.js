//google.load('earth', '1');
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
    google.maps.visualRefresh = false;
    var options = this.options;
    this.map = new google.maps.Map(this.div, {
        center: new google.maps.LatLng(0, 0),
        zoom: options.zoom || options.minZoom || 0,
        minZoom: options.minZoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    var eventHandlers = options.eventHandlers || {};

    this._addEventHandler(this.map, Map.LEFT_CLICK_EVENT, eventHandlers.click, this);
    this._addEventHandler(this.map, Map.RIGHT_CLICK_EVENT, eventHandlers.right_click, this);

    this.panTo(options.latitude, options.longitude);

    delete this.div;
    delete this.options;
    return this;
};

Map.prototype.addEventHandler = function (event, handler) {
    this._addEventHandler(this.map, event, handler, this);
};

Map.prototype._addEventHandler = function (target, event, handler, context) {
    if (handler) {
        context.eventListeners[event] = google.maps.event.addListener(target, event, function (event) {
            var location = event ? event.latLng : null,
                latitude = location ? location.lat() : null,
                longitude = location ? location.lng() : null;
            handler.call(context, latitude, longitude, event);
        });
    }
};

Map.prototype.removeEventHandler = function (event) {
    var eventListeners = this.eventListeners;
    google.maps.event.removeListener(eventListeners[event]);
    delete eventListeners[event];
    return this;
};

Map.prototype.createMarker = function (options) {
    var icon = {
            url: options.image,
            size: new google.maps.Size(options.width, options.height)
        },
        offset = options.offset;

    icon.anchor = offset ? new google.maps.Point(offset.x, offset.y) : null;

    options.marker = new google.maps.Marker({
        position: new google.maps.LatLng(options.latitude, options.longitude),
        icon: icon,
        draggable: options.draggable
    });
    options.map = this;
    return new Marker(options);
};

Map.prototype.addInfoWindow = function (infoWindowObject) {
    infoWindowObject.infoWindow.open(this.map);
};

Map.prototype.closeCurrentInfoWindow = function () {
    this.infoWindow.infoWindow.close();
};

function Marker(options) {
    var marker = this.marker = options.marker,
        eventHandlers = options.eventHandlers || {},
        infoWindow = new google.maps.InfoWindow({content: options.content || ""}),
        map_wrapper = this.map_wrapper = options.map;

    this.eventListeners = {};
    this.circle = new google.maps.Circle(this._createCircleOptions(options.circleOptions || {visible: false}));
    this.map = map_wrapper.map;
    this.infoWindow = infoWindow;

    map_wrapper._addEventHandler(marker, "click", eventHandlers.click, this);
    map_wrapper._addEventHandler(marker, "dblclick", eventHandlers.double_click, this);
    map_wrapper._addEventHandler(marker, "rightclick", eventHandlers.right_click, this);
    map_wrapper._addEventHandler(marker, "dragend", eventHandlers.drag_end, this);
    map_wrapper._addEventHandler(marker, "mouseover", eventHandlers.mouse_over, this);
    map_wrapper._addEventHandler(marker, "mouseout", eventHandlers.mouse_out, this);
    map_wrapper._addEventHandler(infoWindow, "closeclick", eventHandlers.close_click, this);
}

Marker.OPTIMIZED = "optimized";
Marker.IMAGE = "image";
Marker.LOCATION = "location";
Marker.SIZE = "size";

Marker.prototype.removeEventHandler = function (event) {
    var eventListeners = this.eventListeners;
    google.maps.event.removeListener(eventListeners[event]);
    delete eventListeners[event];
    return this;
};

Marker.prototype.addToMap = function () {
    var map = this.map,
        circle = this.circle;

    this.marker.setMap(map);

    if (circle) {
        circle.setMap(map);
    }
    this.map_wrapper._addOverlay(this);
    return this;
};

Marker.prototype.remove = function () {
    var map = null,
        circle = this.circle,
        infoWindow = this.infoWindow;

    this.marker.setMap(map);

    if (circle) {
        circle.setMap(map);
    }

    if (infoWindow) {
        infoWindow.close();
    }
    this.map_wrapper._removeOverlay(this);
    return this;
};

Marker.prototype.zoomHere = function () {
    var bounds = new google.maps.LatLngBounds(),
        position = this.marker.getPosition();

    bounds.extend(position);

    this.map_wrapper.fitBounds(bounds);

    this.map_wrapper.panTo(position.lat(), position.lng());

    return this;
};

Marker.prototype.getPosition = function () {
    var position = this.marker.getPosition();
    return {latitude: position.lat(), longitude: position.lng()};
};

Marker.prototype.openInfoWindow = function (content) {
    var infoWindow = this.infoWindow;
    if (content) {
        infoWindow.setContent(content);
    }
    infoWindow.open(this.map, this.marker);
    return this;
};

Marker.prototype.closeInfoWindow = function () {
    this.infoWindow.close();
    return this;
};

Marker.prototype.updateOptions = function (properties) {
    var image_key = Marker.IMAGE,
        location_key = Marker.LOCATION,
        optimized = Marker.OPTIMIZED,
        marker = this.marker;

    if (optimized in properties) {
        marker.setOptions({optimized: properties[optimized]});
    }

    if (image_key in properties) {
        marker.setIcon(properties[image_key]);
    }

    if (location_key in properties) {
        var object = properties[location_key];

        marker.setPosition(new google.maps.LatLng(object.latitude, object.longitude));
    }
};

Marker.prototype.setCircleOptions = function (options) {
    this.circle.setOptions(this._createCircleOptions(options));
    return this;
};

Marker.prototype.showCircle = function () {
    this.circle.setVisible(true);
    return this;
};

Marker.prototype.hideCircle = function () {
    this.circle.setVisible(false);
    return this;
};

Marker.prototype._createCircleOptions = function (options) {
    return {
        strokeColor: options.strokeColor,
        strokeOpacity: options.strokeOpacity,
        strokeWeight: options.strokeWeight,
        fillColor: options.fillColor,
        fillOpacity: options.fillOpacity,
        map: this.map,
        center: this.marker.getPosition(),
        radius: options.radius,
        visible: options.visible || false
    };
};

Marker.prototype.click = function () {
    google.maps.event.trigger(this.marker, Map.LEFT_CLICK_EVENT);
};

Map.prototype.addContextMenu = function (options) {
    options.map = this;
    return new ContextMenu(options);
};

//Set map to center
Map.prototype.setCenter = function (latitude, longitude, zoomLevel) {
    var mapCenter = new google.maps.LatLng(latitude, longitude);
    this.map.setCenter(mapCenter);
    this.map.setZoom(zoomLevel);
    return this;

};

//Pan map
Map.prototype.panTo = function (latitude, longitude) {
    var panlatLon = new google.maps.LatLng(latitude, longitude);
    this.map.panTo(panlatLon);
    return this;
};
//Set map zoom level
Map.prototype.setZoomLevel = function (zoomLevel) {
    this.map.setZoom(zoomLevel);
    return this;
};

//Get map current zoom level
Map.prototype.getZoomLevel = function () {
    return this.map.getZoom();
};

//Display all marker within view port
Map.prototype.fitToViewPort = function (points) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        bounds.extend(new google.maps.LatLng(point.latitude, point.longitude));
    }

    this.map.fitBounds(bounds);

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
    this.container = document.createElement("div");
    this.container.className = "context-menu-container";
    this.container.innerHTML = options.html;
    this.pixelOffset = new google.maps.Point(-5, -5);
    this.setMap(options.map.map);
    this.map_wrapper = options.map;
}

ContextMenu.prototype = new google.maps.OverlayView();

ContextMenu.prototype.draw = function () {

};

ContextMenu.prototype.remove = function () {
    this.setMap(null);
    this.display =false;
};

ContextMenu.prototype.onAdd = function () {
    this.getPanes().floatPane.appendChild(this.container);
};

ContextMenu.prototype.onRemove = function () {
    this.container.parentNode.removeChild(this.container);
    this.display =false;
};

ContextMenu.prototype.hide = function () {
    this.container.style.display = "none";
    this.display =false;
    return this;
};

ContextMenu.prototype.show = function (latitude, logitude) {
    if(this.zoomChanged){
        google.maps.event.removeListener(this.zoomChanged);
    }
    var _this = this;
    var mapDiv = this.map.getDiv(),
        container = this.container,
        position = new google.maps.LatLng(latitude, logitude);
    container.style.display = "block";
    this.display = true;

    var mapSize = new google.maps.Size(mapDiv.offsetWidth, mapDiv.offsetHeight),
        menuSize = new google.maps.Size(container.offsetWidth, container.offsetHeight);

    if (this.getProjection() != undefined) {
        var mousePosition = this.getProjection() ? this.getProjection().fromLatLngToDivPixel(position) : {x: 0, y: 0};
    }
    else {
        var mousePosition = this.map.getProjection().fromLatLngToPoint(position);
        mousePosition.x = mousePosition.x * 3.5;
        mousePosition.y = mousePosition.y * 3.2;
    }

    var left = mousePosition.x,
        top = mousePosition.y,
        pixelOffset = this.pixelOffset,
        xo = pixelOffset.x,
        yo = pixelOffset.y,
        menuHeight = menuSize.height,
        menuWidth = menuSize.width;

    if (mousePosition.x > mapSize.width - menuWidth - xo) {
        left = left - menuWidth - xo;
    }
    else {
        left += xo;
    }
    if (mousePosition.y > mapSize.height - menuHeight - yo) {
        top = top - menuHeight - yo;
    }
    else {
        top += yo;
    }
    container.style.top = top + 'px';
    container.style.left = left + 'px';

    _this.updateContextMenu(latitude,logitude);

    return this;

};

ContextMenu.prototype.updateContextMenu = function (lat, lon) {
    var _this = this;
    this.zoomChanged = this.map_wrapper.map.addListener('zoom_changed', function () {
        if (_this.display){
            _this.show(lat, lon);
        }
    });

};

Map.prototype.createRoute = function (points, options) {
    var routePoints = [];
    for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        routePoints.push(new google.maps.LatLng(point.latitude, point.longitude));
    }

    options.polyLine = new google.maps.Polyline({
        path: routePoints,
        strokeColor: options.strokeColor,
        strokeOpacity: options.strokeOpacity,
        strokeWeight: options.strokeWeight
    });
    options.map = this;
    return new Route(options);
};

function Route(options) {
    var mapWrapper = options.map;
    this.polyLine = options.polyLine;
    this.map = mapWrapper.map;
}

Route.prototype.addToMap = function () {
    this.polyLine.setMap(this.map);
    return this;
};

Route.prototype.remove = function () {
    this.polyLine.setMap(null);
};

// TODO this
Map.prototype.fitBounds = function (bounds) {
    this.map.fitBounds(bounds);
};
Map.prototype.resize = function () {
    google.maps.event.trigger(this.map, 'resize');
};

/*
 * Function to create Fill polygon
 *
 * */

Map.prototype.createFillPolygon = function (points, options) {
    var PolygonPoints = [];
    for (var i = 0, l = points.length; i < l; i++) {
        var point = points[i];
        PolygonPoints.push(new google.maps.LatLng(point.latitude, point.longitude));
    }

    options.polygon = new google.maps.Polygon({
        path: PolygonPoints,
        strokeColor: options.strokeColor,
        strokeOpacity: options.strokeOpacity,
        strokeWeight: options.strokeWeight,
        fillColor: options.fillColor,
        fillOpacity: options.fillOpacity

    });
    options.map = this;
    return new Polygon(options);
};

function Polygon(options) {
    var mapWrapper = options.map;
    this.polygon = options.polygon;
    this.map = mapWrapper.map;
}

Polygon.prototype.addToMap = function () {
    this.polygon.setMap(this.map);
    return this;
};

Polygon.prototype.remove = function () {
    this.polygon.setMap(null);
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

function InfoWindow(point, contentHTML, closeBox) {
    this.point = point;
    this.contentHTML = contentHTML;
    this.closeBox = closeBox;
    this.infoWindow = new google.maps.InfoWindow({content: contentHTML || ""});
    this.infoWindow.setPosition(new google.maps.LatLng(point.getLatitude(), point.getLongitude()));
};