
import Flowers from "./flowers.js"
import Validations from "./validations.js"
import Legend from "./legend.js"


if(Validations.check(data)) {

    // Show loader when rendering image
    d3.select("div.loader").classed("hidden", false);

    // Check data types
    Validations.convertTypes(data);

    // Draw
    new Flowers(data);

    // Legend
    Legend.drawLegend();
} 