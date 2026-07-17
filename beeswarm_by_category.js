const height = 500;
const width = 900;
const margin = ({top: 20, right: 50, bottom: 34, left: 40});




// Source - https://stackoverflow.com/a/70630081
// Posted by Shreshth
// Retrieved 2026-07-12, License - CC BY-SA 4.0

Promise.all([
    d3.csv("./percentage_laugh_track_cat_per_year.csv"),
    d3.csv("./show_data_for_beeswarm.csv")
]).then(function([agg_data, show_data]){

  // manipulate data here
    // Loading the aggregate data
  agg_data = agg_data.map(d => ({
    year: +d.year,
    canned_laugh_track: +d.canned_laugh_track,
    studio_audience: +d.studio_audience,
    no_added_laughter: +d.no_added_laughter
  }))
    // Loading the show data
  show_data = show_data.map(d => ({
    group: d.laugh_track_category,
    year: +d.year,
    label: d.title,
    size: +d.rating
  }))
  //build scales
    const xScale = d3.scaleLinear()
    .domain(d3.extent(show_data, d => d.year))
    .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]); 

    const radiusScale = d3.scaleSqrt()
        .domain(d3.extent(show_data, d => d.size))
        .range([8, 15]);  

    const groups = ["studio_audience", "canned_laugh_track", "no_added_laughter"];
    const colorPalette = ["#EEAC4B", "#407980", "#A52422"];

    const colorScale = d3.scaleOrdinal()
        .domain(groups)
        .range(colorPalette);

    const groupOrder = { studio_audience: 0, no_added_laughter: 1, canned_laugh_track: 2};

    show_data.sort((a, b) => groupOrder[a.group] - groupOrder[b.group]);

    // Create tooltip div and make it invisible
    let tooltip = d3.select("#svganchor").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    //get a line for the year by looking up percentages per year
    function getPercentage(year, category) {
        const yearData = agg_data.find(d => d.year === year)
        return yearData[category]
    }

    //draw each chart
    function drawChart(chartCat, filteredShowData, isSingleCat) {
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const simulation = d3.forceSimulation(filteredShowData)
            .force("x", d3.forceX(d => xScale(d.year)).strength(1))
            .force("y", d3.forceY(d => yScale(getPercentage(d.year, d.group))).strength(1))
            .force("collide", d3.forceCollide(d => radiusScale(d.size) * .45)
                .iterations(3))
            .stop();

        const lineGenerator = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.percentage))

        for (let i=0; i < 500; i++) simulation.tick();

        g.selectAll(".dot")
            .data(filteredShowData)
            .join("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", d => radiusScale(d.size))
            .attr("fill", d => colorScale(d.group))
            .attr("fill-opacity", 0.55)
            .attr("stroke", "#FFF9F0")
            .attr("stroke-width", 0.25);

        // Show tooltip when hovering over circle
        const tooltip = d3.select(".tooltip");
        g.selectAll(".dot")
            .on("mousemove", function(event, d) {
                tooltip.html(`Show: <strong>${d.label}</strong><br>
                        Year: <strong>${d.year}</strong><br>`)
                    .style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 12) + "px")
                    .style("opacity", 0.9);
        })
            .on("mouseout", function() {
                tooltip.style("opacity", 0);
            });

        const xAxis = d3.axisBottom(xScale)
            .ticks(15)
            .tickFormat(d3.format("d"));
        
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height - margin.top - margin.bottom + 12})`)
            .call(xAxis)
            .call(axis => axis.select(".domain").remove());

        g.append("path")
            .attr("d", lineGenerator(filteredAggData))
            .attr("stroke", colorScale(categoryName))
            .attr("fill", "none")

    }

    drawChart("all", show_data, false);
})




