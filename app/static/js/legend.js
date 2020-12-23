import Helpers from  "./helpers.js"

const Legend = {

	/** 
     * Draw legend
     */
    drawLegend: () => {

    	let width = 350,
    		height = 80,
    		paddingTop = 30,
    		padding = 10;

    	let pitches = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; 

    	let xScale = d3.scaleLinear()
    		.domain([0, pitches.length])
    		.range([padding + width / pitches.length * .5, width - width / pitches.length * .5 - padding]);
    		
    	let legend = d3.select("#legend")
    		.append("svg")
    			.attr("width", width)
    			.attr("height", height);

    	legend 
    		.append("defs")
            .append("filter")
                .attr("id", "legendMotionFilter")         
                .append("feGaussianBlur")
                    .attr("in", "SourceGraphic")
                    .attr("stdDeviation", 2);
    	legend
    		.append("g")
	    		.selectAll("circle")
	    		.data(pitches)
	    		.enter()
	    		.append("circle")
	    			.attr("cy", (height - paddingTop - padding) / 2 + paddingTop)
	    			.attr("cx", (d, i) => xScale(i))
	    			.attr("r", (height - padding - paddingTop) / 2)
	    			.attr("fill", d => Helpers.pickColor(d))
	    			.style("filter", "url(#legendMotionFilter)");

    	legend 
    		.append("g")
	    		.selectAll("text")
	    		.data(pitches)
	    		.enter()
	    		.append("text")
	    			.attr("x", (d, i) => xScale(i) - width / pitches.length * .4)
	    			.attr("y", height * .75)
	    			.text(d => d);

	    legend 
	    	.append("g")
	    		.append("text")
	    		.text("Pitches Color Scale")
	    		.style("fill", "#fff")
	    		.style("font-weight", "bold")
	    		.attr("x", xScale(0) - width / pitches.length * .6)
	    		.attr("y", paddingTop - 5);

    }
}

export default Legend;