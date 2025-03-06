import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import ollama from "ollama";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./Recommendation.css";

export default function Recommendation({ temp, humidity, wind_speed }) {
  const [recommendation, setRecommendation] = useState({
    clothing: "",
    health: "",
    outdoor_activity: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (!temp || !humidity || !wind_speed) return;

      setLoading(true);
      await ollama
        .chat({
          model: "llama3.1:8b",
          messages: [
            {
              role: "system",
              content:
                "Given the following inputs: Temperature (°C), Humidity (%), Wind Speed (km/h)",
            },
            {
              role: "system",
              content: `You should analyze these values and return a JSON object with three fields:
              1. "clothing": Recommend appropriate clothing based on the temperature, humidity, and wind speed.
              2. "health": Provide health advice considering temperature extremes, humidity levels, and wind chill effects.
              3. "outdoor_activity": Suggest suitable outdoor activities based on the weather conditions.
              `,
            },
            {
              role: "system",
              content: `
              For example, if the temperature is 25°C, humidity is 60%, and wind speed is 10 km/h, the response might look like this:
              {
                "clothing": "Light jacket",
                "health": "Stay hydrated and avoid prolonged exposure to direct sunlight.",
                "outdoor_activity": "Go for a walk or jog."
              }
            `,
            },
            {
              role: "system",
              content:
                "Do not provide any additional information beyond the JSON object.",
            },
            {
              role: "user",
              content: `temperature: ${temp}, humidity: ${humidity}, wind speed: ${wind_speed}`,
            },
          ],
        })
        .then((response) => {
          const data = JSON.parse(response.message.content);
          setRecommendation((prev) => ({
            ...prev,
            clothing: data.clothing,
            health: data.health,
            outdoor_activity: data.outdoor_activity,
          }));
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.error(error);
        });
    };

    fetchRecommendation();
  }, [temp, humidity, wind_speed]);

  return (
    <>
      <section className="recommendationContainer">
        {loading ? (
          <div className="skeleton-wrapper">
            <Skeleton width="40%" height={30} />
            <div className="skeleton-list">
              <Skeleton width="60%" height={20} />
              <Skeleton width="65%" height={20} />
              <Skeleton width="55%" height={20} />
            </div>
          </div>
        ) : recommendation.clothing ? (
          <>
            <h2>Weather Tips</h2>
            <ul>
              <li>
                <span className="bold">Clothing: </span>
                {recommendation.clothing}
              </li>
              <li>
                <span className="bold">Health: </span>
                {recommendation.health}
              </li>
              <li>
                <span className="bold">Outdoor Activity:</span>{" "}
                {recommendation.outdoor_activity}
              </li>
            </ul>
          </>
        ) : (
          <>
            <h2>Weather Tips</h2>
            <p>
              Sorry, fetching weather tips from AI failed. Please try again
              later.
            </p>
          </>
        )}
      </section>
    </>
  );
}

Recommendation.propTypes = {
  temp: PropTypes.string.Optional,
  humidity: PropTypes.string.Optional,
  wind_speed: PropTypes.string.Optional,
};
