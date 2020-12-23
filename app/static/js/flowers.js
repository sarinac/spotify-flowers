import Helpers from  "./helpers.js"

class Flowers {

    constructor(data) {
        this.data = data;
        this.draw();
    }

    draw() {

        // define SVG dimensions
        this.width = 700,
        this.height = 800,
        this.threshold = .55, 
        this.padding = 20;

        // create SVG
        this.svg = d3.select("#petal-chart")
            .append("svg")
                .classed("hidden", true)
                .attr("id", "svg")
                .attr("width", this.width)
                .attr("height", this.height);

        // create defs
        this.defs = this.svg.append("defs");
        this.createFilters();

        // preprocessing
        this.createScales();
        this.mapData();

        // draw vase
        this.vase = this.svg.append("g").classed("vase", true);
        this.drawVase();

        // create bouquet (change to forces/positions + stems + vase)
        this.bouquet = this.svg.append("g").classed("bouquet", true);
        this.drawFlowers();

    }

    createFilters() {

        // create glow
        const strokeFilter = this.defs
            .append("filter")
                .attr("id", "glow")
                .attr("x", "-100%")
                .attr("y", "-100%")
                .attr("height", "300%")
                .attr("width", "300%");

        strokeFilter
            .append("feGaussianBlur")
                .attr("stdDeviation", 6)
                .attr("result", "strokeBlur")
                .attr("in", "SourceGraphic");      

        const strokeFilterMerge = strokeFilter
            .append("feMerge");

        strokeFilterMerge
            .append("feMergeNode")
                .attr("in","coloredBlur");

        strokeFilterMerge
            .append("feMergeNode")
                .attr("in","SourceGraphic");

        // create blur
        this.defs
            .append("filter")
                .attr("id", "motionFilter")         
                .append("feGaussianBlur")
                    .attr("in", "SourceGraphic")
                    .attr("stdDeviation", 4);

        // create fill gradient
        this.defs
            .append("linearGradient")
                .attr("id", "fill-gradient")
                .attr("gradientTransform", "rotate(60)")
                .attr("x1", "0%")
                .attr("x2", "100%")
                .attr("y1", "0%")
                .attr("y2", "50%")
                .selectAll("stop")
                .data([
                    {offset: "0%", color: "#000"},
                    {offset: "100%", color: "#fff"},
                ])
                .enter()
                .append("stop")
                    .attr("offset", function(d) { return d.offset; })
                    .attr("stop-color", function(d) { return d.color; });

    }

