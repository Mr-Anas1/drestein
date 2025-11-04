// lib/gtag.js
export const GA_TRACKING_ID = "G-1V374ZTE8L";

// Log page views
export const pageview = (url) => {
  window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

// Log specific events
export const event = ({ action, params }) => {
  window.gtag("event", action, params);
};
