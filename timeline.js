const timelineMargin = ({top: 70, right: 40, bottom: 0, left: 40});

function getTimelineWidth() {
  return document.getElementById("timeline-axis").clientWidth - timelineMargin.left - timelineMargin.right;
}

timelineAspectRatio = .68;

let timelineWidth = getTimelineWidth();
let timelineHeight = timelineWidth * timelineAspectRatio;

// create svg element
const timelineSvg = d3.select("#timeline-axis")
  .append("svg")
    .attr("width", timelineWidth + timelineMargin.left + timelineMargin.right)
    .attr("height", timelineHeight + timelineMargin.top + timelineMargin.bottom);

// Create the scale

const xScale = d3.scaleLinear()
        .domain([1950, 2025])
        .range([0, timelineWidth]);

const xAxis = d3.axisBottom(xScale)
        .ticks(15)
        .tickFormat(d3.format("d"));
    
timelineSvg.append("g")
    .attr(
        "transform",
        `translate(${timelineMargin.left}, ${timelineMargin.top + timelineHeight / 2})`
    )
    .call(xAxis)
    .style("font-size", "14px");

timelineSvg.append("text")
    .attr("class", "chart-title")
    .attr("x", (timelineWidth + timelineMargin.left + timelineMargin.right) / 2)
    .attr("y", 130)
    .attr("text-anchor", "middle")
    .style("font-size", "36px")
    .style("font-weight", "bold")
    .style("fill", "#1D1E2C")
    .text("The Rise and Fall of the Laugh Track");

// Add 1 circle for the group B:
const axisY = timelineMargin.top + timelineHeight / 2;
const gap = 20;

d3.selectAll(".timeline-event")
  .style("left", function() {
    const year = +d3.select(this).attr("event-year");
    return `calc(${xScale(year) + timelineMargin.left}px - 117px)`;
  })
  .style("top", function() {
    const position = d3.select(this).attr("event-position");
    if (position === "below") {
      return (axisY + gap) + "px";
    } else {
      return null; // let "above" use bottom instead, see below
    }
  })
  .style("bottom", function() {
    const position = d3.select(this).attr("event-position");
    return position === "above" ? (timelineHeight - axisY + gap) + "px" : null;
  });

  const eventOrder = ["laff-box", "canned", "groucho", "studio", "silence"];

  function showTimelineEventsUpTo(eventName) {
    const idx = eventOrder.indexOf(eventName);
    d3.selectAll(".timeline-event").each(function() {
      const el = d3.select(this);
      const thisIdx = eventOrder.indexOf(el.attr("data-event"));
      el.classed("is-visible", thisIdx <= idx);
    });
  }