    createScales() {
        
        // scale for petal size
        this.petalSizeScale = d3.scaleQuantize()
            .domain([d3.min(this.data, d => d.loudness_sections), 0])
            .range([25, 20, 18, 15, 12, 10].map(d => Math.min(this.width, this.height) / d));
    
        // scale for flower shapes
        this.flowerShapeScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.confidence_sections), d3.max(this.data, d=> d.confidence_sections)])
            .range([.7, 1]);

        // scale for flower stems
        // each stem will take up .005 width
        this.flowerStemScale = d3.scaleLinear()
            .domain([0, this.data.length - 1])
            .range([this.width * (.5 - .005 * this.data.length / 2), this.width * (.5 + .005 * this.data.length / 2)]);

        // start position for flowers
        this.flowerStartX = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.index_sections)])
            .range([this.padding + this.petalSizeScale(0), this.width - this.petalSizeScale(0)]);
        
    }

    mapData() {

        // Draw skeleton for petals
        this.data.map(d => {

            // Make the flower shapes
            var petalLength = this.petalSizeScale(d.loudness_sections),
                petalHandle = petalLength * (this.flowerShapeScale(d.confidence_sections)),
                petalWidth = petalHandle 
                    * Math.sin(180 / d.num_bars_sections * Math.min(d.num_bars_sections-1, d.num_bars_sections+1) * Math.PI / 180)
                    * Math.sin(0.5 * Math.PI);
            
            // create path
            d.petalPath = [
                "M0,0",
                "C0,0 " + petalWidth + "," + petalHandle + " 0," + petalLength,
                "C0," + petalLength + " -" + petalWidth + "," + petalHandle +" 0,0",
                "Z"
            ].join(" ");

            // create radius, width, handle
            d.petalLength = petalLength; // radius 
            d.petalWidth = petalWidth; // width
            d.petalHandle = petalHandle; // handle

            return d;
        });

    }

    drawVase() {

        let path = [
            `M${this.flowerStemScale(-8)},${this.height * this.threshold} `,
            `L${this.flowerStemScale(this.data.length - 1 + 8)},${this.height * this.threshold} `,
            `C${this.flowerStemScale(this.data.length - 1 + 2)},${this.height * (this.threshold + (1 - this.threshold) * .15)} `,
                `${this.flowerStemScale(this.data.length - 1 + 2)},${this.height * (this.threshold + (1 - this.threshold) * .25)} `, 
                `${this.flowerStemScale(this.data.length - 1 + 8)},${this.height * (this.threshold + (1 - this.threshold) * .40)} `,
            `S${this.flowerStemScale(this.data.length - 1 + 13)},${this.height * (this.threshold + (1 - this.threshold) * .80)} `, 
                `${this.flowerStemScale(this.data.length - 1 + 3)},${this.height - this.padding} `,
            `L${this.flowerStemScale(-3)},${this.height - this.padding} `,
            `C${this.flowerStemScale(-13)},${this.height * (this.threshold + (1 - this.threshold) * .80)} `,
                `${this.flowerStemScale(-13)},${this.height * (this.threshold + (1 - this.threshold) * .55)} `, 
                `${this.flowerStemScale(-8)},${this.height * (this.threshold + (1 - this.threshold) * .40)} `,
            `S${this.flowerStemScale(-2)},${this.height * (this.threshold + (1 - this.threshold) * .15)} `, 
                `${this.flowerStemScale(-8)},${this.height * this.threshold} `,
            "Z"
        ].join(" ");

        this.vase
            .append("path")
            .attr("d", path)
            .attr("fill", "url(#fill-gradient)");

    }

    drawFlowers() {

        const flowerMoveX = d => {
            return Math.min(
                Math.max(
                    this.padding + this.petalSizeScale(d.loudness_sections)
                    , d.x
                )
                , this.width - this.padding - this.petalSizeScale(d.loudness_sections)
            )
        };

        const flowerMoveY = d => {
            return Math.min(
                Math.max(
                    this.padding + this.petalSizeScale(d.loudness_sections)
                    , d.y
                ), this.height - this.padding - this.petalSizeScale(d.loudness_sections)
            )
        };

        const drawStemPath = (d, start) => {
            let x = start ? 0 : flowerMoveX(d),
                y = start ? 0 : flowerMoveY(d);
            return [
                `M${this.flowerStemScale(d.index_sections)},${this.height - this.padding*2}`,
                `L${this.flowerStemScale(d.index_sections)},${this.height * 0.7}`,
                `C${this.flowerStemScale(d.index_sections)},${this.height * 0.5}`,
                `${
                    this.flowerStemScale(d.index_sections) < x // if curving right
                    ? this.flowerStemScale(d.index_sections) + (x - this.flowerStemScale(d.index_sections)) * .5
                    : x + (this.flowerStemScale(d.index_sections) - x) * .5
                },${this.height * 0.5 + (y - this.height * 0.5) * .8}`,
                `${x},${y}`,
            ].join(" ")
        };

        this.stems = this.bouquet
            .append("g")
                .selectAll("g")
                .data(this.data)
                .enter()
                .append("g")
                    .classed("stem", true)
                    .append("path")
                        .attr("d", d => drawStemPath(d, true));

        this.flowers = this.bouquet
            .append("g")
                .selectAll("g")
                .data(this.data)
                .enter()
                .append("g")
                    .classed("flower", true);

        var iteration = 1;
        var simulation = d3.forceSimulation(this.data).alphaDecay(0.01)
            .force("x", d3.forceX().x(d => this.flowerStartX(d.index_sections)).strength(.5))
            .force("collide", d3.forceCollide().radius(d => this.petalSizeScale(d.loudness_sections)*1.2)) // Avoid overlapping
            .on("tick", () => {
                if (simulation.alpha() > 0.1) {
                    // continue running simulation
                    this.flowers
                        .attr("transform", d => `translate(${flowerMoveX(d)},${flowerMoveY(d)})`);
                    this.stems
                        .attr("d", d => drawStemPath(d, false));
                } else if (iteration == 1) {
                    // restart simulation with new forces
                    simulation.alpha(.5).restart();
                    simulation
                        .force("center", d3.forceCenter().x(this.width/2).y(this.height/4))
                        .force("x", d3.forceX().x(this.width/2).strength(.2))
                        .force("y", d3.forceY().y(this.height/4).strength(.5));
                    iteration = 2;
                } else {
                    // stop simulation
                    simulation.stop();
                    // run the remaining steps for drawing flower (this has heavy computation and should run AFTER simulation)
                    this.createBackgrounds();
                    this.createColors();
                    this.createOutlines();
                    this.svg.classed("hidden", false);
                    d3.select("div.loader").classed("hidden", true);
                };
            });

    }

    createBackgrounds() {

        // make clipping mask
        this.flowers
            .append("g")
                .classed("petal-mask", true)
                .selectAll("path.petal")
                .data(flower => Helpers.f2p(flower))
                .enter()
                .append("clipPath")
                    .attr("id", d => "petal-clip-" + d.index_sections) 
                    .append("path")
                        .attr("transform", (d,i) => `rotate(${360 / d.petals * i})`)
                        .attr("d", d => d.petalPath);

        // fill in background
        this.flowers
            .append("g")
                .classed("petal-background", true)
                .selectAll("path.petal")
                .data(flower => Helpers.f2p(flower))
                .enter()
                .append("path")
                    .attr("transform", (d,i) => `rotate(${360 / d.petals * i})`)
                    .attr("d", d => d.petalPath);

    }

    createColors() {

        let pitches = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; 

        let flowersColor = this.flowers
            .append("g")
                .classed("petal-color", true);

        for(var index=0; index < pitches.length; index++) {

            let pitch = pitches[index];
            let color = Helpers.pickColor(pitch); 
    
            flowersColor
                .append("g")
                    .classed("petal-color-" + pitch, true)
                    .selectAll("circle")
                    .data(flower => Helpers.f2p(flower))
                    .data(flower => {
                        // Transfer flower attributes to notes
                        flower.notes.forEach(e =>{
                            e.petalLength = flower.petalLength;
                            e.petalWidth = flower.petalWidth;
                            e.petalHandle = flower.petalHandle;
                            e.index_sections = flower.index_sections
                        })
                        return flower.notes;
                    })
                    .enter()
                    .append("circle")
                        .filter(d => d[pitch] > 0.8) // Intensity > 80%
                        .attr("transform", d => `rotate(${360 / d.num_bars_sections * d.sectioned_bar})`)
                        .attr("r", d => (0.75 * (d.duration_pitches / d.duration_bars) * d.petalLength))
                        .attr("cx", d => Helpers.bezierCurve(d) * (pitches.length / 2 - index) / pitches.length)
                        .attr("cy", d => ((d.start_pitches - d.start_bars + (d.duration_pitches / 2)) / d.duration_bars) * d.petalLength)
                        .attr("fill", color)
                        .attr("clip-path", d => `url(#petal-clip-${d.index_sections})`)
                        .style("filter", "url(#motionFilter)");
        };
    }

    createOutlines() {

        // draw outer petals
        this.flowers
            .append("g")
                .classed("petals-outer", true)
                .selectAll("path.petal")
                .data(flower => Helpers.f2p(flower))
                .enter()
                .append("path")
                    .attr("transform", (d,i) => `rotate(${360 / d.petals * i})`)
                    .attr("d", d => d.petalPath);

        // draw inner petals
        this.flowers
            .append("g")
                .classed("petals-inner", true)
                .selectAll("path.petal")
                .data(flower => Helpers.f2p(flower))
                .enter()
                .append("path")
                    .attr("transform", (d,i) => `rotate(${360 / d.petals * i})`)
                    .attr("d", d => d.petalPath)
                    .style("filter", "url(#glow)");
    }
};

export default Flowers;