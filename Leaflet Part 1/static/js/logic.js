// Store API endpoint as url 
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform get request
d3.json(url).then(function(data){
    console.log(data)
    createFeatures(data.features)
});

// Create color function to change colors based on depth of earthquake
function depthColor(depth){
    if (depth >= -10 && depth <= 10) return "#81FF03";
    else if (depth >= 10 && depth <= 30) return "#CBFF53";
    else if (depth >= 30 && depth <= 50) return "#FFFF00";
    else if (depth >= 50 && depth <= 70) return "#FFBF37";
    else if (depth >= 70 && depth <= 90) return "#FD8E08";
    else return "#BA0404"; 
}

// Create a function for each feature that will create a popup that describes the location
// magnitude and depth of earthquake, and time

function createFeatures(earthquakeData){
  function onEachFeature(feature, layer){
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${feature.properties.mag} magnitude & ${feature.geometry.coordinates[2]} depth <p>${new Date(feature.properties.time)}</p>`);
  }

  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
// pointToLayer allows simple markers to be altered by passing a latlng function - change the marker size
// based on depth and magnitude    
    pointToLayer: function(feature, latlng){
      let marker = {
        color: "black",
                fillColor: depthColor(feature.geometry.coordinates[2]),
                fillOpacity: 1,
                weight: 0.65,
                radius: feature.properties.mag*5000
      }
      return L.circle(latlng, marker);
    }
  });

  createMap(earthquakes);

}

// Create base layer and map layers
function createMap(earthquakes) {
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let baseMaps = {
    "Street Map": street
  };

  let overlayMaps = {
    Earthquakes: earthquakes
  };

  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

// Create a layer control
// Pass it basemaps, overlaymaps
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 // Create legend 
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [-10, 10, 30, 50, 70, 90];
    

    for (let i = 0; i < depths.length; i++) {
        div.innerHTML += '<i style="background:' + depthColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    };

    return div;
};

  legend.addTo(myMap);
};

