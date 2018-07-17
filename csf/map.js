// This function is called to load map


function loadMap(divId) {

    
        centerLat = "19.075908";
        centerLon = "72.878467";
    
    var map = null,
        options = {
            center: new google.maps.LatLng(44.5403, -78.5463),
			zoom: 8,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		  
        };
    try {
        // console.log(centerLat +""+ centerLon );
        map = new Map(options);
        map.load();
    }
    catch (e) {
		console.log(e);
		console.log("Could not connect to internet.Please check your internet connection.");
		
        //$("#messages").html("Could not connect to internet.Please check your internet connection.").slideDown('slow').delay(delayTime).slideUp('slow');
    }

    return map;

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