const Helpers = {

    /** 
     * Map key to color
     * @param {string} key - pitch
     * @return {string} HSLA code for the color corresponding to given pitch
     */
    pickColor: (key) => {
        // Saturation: 21%
        // Opacity: 60%
        switch (key) {
            case "C": // Yellow 
                return "hsla(54, 21%, 82%, 60%)";
            case "C#": // Yellow-Green
                return "hsla(90, 21%, 82%, 60%)";
            case "D": // Green
                return "hsla(137, 21%, 78%, 60%)";
            case "D#": // Teal
                return "hsla(162, 21%, 83%, 60%)";
            case "E": // Cyan
                return "hsla(182, 21%, 86%, 60%)";
            case "F": // Blue
                return "hsla(240, 21%, 78%, 60%)";
            case "F#": // Indigo
                return "hsla(268, 21%, 77%, 60%)";
            case "G": // Purple
                return "hsla(288, 21%, 83%, 60%)";
            case "G#": // Magenta
                return "hsla(320, 21%, 84%, 60%)";
            case "A": // Red
                return "hsla(4, 21%, 90%, 60%)";
            case "A#": // Orange
                return "hsla(28, 21%, 80%, 60%)";
            case "B": // Yellow-Orange
                return "hsla(41, 21%, 93%, 60%)"; 
        }
    },

    /** 
     * Calculate the width of the petal at a certain point along the spine
     * @param {object} d - record of flower (index_sections)
     * @return {number} width of petal
     */
    bezierCurve: (d) => {
        // P = (1−t)2P1 + 2(1−t)tP2 + t2P3
        // P1 = (0, 0)
        // P2 = (width, handle)
        // P3 = (0, length)
        // x = (1−t)2 * 0 + 2(1−t)t * 0.5 + t2 * 1 = (1-t)t + t2 = t
        // y = (1−t)2 * 0 + 2(1−t)t * petalWidth + t2 * 0 = 2t(1-t)petalWidth
        let pos = (d.start_pitches - d.start_bars) / d.duration_bars; // pct
        let midpoint = d.petalHandle / d.petalLength; // pct
        let t;
        if (pos <= midpoint) {
            t = pos / midpoint * 0.5;
        } else {
            t = 0.5 + 0.5 * (1 - midpoint) * (pos - midpoint);
        }    
        return 2 * (1 - t) * t * d.petalWidth;
    },

    /** 
     * Map flower to petals (1:many)
     * @param {object} flower - data record of flower (index_sections)
     * @return {Array} dataset of petals
     */
    f2p: (flower) => { 

        var petalMaker = [];
        d3.range(flower.num_bars_sections).forEach(element => {
            petalMaker[element] = {
                "petals": flower.num_bars_sections,
                "index_sections": flower.index_sections,
                "petalPath": flower.petalPath,
                "petalLength": flower.petalLength,
                "petalWidth": flower.petalWidth,
                "petalHandle": flower.petalHandle,
                "notes": flower.notes.filter(d => d.sectioned_bar == element),
            };
        })
        return petalMaker;
    },

};

export default Helpers;