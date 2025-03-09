import dayjs from "dayjs";
import "./Forecast.css";
import axios from "axios";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Skeleton from "react-loading-skeleton";

export default function Forecast({ lat, lon }) {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lon) return;
    setLoading(true);
    axios
      .get(import.meta.env.VITE_OPEN_WEATHER_FORECAST_URL, {
        params: {
          lat,
          lon,
          units: "metric",
          appid: import.meta.env.VITE_OPEN_WEATHER_API_KEY,
        },
      })
      .then((response) => {
        var data = response.data;
        var forecasts = [];
        data.list.forEach((value) => {
          forecasts.push({
            day: dayjs.unix(value.dt).format("ddd"),
            time: dayjs.unix(value.dt).format("h A"),
            icon: `http://openweathermap.org/img/wn/${value.weather[0].icon}@2x.png`,
            description: value.weather[0].description,
            temperature: Math.round(value.main.temp),
          });
        });
        setForecasts(forecasts);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [lat, lon]);

  const skeletonItems = Array(8)
    .fill()
    .map((_, index) => (
      <div className="forecastItem" style={{ padding: "1rem" }} key={index}>
        <Skeleton width={"4rem"} />
        <Skeleton
          width={"4rem"}
          height={"4rem"}
          style={{ borderRadius: "50%" }}
        />
        <Skeleton width={"3rem"} />
        <Skeleton width={"2rem"} />
      </div>
    ));

  return (
    <>
      {loading || forecasts.length == 0 ? (
        <>
          <Skeleton width="40%" height={30} style={{ marginBottom: "1rem" }} />
          <div className="forecastContainer">{skeletonItems}</div>
        </>
      ) : (
        <>
          <h2> Matapae | Forecast</h2>

          <div className="forecastContainer">
            {forecasts.map((value, index) => {
              return (
                <div className="forecastItem" key={index}>
                  <p className="bold">{value.day}</p>
                  <p>{value.time}</p>
                  <img src={value.icon} alt={value.description} />
                  <p className="bold">{value.temperature} °C</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

Forecast.propTypes = {
  lat: PropTypes.number.optional,
  lon: PropTypes.number.optional,
};
