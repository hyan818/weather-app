import dayjs from "dayjs";
import styles from "./Forecast.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export default function Forecast({ lat, lon }) {
  const [forecasts, setForecasts] = useState([]);

  useEffect(() => {
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
      })
      .catch((error) => {
        console.error(error);
      });
  }, [lat, lon]);

  return (
    <div className={styles.forecastContainer}>
      {forecasts.map((value, index) => {
        return (
          <div className={styles.forecastItem} key={index}>
            <p>{value.day}</p>
            <p>{value.time}</p>
            <img src={value.icon} alt={value.description} />
            <p>{value.temperature} °C</p>
          </div>
        );
      })}
    </div>
  );
}

// PropTypes validation
Forecast.propTypes = {
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
};
