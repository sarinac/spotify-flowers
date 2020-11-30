const pitches = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]; 

const Validations = {

    /** 
     * Check that data is not empty
     * @param {object} data - data to be used for visualization
     */
    check: (data) => {
        return Object.entries(data).length > 0;
    },

    /** 
     * Check data types
     * @param {object} data - data to be used for visualization
     */
    convertTypes: (data) => {
        
        for(var i = 0; i < data.length; i++) { 
            data[i].index_sections = +data[i].index_sections; // numeric
            data[i].start_sections = +data[i].start_sections; // numeric
            data[i].end_sections = +data[i].end_sections; // numeric
            // duration_sections
            data[i].loudness_sections = +data[i].loudness_sections; // numeric
            data[i].confidence_sections = +data[i].confidence_sections; // numeric
            data[i].num_bars_sections = +data[i].num_bars_sections; // numeric
            data[i].key_sections = +data[i].key_sections; // numeric
            // index_bars
            
            // Convert data types in notes
            for(var j = 0; j < data[i].notes.length; j++) { 
                // index_sections
                data[i].notes[j].num_bars_sections = +data[i].num_bars_sections; // numeric
                data[i].notes[j].index_bars = +data[i].notes[j].index_bars; // numeric
                data[i].notes[j].start_bars = +data[i].notes[j].start_bars; // numeric
                data[i].notes[j].duration_bars = +data[i].notes[j].duration_bars; // numeric
                data[i].notes[j].sectioned_bar = +data[i].notes[j].sectioned_bar; // numeric
                data[i].notes[j].start_pitches = +data[i].notes[j].start_pitches; // numeric
                data[i].notes[j].duration_pitches = +data[i].notes[j].duration_pitches; // numeric
                // end_pitches
                pitches.forEach(pitch => {
                    data[i].notes[j][pitch] = +data[i].notes[j][pitch]; // numeric
                });
            };
        };
    },
};

export default Validations;