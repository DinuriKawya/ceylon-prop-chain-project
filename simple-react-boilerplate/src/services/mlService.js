import cityClusters from "../data/city_clusters.json";

const toTitleCase = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const findCityMatch = (location) => {
  if (!location || !location.trim()) return null;

  const cityClean = toTitleCase(location.trim());

  let match = cityClusters.find((c) => c.city === cityClean);

  if (!match) {
    const partials = cityClusters.filter((c) => c.city.startsWith(cityClean));
    if (partials.length > 0) {
      match = partials.reduce(
        (best, c) => (c.listing_count > best.listing_count ? c : best),
        partials[0],
      );
    }
  }

  return match || null;
};

export const analyzeLocation = (location, postalCode) => {
  if (!location || !location.trim()) {
    throw new Error("Please enter a location");
  }

  const match = findCityMatch(location);

  if (!match) {
    throw new Error(
      `No data available for "${location}". Try a nearby major city like Colombo, Dehiwala, or Kandy.`,
    );
  }

  let note = null;
  const postalTrimmed = postalCode ? String(postalCode).trim() : "";
  if (postalTrimmed && match.postal_code !== null && match.postal_code !== undefined) {
    if (parseInt(postalTrimmed, 10) !== parseInt(match.postal_code, 10)) {
      note = `Note: we have ${match.city} listed under postal code ${match.postal_code}, not ${postalTrimmed}.`;
    }
  }

  return {
    city: match.city,
    postalCode: match.postal_code ?? null,
    cluster: match.cluster,
    avgPrice: match.avg_price_per_sqft.toLocaleString(),
    growth: match.yoy_trend_pct !== null ? match.yoy_trend_pct : null,
    similar: match.similar_cities,
    note,
  };
};

export const calculateInvestmentScore = (mlResult) => {
  if (!mlResult) return null;

  const { city, cluster, avgPrice, growth } = mlResult;

  // Growth Potential 
  let growthPotential = 50;
  if (growth !== null && growth !== undefined) {
    if (growth >= 30) growthPotential = 95;
    else if (growth >= 20) growthPotential = 85;
    else if (growth >= 10) growthPotential = 75;
    else if (growth >= 0) growthPotential = 60;
    else growthPotential = 40;
  }

  // Price Accessibility 
  const priceNum = parseInt(avgPrice.replace(/,/g, ""), 10);
  let priceAccessibility = 40;
  if (priceNum <= 3000) priceAccessibility = 95;
  else if (priceNum <= 5000) priceAccessibility = 85;
  else if (priceNum <= 8000) priceAccessibility = 70;
  else if (priceNum <= 12000) priceAccessibility = 55;

  // Market Stability 
  let marketStability = 60;
  if (cluster === "Expensive & Stable") marketStability = 95;
  else if (cluster === "Fast Growing") marketStability = 75;
  else if (cluster === "Budget & Rising") marketStability = 60;

  // Location Trend 
  let locationTrend = 65;
  if (cluster === "Fast Growing" && growth > 25) locationTrend = 95;
  else if (cluster === "Fast Growing") locationTrend = 85;
  else if (cluster === "Budget & Rising" && growth > 15) locationTrend = 80;
  else if (cluster === "Expensive & Stable") locationTrend = 90;

  // total score
  const totalScore = Math.round(
    growthPotential * 0.40 +
    priceAccessibility * 0.25 +
    marketStability * 0.20 +
    locationTrend * 0.15
  );

  let recommendation = "Conservative Pick";
  if (totalScore >= 85) recommendation = "Strong Growth Opportunity";
  else if (totalScore >= 70) recommendation = "Solid Investment";
  else if (totalScore >= 55) recommendation = "Moderate Opportunity";


  const scoreLabel = totalScore >= 85 ? "high" : totalScore >= 70 ? "solid" : totalScore >= 55 ? "moderate" : "conservative";
  let summary = `${city} receives a ${scoreLabel} investment score based on its ${cluster ? cluster.toLowerCase() : "standard"} market profile`;
  if (growth !== null && growth !== undefined) {
    summary += ` with ${growth}% year-over-year growth.`;
  } else {
    summary += ".";
  }

  if (cluster === "Fast Growing") {
    summary = `${city} receives a ${scoreLabel} investment score because of strong historical growth in this fast growing market.`;
  } else if (cluster === "Expensive & Stable") {
    summary = `${city} receives a ${scoreLabel} investment score because of strong market stability in this expensive & stable market.`;
  } else if (cluster === "Budget & Rising") {
    summary = `${city} receives a ${scoreLabel} investment score because of accessible pricing in this budget & rising market.`;
  }

  return {
    totalScore,
    breakdown: {
      growthPotential,
      priceAccessibility,
      marketStability,
      locationTrend
    },
    recommendation,
    summary
  };
};
