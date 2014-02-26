/*

    * gartenkarte.de - berliner gartenkarte
    * 
    * This script initializes and configures OpenLayers to display a map of
    * Urban Gardening Projects in Berlin.
    * 
    * This script may contain parts or ideas originating from different authors.
    * They keep their respective rights.
    * 
    * Placed in the Public Domain by
    * Jon Richter, Lennart Wiesiolek, Max Godt
    * 
    * Berlin, 06.01.2013
    *

*/

var map;

//  * <popup_control>
function showPopup(evt) {
    feature = evt.feature;

    var lonlat = new OpenLayers.LonLat(feature.geometry.x,feature.geometry.y);
    var contentSize = new OpenLayers.Size(800,800);
    var contentHTML = feature.attributes.Titel;
    var anchor = new OpenLayers.Icon("./icon.png",contentSize,feature.geometry);

    popup = new OpenLayers.Popup.Anchored("popup",
        lonlat,
        contentSize,
        contentHTML,
        null,
        false,
        null);
    popup.autoSize = true;
    popup.maxSize = new OpenLayers.Size(400,400);
    popup.fixedRelativePosition = true;
    feature.popup = popup;
    popup.feature = feature
    map.addPopup(popup, true);
}

function hidePopup(evt){
    feature = evt.feature;
    if (feature.popup){
        popup.feature = null;
        map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    }
}
// * </popup_control>


//  * <openlayers_initialization>
function init(){

    // * <initialize_map_properties>
        // * <configure_bounding_box />
        var gakaBounds = new OpenLayers.Bounds(
            13.0628,52.3279,
            13.764,52.68
        );

        // * <declare_map_option>
        var options = {
            theme: null,
            projection: new OpenLayers.Projection("EPSG:900913"),
            displayProjection: new OpenLayers.Projection("EPSG:4326"),
            controls:[
                new OpenLayers.Control.TouchNavigation({
                    dragPanOptions: {
                        enableKinetic: true
                    }
                }),
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.ZoomPanel(),
                new OpenLayers.Control.LayerSwitcher({roundedCornerColor : '#48474C' }),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ScaleLine(),
                ],
        };
        // * </declare_map_options>

        // * <draw map />
        map = new OpenLayers.Map('map', options);
    // * </initialize_map_properties>

    // * <initialize_map_layers>

        // * <initialize_mapquest_layer>
            // * <initialize_OpenLayers.Layer.MapQuestOSM_WMS_driver>
            OpenLayers.Layer.MapQuestOSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {
                visibility:false,
                isBaseLayer:true,
                name: "OpenStreetMap MapQuest",
                attribution: "MapQuest Layer Data CC BY SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
                sphericalMercator: true,
                url: ' http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png',
                clone: function(obj) {
                    if (obj == null) {
                        obj = new OpenLayers.Layer.OSM(
                        this.name, this.url, this.getOptions());
                    }
                    obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
                    return obj;
                },
                CLASS_NAME: "OpenLayers.Layer.MapQuestOSM"
            });
            // * </initialize_OpenLayers.Layer.MapQuestOSM_WMS_driver>

            // <assign_mapquest_layer />
            var layerMapQuest = new OpenLayers.Layer.MapQuestOSM();
        // * </initialize_mapquest_layer>

        // * <initialize_OSM_default_layer />
            var layerMapnik = new OpenLayers.Layer.OSM.Mapnik("OpenStreetMap",
                {
                    visibility:false,
                    isBaseLayer:true,
                } );

        // * <initialize_stamen_watercolor_layer>
            var layerStamen = new OpenLayers.Layer.Stamen("watercolor",
                {
                    isBaseLayer:true,
                    attribution: "Watercolor Map Tiles by <a href='http://stamen.com' target=_blank>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0' target=_blank>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org' target=_blank>OpenStreetMap</a>, under <a href='http://creativecommons.org/licenses/by-sa/3.0' target=_blank>CC BY SA 3.0</a>.",
                });
            
            // * <fix_stamen_layer_title />
            layerStamen.setName('Stamen Watercolor');
        // * </initialize_stamen_watercolor_layer>
     
        // * <initialize_geojson_marker_layer>

            // * <style_geojson_vector_features />
            var styleGeoJSON = new OpenLayers.StyleMap({
                pointRadius: 16,
                externalGraphic: './icon.png',
            })

            // * <initialize_geojson_layer>
            var layerGeoJSON = new OpenLayers.Layer.Vector("Urbane Gärten in Berlin", {
                // * <activate_popup_event_listeners />
                eventListeners:{
                    'featureselected': showPopup,
                    'featureunselected': hidePopup,
                },
                // * <configure_geojson_layer />
                projection: new OpenLayers.Projection("EPSG:4326"),
                attribution: "Daten der Urbanen Gärten <a href='http://creativecommons.org/licenses/by-nc-sa/3.0/deed.de' target=_blank>CC BY NC SA</a> von <a href='http://stadtacker.net' target=_blank>stadtacker.net</a>",
                styleMap: styleGeoJSON,

                // * create_vector_layer />
                strategies: [new OpenLayers.Strategy.Fixed()],
                // * <add_feature_to_layer />
                protocol: new OpenLayers.Protocol.HTTP({
                    url: "./gartenkarte.geojson",
                    format: new OpenLayers.Format.GeoJSON()
                }),
            });
            // * </initialize_geojson_layer>

            // * <create_selectFeature_control />
            var selectorGeoJSON = new OpenLayers.Control.SelectFeature(layerGeoJSON,{
                hover:true,
                autoActivate:true,
            });

            // * <add_layer_popup_control_to_map />
            map.addControl(selectorGeoJSON);
        
        // * </initialize_geojson_marker_layer>

        // * <add_layers_to_map />
        map.addLayers([layerStamen, layerMapQuest, layerMapnik, layerGeoJSON ]);
    // * </initialize_map_layers>

    // * <display_map_extent />
    map.zoomToExtent(
        gakaBounds.transform(map.displayProjection, map.projection)
    );
}
// * </openlayers_initialization>
