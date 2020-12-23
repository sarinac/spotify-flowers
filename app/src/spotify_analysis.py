"""Class for making Spotify Web API calls."""
from spotipy import Spotify
from spotipy.oauth2 import SpotifyClientCredentials
from src import SPOTIPY_CLIENT_ID, SPOTIPY_CLIENT_SECRET
import pandas as pd

PITCHES_LIST = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
]


class SpotifyAnalysis:
    def __init__(self):
        """Create Spotify API client."""
        self.spotify = Spotify(
            auth_manager=SpotifyClientCredentials(
                client_id=SPOTIPY_CLIENT_ID, client_secret=SPOTIPY_CLIENT_SECRET,
            ),
        )

        self.search_results = None
        self.sections = None
        self.bars = None
        self.segments = None
        self.pitches = None
        self.bars_to_sections = None
        self.pitches_to_bars = None
        self.number_sections = None
        self.number_bars = None

    def search(self, query: str):
        """Use Spotify's search API to retrieve an item.

        Parameters
        ----------
        query : str
            Name of track
        """
        try:
            results = self.spotify.search(q=query, type=["track"], limit=1)
            self.search_results = results["tracks"]["items"][0]
        except:
            self.search_results = {}

    def search_track(self):
        """Get track name from Search API.

        Returns
        ----------
        str
            Name of track
        """
        try:
            return self.search_results["name"]
        except:
            return ""

    def search_artist(self):
        """Get artist name from Search API.

        Returns
        ----------
        str
            Name of artist
        """
        try:
            return self.search_results["artists"][0]["name"]
        except:
            return ""

    def search_uri(self):
        """Get uri name from Search API.

        Returns
        ----------
        str
            Name of uri
        """
        try:
            return self.search_results["uri"]
        except:
            return ""

    def get_results(self, uri: str):
        """Get transformed results from Spotify audio analysis.

        Parameters
        ----------
        uri : str
            Track's Spotify ID

        Returns
        -------
        str
            JSON for d3.js
        """
        try:
            results = self.spotify.audio_analysis(uri)
        except:
            return {}

        # Parse results
        self.sections = self.get_sections(results)
        self.bars = self.get_bars(results)
        self.segments = self.get_segments(results)

        # Create mappings
        self.pitches = self.get_pitches()
        self.bars_to_sections = self.map_bars_to_sections()
        self.pitches_to_bars = self.map_pitches_to_bars()

        # Generate JSON
        return self.generate_json()

    def get_sections(self, results: str) -> pd.DataFrame:
        """Get all sections of a track.

        Parameters
        ----------
        results : str
            Response from Spotify Audio Analysis

        Returns
        -------
        pd.DataFrame
            Sections of track
        """
        sections = pd.DataFrame(results["sections"]).reset_index()
        sections.start.fillna(0, inplace=True)
        sections["end"] = sections["start"] + sections["duration"]
        sections.columns = sections.columns.str.lower() + "_sections"
        return sections

    def get_bars(self, results: str) -> pd.DataFrame:
        """Get all bars of a track.

        Parameters
        ----------
        results : str
            Response from Spotify Audio Analysis

        Returns
        -------
        pd.DataFrame
            Bars of track
        """
        bars = pd.DataFrame(results["bars"]).reset_index()
        bars["end"] = bars["start"] + bars["duration"]
        bars.columns = bars.columns.str.lower() + "_bars"
        return bars

    def get_segments(self, results: str) -> pd.DataFrame:
        """Get all segments of a track.

        Parameters
        ----------
        results : str
            Response from Spotify Audio Analysis

        Returns
        -------
        pd.DataFrame
            Segments of track
        """
        segments = pd.DataFrame(results["segments"])
        segments.start.fillna(0, inplace=True)
        segments.columns = segments.columns.str.lower() + "_segments"
        return segments

    def get_pitches(self) -> pd.DataFrame:
        """Get all pitches of a track.

        Returns
        -------
        pd.DataFrame
            Pitches of track
        """
        # Check that segments exists
        if type(self.segments) != pd.DataFrame:
            return None

        pitches = []
        for i in list(self.segments.index):
            pitches.append(
                [self.segments.iloc[i]["start_segments"]]
                + [self.segments.iloc[i]["duration_segments"]]
                + self.segments.iloc[i]["pitches_segments"]
            )

        pitches = pd.DataFrame(
            pitches, columns=["start_pitches", "duration_pitches",] + PITCHES_LIST,
        )

        pitches["end_pitches"] = pitches["start_pitches"] + pitches["duration_pitches"]

        return pitches

    def map_bars_to_sections(self) -> pd.DataFrame:
        """Map from bar to section.

        Returns
        -------
        pd.DataFrame
            Bar index to Section index
        """
        # Check that bars and sections exist
        if type(self.bars) != pd.DataFrame or type(self.sections) != pd.DataFrame:
            return None

        # Make copies
        bars = self.bars.copy()
        sections = self.sections.copy()

        # Cartesian join sections and bars
        bars["join"] = 1
        sections["join"] = 1
        x_join = pd.merge(bars, sections, how="outer", left_on="join", right_on="join",)

        # Filter where START bars occur before END sections
        x_join = x_join[x_join.start_bars <= x_join.end_sections]

        # Create bars_to_sections mapping
        bars_to_sections = (
            x_join.groupby("index_bars").min()["index_sections"].reset_index()
        )

        # Create sectioned_bar field
        bars_to_sections = bars_to_sections.merge(
            bars_to_sections.groupby("index_sections").min().reset_index(),
            left_on="index_sections",
            right_on="index_sections",
            suffixes=("", "_min"),
        )
        bars_to_sections["sectioned_bar"] = (
            bars_to_sections.index_bars - bars_to_sections.index_bars_min
        )

        # Drop unneeded column
        bars_to_sections.drop(columns=["index_bars_min"], inplace=True)

        return bars_to_sections

    def map_pitches_to_bars(self) -> pd.DataFrame:
        """Map from pitch to bar.

        Returns
        -------
        pd.DataFrame
            Pitch index to Bar index
        """
        # Check that pitches and bars exist
        if type(self.pitches) != pd.DataFrame or type(self.bars) != pd.DataFrame:
            return None

        # Make copies
        pitches = self.pitches.copy()
        bars = self.bars.copy()

        # Cross join pitches and bars
        pitches["join"] = 1
        bars["join"] = 1
        x_join = pd.merge(pitches, bars, how="outer", left_on="join", right_on="join",)

        # Filter where START pitches occur before END bars
        x_join = x_join[x_join.start_pitches <= x_join.end_bars]

        # Create pitches_to_bars mapping
        pitches_to_bars = pd.DataFrame(
            x_join.groupby("start_pitches").min()["end_bars"]
        ).reset_index()

        return pitches_to_bars

    def flowers_etl(self) -> pd.DataFrame:
        """Count number of bars (petals) per section (flower).

        Returns
        -------
        pd.DataFrame
            Sections with number of bars
        """
        # Check that sections and bars exist
        if (
            type(self.sections) != pd.DataFrame
            or type(self.bars_to_sections) != pd.DataFrame
        ):
            return None

        sections = self.sections.copy()
        bars_to_sections = self.bars_to_sections.copy()

        # Count number of bars in each section
        bar_count = (
            pd.merge(
                bars_to_sections,
                sections,
                left_on="index_sections",
                right_on="index_sections",
            )
            .groupby("index_sections")
            .count()
            .iloc[:, 0]
        )

        # Check that bars have the same number of sections, otherwise trim sections
        difference = sections.shape[0] - len(bar_count)
        sections = sections.iloc[0 : sections.shape[0] - difference]

        df_flowers = pd.DataFrame(
            {
                "index_sections": list(sections.index),
                "start_sections": sections["start_sections"],
                "end_sections": sections["start_sections"]
                + sections["duration_sections"],
                "duration_sections": sections["duration_sections"],
                "loudness_sections": sections["loudness_sections"],
                "confidence_sections": sections["confidence_sections"],
                "num_bars_sections": bar_count.values,
                "key_sections": sections["key_sections"],
            }
        )

        # Count number of sections and bars
        self.number_sections = df_flowers.shape[0]
        self.number_bars = (
            df_flowers[["index_sections", "num_bars_sections"]].sum().num_bars_sections
        )

        return df_flowers

    def notes_etl(self) -> pd.DataFrame:
        """Map all pitches to bars and sections.

        Returns
        -------
        pd.DataFrame
            Pitches with bar and section data
        """
        # Check that pitches, pitches_to_bars, bars, bars_to_sections exist
        if (
            type(self.pitches) != pd.DataFrame
            or type(self.pitches_to_bars) != pd.DataFrame
            or type(self.bars) != pd.DataFrame
            or type(self.bars_to_sections) != pd.DataFrame
        ):
            return None

        # Make copies
        pitches = self.pitches.copy()
        pitches_to_bars = self.pitches_to_bars.copy()
        bars = self.bars.copy()
        bars_to_sections = self.bars_to_sections.copy()

        # Join bars with pitches table
        df_notes = (
            pitches.merge(
                pitches_to_bars,
                how="inner",
                left_on="start_pitches",
                right_on="start_pitches",
            )
            .merge(bars, how="inner", left_on="end_bars", right_on="end_bars")
            .merge(bars_to_sections, left_on="index_bars", right_on="index_bars")
        )

        df_notes = df_notes[
            [
                "index_sections",
                "index_bars",
                "start_bars",
                "duration_bars",
                "sectioned_bar",
                "start_pitches",
                "duration_pitches",
                "end_pitches",
            ]
            + PITCHES_LIST
        ]

        return df_notes

    def generate_json(self):
        """Generate JSON used for d3.js

        Returns
        -------
        str
            JSON of results
        """
        df_flowers = self.flowers_etl()
        df_notes = self.notes_etl()

        df = df_flowers.merge(
            df_notes, left_on="index_sections", right_on="index_sections"
        )

        json = []
        for index, row in df_flowers.iterrows():

            flowers = {}

            for col in list(df_flowers.columns):

                flowers[col] = row[col]

            notes = []
            for index, row in df_notes[
                df_notes["index_sections"] == row["index_sections"]
            ].iterrows():
                n = {}
                for col in list(df_notes.columns):
                    n[col] = row[col]
                notes.append(n)

            flowers["notes"] = notes

            json.append(flowers)

        return json
