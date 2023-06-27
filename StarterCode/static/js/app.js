var data = {};
var inputSelector = d3.select("#selDataset");
var panelDemoInfo = d3.select("#sample-metadata");

function titleCase(str) {
    return str.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

function populateDemoInfo(idNum) {
    console.log("Pop: " + idNum);
    var metadataFilter = data.metadata.filter(item => item["id"] == idNum);
    console.log(`metaFilter length: ${metadataFilter.length}`);
    panelDemoInfo.html("");
    Object.entries(metadataFilter[0]).forEach(([key, value]) => { var titleKey = titleCase(key); panelDemoInfo.append("h6").text(`${titleKey}: ${value}`) });
}

function compareValues(key, order = 'asc') {
    return function innerSort(a, b) {
        if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            return 0;
        }
        const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
        const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];
        let comparison = 0;
        if (varA > varB) {
            comparison = 1;
        } else if (varA < varB) {
            comparison = -1;
        }
        return (
            (order === 'desc') ? (comparison * -1) : comparison
            );
        };
}

function drawBarPlot(idNum) {
    console.log("Bar: " + idNum);
    var samplesFilter = data["samples"].filter(item => item["id"] == idNum);
    var sample_values = samplesFilter[0].sample_values;
    var otu_ids = samplesFilter[0].otu_ids;
    var otu_labels = samplesFilter[0].otu_labels;
    var combinedList = [];
    for (var i=0; i < sample_values.length; i++) {
        var otu_id = otu_ids[i];
        var otu_text = "OTU " + otu_id.toString();
        var combinedObject = {"sample_values": sample_values[i], "otu_ids": otu_text, "otu_labels": otu_labels[i]};
        combinedList.push(combinedObject);
    }
    var sortedList = combinedList.sort(compareValues("sample_values", "desc"));
    var slicedList = sortedList.slice(0, 10);
    var sample_values_list = slicedList.map(item => item.sample_values).reverse();
    var otu_ids_list = slicedList.map(item => item.otu_ids).reverse();
    var otu_labels_list = slicedList.map(item => item.otu_labels).reverse();
    var trace = {
        type: "bar",
        y: otu_ids_list,
        x: sample_values_list,
        text: otu_labels_list,
        orientation: 'h'
    };
    var traceData = [trace];
    var layout = {
        title: "Top 10 OTUs Found",
        yaxis: { title: "OTU Labels" },
        xaxis: { title: "Values"}
    };
    Plotly.newPlot("bar", traceData, layout);
}


function drawBubbleChart(idNum) {
    console.log("Bubble: " + idNum);
    var samplesFilter = data["samples"].filter(item => item["id"] == idNum);
    var trace = {
        x: samplesFilter[0].otu_ids,
        y: samplesFilter[0].sample_values,
        mode: 'markers',
        text: samplesFilter[0].otu_labels,
        marker: {
            color: samplesFilter[0].otu_ids,
            size: samplesFilter[0].sample_values,
            colorscale: "Earth"
        }
    };
    
    
var traceData = [trace];
var layout = {
    showlegend: false,
    height: 600,
    width: 1500,
    xaxis: { title: "OTU ID"}
    };
    Plotly.newPlot('bubble', traceData, layout);
}


function drawGaugeChart(idNum) {
    console.log("Gauge: " + idNum);
    var metadataFilter = data.metadata.filter(item => item["id"] == idNum);
    var level = metadataFilter[0].wfreq;
    var offset = [ 0, 0, 3, 3, 1, -0.5, -2, -3, 0, 0];
    var degrees = 180 - (level * 20 + offset[level]);
    var height = .6;
    var widthby2 = .05;
    var radians = degrees * Math.PI / 180;
    var radiansBaseL = (90 + degrees) * Math.PI / 180;
    var radiansBaseR = (degrees - 90) * Math.PI / 180;
    var xHead = height * Math.cos(radians);
    var yHead = height * Math.sin(radians);
    var xTail0 = widthby2 * Math.cos(radiansBaseL);
    var yTail0 = widthby2 * Math.sin(radiansBaseL);
    var xTail1 = widthby2 * Math.cos(radiansBaseR);
    var yTail1 = widthby2 * Math.sin(radiansBaseR);
    var triangle = `M ${xTail0} ${yTail0} L ${xTail1} ${yTail1} L ${xHead} ${yHead} Z`;
    var traceData = [{
        type: 'scatter',
        x: [0],
        y: [0],
        marker: {size: 16, color: '#850000'},
        showlegend: false,
        name: 'frequency',
        text: level,
        hoverinfo: 'text+name'},
        { values: [180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180],
        rotation: 90,
        text: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition: 'inside',
        marker: {colors: [  '#84B589', '#89BB8F', '#8CBF88', '#B7CC92', '#D5E49D', '#E5E7B3', '#E9E6CA', '#F4F1E5', '#F8F3EC', '#FFFFFF',]},
        labels: ['8-9','7-8','6-7','5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];


    var layout = {
        shapes:[{ type: 'path', path: triangle, fillcolor: '#850000', line: { color: '#850000' } }],
        title: '<b>Belly Button Wash Frequency</b><br>Scrubs per Week',
        xaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1]},
        yaxis: {zeroline: false, showticklabels: false, showgrid: false, range: [-1, 1]}
    };
    Plotly.newPlot('gauge', traceData, layout);
}


function initialization () {
    d3.json("./data/samples.json").then(function(jsonData) {
        console.log("Gathering Data");
        data = jsonData;
        console.log("Keys: " + Object.keys(data));
        names = data.names;
        names.forEach(element => { inputSelector.append("option").text(element).property("value", element); });
        var idNum = names[0];
        populateDemoInfo(idNum);
        drawBarPlot(idNum);
        drawBubbleChart(idNum);
        drawGaugeChart(idNum);
    });
}
initialization();
function optionChanged(idNum) {
    populateDemoInfo(idNum);
    drawBarPlot(idNum);
    drawBubbleChart(idNum);
    drawGaugeChart(idNum);
};





