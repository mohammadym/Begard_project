import { Component, OnInit, AfterViewInit } from '@angular/core';
import { defaults as defaultControls } from 'ol/control';
import { Location } from './location.model';

import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import Overlay from 'ol/Overlay';
import Vector from 'ol/layer/Vector';
import vector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { LocationService } from './location.service';
import { MapMarker } from './mapmarker.model';
import { MapLocationService } from '../map-locations.service';
import { Style } from 'ol/style';
import { Icon } from 'ol/style';
import { CalenderComponent } from '../calender/calender.component'
import { PlanComponent } from '../plan/plan.component'



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  providers: [LocationService]
})
export class MapComponent implements AfterViewInit {

  constructor(private locationService: MapLocationService) { }
  markerLocations: MapMarker[];

  ngAfterViewInit() {
    this.markerLocations = this.locationService.getLocations();
    //
    // elements that make up the popup.
    //
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    //
    // Create an overlay to anchor the popup to the map.
    //
    var overlay = new Overlay({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });

    //
    // Add a click handler to hide the popup.
    // Don't follow the href.
    //
    closer.onclick = function () {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    //
    // Create the map.
    //

    var map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: fromLonLat([+this.markerLocations[0].lan, +this.markerLocations[0].lat]),
        zoom: 12
      }),
      overlays: [overlay],
      controls: defaultControls().extend([
        new ZoomToExtent({
          extent: [
            813079.7791264898, 5929220.284081122,
            848966.9639063801, 5936863.986909639
          ]
        })
      ])
    });


    //
    // Add the marker layers to map
    //

    for (var i = 0; i < this.markerLocations.length; i++) {
      var layer = new Vector({
        source: new vector({
          features: [
            new Feature({
              geometry: new Point(fromLonLat(
                [parseFloat(this.markerLocations[i].lan),
                parseFloat(this.markerLocations[i].lat)]))
            })
          ]
        })
      });
      var img = undefined;
      layer.setStyle(new Style({
        image: new Icon({
          anchor: [0.5, 0.96],
          crossOrigin: 'anonymous',
          src: 'assets/images/icon.png',
          img: img,
          imgSize: img ? [img.width, img.height] : undefined

        })
      }));
      map.addLayer(layer);
    }

    //
    // Add a click handler to the map to render the popup.
    //
    map.on('singleclick', function (evt) {
      if (map.hasFeatureAtPixel(evt.pixel) == true) {
        var coordinate = evt.coordinate;
        console.log(evt);
        var hdms = coordinate;
        content.innerHTML = '<p></p><code>' + hdms +
          '</code>';
        overlay.setPosition(coordinate);

      }
    });
  }
}
