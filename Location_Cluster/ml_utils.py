"""
Shared helper functions for the CeylonPropChain ML pipeline.
Used by 01_preprocessing, 02_clustering, 03_enrichment_charts, and 04_testing_export.
Keep this file in the same folder as the notebooks.
"""
import pandas as pd
import numpy as np

CLUSTER_COLORS = {
    "Expensive & Stable": "#d62728",
    "Fast Growing": "#ff7f0e",
    "Budget & Rising": "#2ca02c"
}


def clean_price(price_series):
    """Strip currency symbols and commas from a raw price text column, return numeric Series."""
    return (
        price_series.astype(str)
        .str.replace(",", "", regex=False)
        .str.extract(r"(\d+)")[0]
        .astype(float)
    )


def extract_sqft(props_str):
    """Extract floor area (sqft) from the semi-structured 'properties' dict-string column."""
    if pd.isna(props_str):
        return np.nan
    match = pd.Series([props_str]).str.extract(r"'Size':\s*'([\d,]+)")[0][0]
    if pd.isna(match):
        return np.nan
    return float(match.replace(",", ""))


def get_similar_cities(df, city_name, n=3):
    """Return up to n other cities in the same cluster as city_name, sorted by listing_count."""
    row = df[df["city_clean"] == city_name]
    if row.empty:
        return []
    cluster_id = row.iloc[0]["cluster"]
    similar = df[(df["cluster"] == cluster_id) & (df["city_clean"] != city_name)]
    return similar.sort_values("listing_count", ascending=False)["city_clean"].head(n).tolist()
