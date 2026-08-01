# The Evolution of Laughter
A data-driven look at what 75 years of broadcast television data tells us about our relationship with comedy, and laughter.

**[Read the piece →](https://rachelavice.github.io/evolution_of_laugh_tracks/)**

## Project Overview

### 

This project looks at the usage of laugh tracks in broadcast television situational comedies (sitcoms) over the past 75 years (1950 to 2025). I initially set out to understand the rise and fall of the laugh track, what I found instead was distinct eras of laugh tracks over the years - canned laughter, then live studio audiences, then, increasingly, silence.

## What I Found

Laugh tracks got their start in the early 1950s with the invention of the Laff Box by Charles Douglass. In the decade to follow the use of "canned laughter" rose, peaking in 1964, then fell off as it was overtaken by the live studio audience.

Sitcoms filmed in front of a live studio audience became the dominant mode for sitcoms over the next three decades, and account for the largest share of top-rated comedies in the datset overall.

Starting in the 2000s, and accellerating sharply after 2019, an increasing share of top-rated comedy television shows stopped adding laughter to the background audio in the shows at all. 

In short, laugh tracks didn't just decline, they were succeeded, first by studio audiences, then by silence.

## Data Collection
 
- **Top-rated television programs by season** — Scraped from [Wikipedia's list of top-rated U.S. television programs by season](https://en.wikipedia.org/wiki/Top-rated_United_States_television_programs_by_season), which compiles the top 30 shows per season year according to Nielsen Media Research, from 1950 through 2025.

- Note: Wikipedia's table is used here as an aggregator of Nielsen's rankings, not as the original source; Nielsen does not publish a single clean, machine-readable historical series. A sample of seasons was spot-checked against Tim Brooks' TV ratings archive as a secondary source, and matched Wikipedia's figures.

- **Genre classification** — Each show was matched against [The Movie Database (TMDB) API](https://developer.themoviedb.org/reference/getting-started) to identify genre, filtering the list down to shows tagged as comedy (TMDB genre_id `35`). Of 655 unique shows on the original list, 595 had genre data returned by TMDB; the remaining ~60 were checked by hand (via a quick web search for each title) and manually coded as comedy or not.

- **Camera format** — Single-camera vs. multi-camera classification was collected via the [Wikipedia API](https://publicapis.io/wikipedia-api), then manually cleaned and corrected.

- **Laugh track classification** — Each comedy was classified into one of three categories using an AI-assisted approach: `canned_laugh_track` (laughter added in post-production, no audience present), `studio_audience` (live laughter recorded and mixed in during production), or `no_added_laughter`.

### Building the classified dataset

1. Scraped the top 30 rated shows per season year (1950–2025) from Wikipedia, handling the table's "carryover" cell structure (where a network cell spanning multiple rows is only present in the first row).
2. Pulled genre data for each show from the TMDB API, filtered to comedy, and manually filled in genre for shows missing from TMDB's results.
3. Pulled camera format (single-cam vs. multi-cam) for each show via the Wikipedia API, then manually cleaned inconsistent or missing values.
4. Classified each show's laugh-track category using an LLM prompted with the show's title, air year, and camera format, plus guidance on known patterns and edge cases.

### Validating the AI classification
5. Hand-coded a random sample of 90 shows (10% of the sample) as ground truth to test the classification prompt against.
6. Revised the prompt to include more explicit domain guidance (e.g., that canned laugh track is reserved for post-production audio, not sweetened studio-audience sound) and consistency rules for repeated titles. Accuracy rose to 88% against the same hand-coded sample.
7. Applied the validated prompt to the full dataset of comedies and merged the results back into the main dataframe as `laugh_track_category`.

### Analyzing trends over time
8. Grouped classified shows by year and laugh-track category to calculate counts and category share (as a percentage of that year's top-rated comedies).
9. Identified peak years for each category (canned laugh track: 1964; studio audience: 1994; no added laughter: 2020) using `idxmax()` on the yearly percentage breakdown.
10. Charted category share over time as an area chart, and exported the per-year percentage breakdown to `percentage_laugh_track_cat_per_year.csv` for downstream visualization.
11. Exported a cleaned, flattened version of the dataset (`show_data_for_beeswarm.json`) for a beeswarm-style chart of individual shows.

## New Skills and Approaches

This project was a great opportunity to use a culmination of new skills.

On the data side, I used **AI-assisted classification** for the first time at this scale — prompting an LLM to categorize laugh-track usage across hundreds of shows, then validating its output against a hand-coded ground truth sample and iterating on the prompt until accuracy held up. I also worked with the **Wikipedia API** and **TMDB API** for the first time, pulling camera format and genre data programmatically rather than by hand.
 
On the presentation side, I built the visualizations in **D3.js**, including **animating charts on scroll** to walk readers through the eras of laugh-track usage as they read. I also used **ai2html** to build a bespoke timeline of the history of laugh tracks and inject it into my html in a format I could then animate on scroll.

## What I'd Do Differently With More Time

If I were doing this again, I'd probably **skip collecting camera format data** (single-camera vs. multi-camera) — it ended up not being something I actually needed for the final analysis or story, and the manual cleanup it required wasn't worth the payoff.
 
I'd also **build the site to be responsive**. It currently isn't optimized for smaller screens, which matters given how much of the storytelling relies on the scroll-animated charts.