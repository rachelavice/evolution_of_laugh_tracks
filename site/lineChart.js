const margin = ({top: 200, right: 40, bottom: 150, left: 120});

function getWidth() {
  return document.getElementById("line-chart-main").clientWidth - margin.left - margin.right;
}

const aspectRatio = 0.4;

let width = getWidth();
let height = width * aspectRatio;

//set up x and y scales
const x = d3.scaleLinear()
    .range([0, width]);

const y = d3.scaleLinear()
    .range([height, 0]);

// Add line generator
const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.percentage))

// color palette
const groups = ["studio_audience", "canned_laugh_track", "no_added_laughter"];
const colorPalette = ["#EEAC4B", "#407980", "#A52422"];
const colorScale = d3.scaleOrdinal()
    .domain(groups)
    .range(colorPalette);

let svg;

//load the data
d3.csv("./percentage_laugh_track_cat_per_year.csv").then(function(data) {
    const aggData = data.map(d => ({
        year: +d.year,
        canned_laugh_track: +d.canned_laugh_track,
        studio_audience: +d.studio_audience,
        no_added_laughter: +d.no_added_laughter
    }))

    const aggDataLong = []
    aggData.forEach(row => {
        aggDataLong.push({year: row.year, category: "studio_audience", percentage: row.studio_audience});
        aggDataLong.push({year: row.year, category: "canned_laugh_track", percentage: row.canned_laugh_track});
        aggDataLong.push({year: row.year, category: "no_added_laughter", percentage: row.no_added_laughter});
    });

    x.domain(d3.extent(data, d => d.year));
    y.domain([0, 100])
    

    // append the svg object to the body of the page
    svg = d3.select("#line-chart-main")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add x axis
    const xAxis = d3.axisBottom(x).ticks(15).tickFormat(d3.format("d"));
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .style("font-size", "14px")
        .call(xAxis);
    
    // Add y axis
    svg.append("g").style("font-size", "14px").call(d3.axisLeft(y));

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .style("fill", "#1D1E2C")
        .text("The Evolution of Laugh Track Usage Over the Years");

    svg.append("text")
        .attr("class", "y-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Percentage of Shows per Category");

    // Legend
    const legendY = -margin.top / 2 + 40;

    const legendData = [
        { label: "Studio Audience", color: colorScale("studio_audience") },
        { label: "Canned Laugh Track", color: colorScale("canned_laugh_track") },
        { label: "No Added Laughter", color: colorScale("no_added_laughter") }
    ];

    // Create the legend group
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, ${legendY})`);

    let xOffset = 0;

// Add one group per legend item
    legendData.forEach(d => {
        const item = legend.append("g")
            .attr("transform", `translate(${xOffset}, 0)`);

        item.append("circle")
            .attr("r", 8)
            .attr("cy", 0)
            .style("fill", d.color);

        item.append("text")
            .attr("x", 15)
            .attr("y", 5)
            .style("font-size", "16px")
            .text(d.label);

        // Measure this item's width and add spacing
        xOffset += item.node().getBBox().width + 30;
    });

    // Center the entire legend
    const legendWidth = legend.node().getBBox().width;

    legend.attr(
        "transform",
        `translate(${(width - legendWidth) / 2}, ${legendY})`
    );
    
   //function for each line chart
    groups.forEach(category => {
        const categoryData = aggDataLong.filter(d => d.category === category);
        svg.append("path")
            .attr("class", "line-path")
            .attr("data-category", category)
            .attr("fill", "none")
            .attr("stroke", colorScale(category))
            .attr("stroke-width", 1)
            .attr("opacity", 0.25)
            .attr("d", line(categoryData));
    });
});
function emphasizeLineChart(category) {
    d3.selectAll(".line-path")
        .transition()
        .duration(500)
        .attr("stroke-width", function() {
            return this.dataset.category === category ? 2: 1;
        })
        .attr("opacity", function() {
            return this.dataset.category === category ? 1: 0.25;
        });

}


  



