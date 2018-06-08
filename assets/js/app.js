// Define SVG area dimensions
var svgWidth = 840;
var svgHeight = 580;

// Define the chart's margins as an object
var chartMargin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 50
};

// Define dimensions of the chart area
var width = svgWidth - chartMargin.left - chartMargin.right;
var height = svgHeight - chartMargin.top - chartMargin.bottom;


// Select body, append SVG area to it, and set the dimensions
var svg = d3
    .select('.chart')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chart= svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);


// Append a div to the body to create tooltips, assign it a class
d3.select(".chart").append("div").attr("class", "tooltip").style("opacity", 0);

// Load data from data.csv file (poverty vs physical activity)
d3.csv("data/Final_Cleaned_Data/data.csv", function(err, healthData) {

    // Throw an error if one exists
    if (err) throw err;

    // Cast the poverty value and physical activity metric value for each piece of healthData
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.phys_act = +data.phys_act;
    });

    
    // Create scale functions
    var yLinearScale = d3.scaleLinear().range([height, 0]);
    var xLinearScale = d3.scaleLinear().range([0, width]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Scale the domain
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    xMin = d3.min(healthData, function(data) {
        return +data.poverty * 0.95;
    });

    xMax = d3.max(healthData, function(data) {
        return +data.poverty * 1.05;
    });

    yMin = d3.min(healthData, function(data) {
        return +data.phys_act * 0.98;
    });

    yMax = d3.max(healthData, function(data) {
        return +data.phys_act * 1.02;
    });

    xLinearScale.domain([xMin, xMax]);
    yLinearScale.domain([yMin, yMax]);


    // Initialize tooltip 
    var toolTip = d3
        .tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(data) {
            var stateName = data.state;
            var pov = +data.poverty;
            var physAct = +data.phys_act;
            return (
                stateName + '<br> Poverty: ' + pov + '% <br> Physically Active: ' + physAct + '%'
            );
        });

    // Create tooltip
    chart.call(toolTip);

    chart.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", function(data, index) {
            return xLinearScale(data.poverty)
        })
        .attr("cy", function(data, index) {
            return yLinearScale(data.phys_act)
        })
        .attr("r", "15")
        .attr("fill", "lightblue")
        // display tooltip on click
        .on("mouseenter", function(data) {
            toolTip.show(data);
        })
        // hide tooltip on mouseout
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    // Appending a label to each data point
    chart.append("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .selectAll("tspan")
        .data(healthData)
        .enter()
        .append("tspan")
        .attr("x", function(data) {
            return xLinearScale(data.poverty - 0);
        })
        .attr("y", function(data) {
            return yLinearScale(data.phys_act - 0.2);
        })
        .text(function(data) {
            return data.abbr
        });

    // Append an SVG group for the xaxis, then display x-axis 
    chart
        .append("g")
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // Append a group for y-axis, then display it
    chart.append("g").call(leftAxis);

    // Append y-axis label
    chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .attr("class", "axis-text")
        .text("Physically Active (%)")

    // Append x-axis labels
    chart
        .append("text")
        .attr(
            "transform", "translate(" + width / 2 + " ," + (height + chartMargin.top + 30) + ")"
        )
        .attr("class", "axis-text")
        .text("In Poverty (%)");
});