$(function() {
    // initialize OpenLayers
    OpenLayers.ImgPath = "theme/default/img/";
    OpenLayers.Lang.setCode("zh-CN");
    
    // create a map instance
    var map = new OpenLayers.Map("mapcanvas", {
        theme: null,
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037509, -20037508.34, 20037508.34, 20037508.34),
        layers: [
                new OpenLayers.Layer.OSM(OpenLayers.i18n('OSM_Mapnik'), [
                    "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
                    "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
                    "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
                ], {
                    attribution: "Tiles &copy; <a target='_blank' href='http://www.openstreetmap.org/' >Open Street Map</a>"
                })
        ],
        controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ScaleLine({maxWidth:150, geodesic:true}),
                new OpenLayers.Control.MousePosition({numDigits:6, displayProjection: new OpenLayers.Projection("EPSG:4326")}),
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.OverviewMap(),
                new OpenLayers.Control.LayerSwitcher()
        ]
    });
    map.zoomToMaxExtent();

    // create sensor layer
    var layer = new OpenLayers.Layer.Vector("传感器", {
        styleMap: new OpenLayers.StyleMap({
                fillColor: "#ffcc66",
                strokeColor: "#ff9933",
                strokeWidth: 2,
                label: "${name}",
                labelAlign: "l",
                labelXOffset: 10,
                fontColor: "#333333",
                pointRadius: 9,
                fontSize: "12px",
                fontOpacity: 1
        })
    });
    map.addLayer(layer);
    
    // initialize sensor list
    var sensors = {}, features = {};
    (function initSensorList() {
        var i = 0, j = 0, html = "", sensor;
        for (i=0; i<geospatial_resources.resources.length; i++) {
            html += "<li>" + geospatial_resources.resources[i].name + "<ol>";
            for (j=0; j<geospatial_resources.resources[i].sensors.length; j++) {
                sensor = geospatial_resources.resources[i].sensors[j];
                html += "<li><a href=# id=" + sensor.id + ">" + sensor.name + "</a></li>";
                sensors[sensor.id] = sensor;
                // add to map
                var lonlat = new OpenLayers.LonLat(sensor.longitude, sensor.latitude).transform(
                    map.displayProjection, map.getProjectionObject()
                );
                features[sensor.id] = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), {
                        sid: sensor.id,
                        name: sensor.name
                    }
                );
                layer.addFeatures([features[sensor.id]]);
            }
            html += "</ol></li>";
        }
        $("#sensorlist").html(html);
    })();
    map.zoomToExtent(layer.getDataExtent());
    
    function onPopupClose(event) {
        // this is the popup itself
        var feature = features[this.id];
        if (feature && feature.popup) {
            map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }
    }
    
    function onSelectFeature(feature) {
        if (feature.popup) {
            return;
        }
        var sensor = sensors[feature.attributes.sid];
        var popup = new OpenLayers.Popup.FramedCloud(
            feature.attributes.sid, // id
            feature.geometry.getBounds().getCenterLonLat(), // lonlat
            null, // size
            "<div class=embeded><h3>" + sensor.name + "</h3></div>", // html
            null, // anchor
            true, // close box
            onPopupClose // close callback
        );
        feature.popup = popup;
        map.addPopup(popup);
    }
    
    var selecter = new OpenLayers.Control.SelectFeature(layer, {
        clickout: false,
        toggle: false,
        multiple: false,
        hover: false,
        onSelect: onSelectFeature
    });
    map.addControl(selecter);
    selecter.activate();
    
    $("#sensorlist a").click(function() {
        var feature = features[this.id];
        onSelectFeature(feature);
    });
});
