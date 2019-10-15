const mapid = window.location.pathname.split("/").slice(-1)[0];

function initMap() {
  let map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 13.038215, lng: 80.2561032 },
    zoom: 10,
    streetViewControl: false
  });

  let TILE_URL = 'https://b.tiles.mapbox.com/v4/openstreetmap.1b68f018/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoib3NtLWluIiwiYSI6ImNqcnVxMTNrNTJwbHc0M250anUyOW81MjgifQ.cZnvZEyWT5AzNeO3ajg5tg';
  let layerID = 'India';
  let layer = new google.maps.ImageMapType({
    name: layerID,
    getTileUrl: function(coord, zoom) {
      var url = TILE_URL
        .replace('{x}', coord.x)
        .replace('{y}', coord.y)
        .replace('{z}', zoom);
      return url;
    },
    tileSize: new google.maps.Size(256, 256),
    minZoom: 1,
    maxZoom: 20
  });
  map.mapTypes.set(layerID, layer);
  map.setMapTypeId(layerID);

  let info = new google.maps.InfoWindow();
  // map.data.setStyle((feature) => {
  //   return {
  //     strokeColor: '#00f',
  //     fillColor: (feature.getProperty('level') === 'ward' ? '#f00' : '#00f'),
  //     opacity: 0.5,
  //     fillOpacity: 0.25,
  //     clickable: false
  //   };
  // });

  rows.forEach(row => {
    row.xy = row.xy.split(",");
    row.coord_x_final = row.xy[0];
    row.coord_y_final = row.xy[1];
    delete row.xy;
    if (row.coord_y_final * 1 && row.coord_x_final * 1) {
      let marker = new google.maps.Marker({
        map: map,
        clickable: true,
        position: new google.maps.LatLng(row.coord_y_final * 1, row.coord_x_final * 1)
      });
      let showMarker = (matches) => {
        let table = '<h4>Results</h4><table class="table"><thead><tr>';
        table += Object.keys(matches[0]).map(col => {
          if (col !== 'coord_x_final' && col !== 'coord_y_final') {
            return '<th>' + col + '</th>';
          }
        }).join("");
        table += '</tr></thead><tbody>';
        table += matches.map(match => {
          let htmlrow = '<tr>';
          Object.keys(match).forEach(col => {
            if (col !== 'coord_x_final' && col !== 'coord_y_final') {
              row[col] = match[col];
              htmlrow += '<td>' + match[col] + '</td>';
            }
          });
          return htmlrow + '</tr>';
        });
        table += '</tbody></table>';
        info.setContent(table);
        info.open(map, marker);
      };
      marker.addListener('click', function(e) {
        info.close();
        if (Object.keys(row).length === 2) {
          fetch("/api?mapid=" + mapid + "&x=" + row.coord_x_final + "&y=" + row.coord_y_final)
            .then(res => res.json())
            .then(showMarker);
        } else {
          showMarker([row]);
        }
      });
    }
  });
}
