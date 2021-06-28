if( "function" === typeof importScripts) {
    importScripts("https://d3js.org/d3.v4.min.js");

    onmessage = (event) => { 

        // scale for petal size
        let petalSizeScale = d3.scaleQuantize()
            .domain([d3.min(event.data.notes, d => d.loudness_sections), 0])
            .range([25, 20, 18, 15, 12, 10].map(d => Math.min(event.data.width, event.data.height) / d));

         // Simulation
        var simulation = d3.forceSimulation(event.data.notes).alphaDecay(0.01)
            .force("collide", d3.forceCollide().radius(d => (1 + Math.random() * .2) * petalSizeScale(d.loudness_sections)))
            .force("x", d3.forceX().x(d => d.startX).strength(.5))
            .stop();

        // Tick messages
        for (
            let i = 0, 
            n = Math.ceil(Math.log(simulation.alphaMin()) 
                / Math.log(1 - simulation.alphaDecay()));
            i < n / 2; 
            ++i
        ) {
            simulation.tick();
        };

        // Simulation
        simulation
            .force("x", d3.forceX().x(event.data.width/2).strength(.2))
            .force("y", d3.forceY().y(event.data.height/4).strength(.5))
            .alpha(.5)
            .restart();

        // Tick messages
        for (
            let i = 0, 
            n = Math.ceil(Math.log(simulation.alphaMin()) 
                / Math.log(1 - simulation.alphaDecay()));
            i < n; 
            ++i
        ) {
            simulation.tick();
        };

        // Post message back
        postMessage({notes: event.data.notes});
    }    
}