const beeswarmMargin = (
    {
    top: 150, right: 60, bottom: 100, left: 60
}

);

const beeswarmAspectRatio = 0.5;

function getBeeswarmWidth() {
  return document.getElementById("beeswarm-container").clientWidth - beeswarmMargin.left - beeswarmMargin.right;
}


let beeswarmWidth = getBeeswarmWidth();
let beeswarmHeight = beeswarmWidth * beeswarmAspectRatio;

const beeswarmSvg = d3.select("#beeswarm")
    .append("svg")
        .attr("width", beeswarmWidth + beeswarmMargin.left + beeswarmMargin.right)
        .attr("height", beeswarmHeight)
    .append("g")
        .attr("transform", `translate(${beeswarmMargin.left}, ${beeswarmMargin.top})`);

// Loading the data
d3.csv("./show_data_for_beeswarm.csv", d => ({
    group: d.laugh_track_category,
    year: +d.year,
    label: d.title,
    size: +d.rating

})).then(data => {
    console.log(data[0]);
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, beeswarmWidth]);

    const radiusScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.size))
        .range([10,12]);

    const groups = ["studio_audience", "canned_laugh_track", "no_added_laughter"];
    const colorPalette = ["#EEAC4B", "#407980", "#A52422"];

    const colorScale = d3.scaleOrdinal()
        .domain(groups)
        .range(colorPalette);

    const groupOrder = { studio_audience: 0, no_added_laughter: 1, canned_laugh_track: 2};

    data.sort((a, b) => groupOrder[a.group] - groupOrder[b.group]);

    const simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(d => xScale(d.year)).strength(1))
        .force("y", d3.forceY(beeswarmHeight / 2).strength(1))
        .force("collide", d3.forceCollide(d => radiusScale(d.size) * 0.5)
            .iterations(3))
        .stop();

    for (let i=0; i < 400; i++) simulation.tick();
    console.log(data[0]);

     beeswarmSvg.selectAll(".dot")
        .data(data)
        .join("circle")
        .attr("class", "dot")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => radiusScale(d.size))
        .attr("fill", d => colorScale(d.group))
        .attr("fill-opacity", 0.75)
        .attr("stroke", "#FFF9F0")
        .attr("stroke-width", 0.5);

      // Show tooltip when hovering over circle
      const tooltip = d3.select("#tooltip");
      beeswarmSvg.selectAll(".dot")
        .on("mouseenter", function(event, d){
            d3.select(this)
                .attr("fill-opacity", 1)
                .attr("r", d => radiusScale(d.size) * 3)
            d3.select(this).raise();
        })
        .on("mousemove", function(event, d) {
            tooltip.html(`Show: <strong>${d.label}</strong><br>
                    Year: <strong>${d.year}</strong><br>`)
                .style("left", (event.pageX + 12) + "px")
                .style("top", (event.pageY - 12) + "px")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "6px")
                .style("padding", "10px")
                .style("opacity", 0.9);
    })
        .on("mouseout", function() {
            d3.select(this).lower();
            d3.select(this)
                .attr("fill-opacity", 0.55)
                .attr("r", d => radiusScale(d.size));
            tooltip.style("opacity", 0);
        });

    const xAxis = d3.axisBottom(xScale)
        .ticks(15)
        .tickFormat(d3.format("d"));
    
    beeswarmSvg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${beeswarmHeight - beeswarmMargin.top - beeswarmMargin.bottom})`)
        .call(xAxis)
        .style("font-size", "14px")

    beeswarmSvg.append("text")
        .attr("class", "chart-title")
        .attr("x", beeswarmWidth / 2)
        .attr("y", -beeswarmMargin.top / 2 -40)
        .attr("text-anchor", "middle")
        .style("font-size", "36px")
        .style("font-weight", "bold")
        .text("Laugh Track Usage Over the Past 75 Years");
    
    beeswarmSvg.append("text")
        .attr("class", "chart-subtitle")
        .attr("x", beeswarmWidth / 2)
        .attr("y", -beeswarmMargin.top / 2 + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("fill", "#1D1E2C")
        .text("Each dot represents a Top 30 broadcast television sitcom between 1950 and 2025. Hover to explore the data.");

    // Legend
    const legendY = -beeswarmMargin.top / 2 + 60;

    const legendData = [
        { label: "Studio Audience", color: colorScale("studio_audience") },
        { label: "Canned Laugh Track", color: colorScale("canned_laugh_track") },
        { label: "No Added Laughter", color: colorScale("no_added_laughter") }
    ];

    //legend group
    const legend = beeswarmSvg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, ${legendY})`);

    let xOffset = 0;

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

});