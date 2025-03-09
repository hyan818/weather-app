import { useState, useEffect } from "react";
import axios from "axios";
import Forecast from "./components/Forecast";
import Recommendation from "./components/Recommendation";
import { Droplet, Search, Thermometer, Wind } from "lucide-react";
import Skeleton from "react-loading-skeleton";

function App() {
  const [data, setData] = useState(null);
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]); // Stores location suggestions
  const [selectedIndex, setSelectedIndex] = useState(-1); // Tracks selected item index
  const [coordinates, setCoordinates] = useState({});

  // Fetch location suggestions from OpenWeather Geolocation API
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1); //added for using arrow keys
      return;
    }

    await axios
      .get(import.meta.env.VITE_OPEN_WEATHER_GEO_URL, {
        params: {
          q: query,
          limit: 5,
          appid: import.meta.env.VITE_OPEN_WEATHER_API_KEY,
        },
      })
      .then((response) => {
        setSuggestions(
          response.data.map((item) => ({
            name: item.name,
            country: item.country,
            lat: item.lat,
            lon: item.lon,
          }))
        );

        setSelectedIndex(-1); //added for using arrow keys. Reset selection when new suggestions load
      })
      .catch((error) => {
        console.error("Error fetching location suggestions:", error);
      });
  };

  // Fetch weather data for a selected location
  const fetchWeather = async (lat, lon) => {
    await axios
      .get(import.meta.env.VITE_OPEN_WEATHER_URL, {
        params: {
          lat: lat,
          lon: lon,
          units: "metric",
          appid: import.meta.env.VITE_OPEN_WEATHER_API_KEY,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  };

  useEffect(() => {
    const fetchLocationByIP = async () => {
      try {
        const rep1 = await axios.get("https://api.ipify.org");
        const rep2 = await axios.get(`http://ip-api.com/json/${rep1.data}`);
        const data = rep2.data;
        fetchWeather(data.lat, data.lon);
        setCoordinates({ lat: data.lat, lon: data.lon });
      } catch (error) {
        console.log("Error get location: ", error);
      }
    };

    fetchLocationByIP();
  }, []);

  const handleInputChange = (event) => {
    const query = event.target.value;
    setLocation(query);
    fetchSuggestions(query); //fetch suggestion as the user types
  };

  //Handle selecting a location
  const handleSelectLocation = (selectedLocation) => {
    const { name, lat, lon } = selectedLocation;
    setLocation(`${name}`); // Update location state immediately
    setSuggestions([]); //clear suggestions
    setSelectedIndex(-1); // added for using arrow keys
    setCoordinates({ lat, lon });
    fetchWeather(lat, lon);
  };

  // Handle key presses for suggestion navigation
  const handleKeyDown = (event) => {
    if (suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex >= 0) {
        handleSelectLocation(suggestions[selectedIndex]);
      }
    }
  };

  return (
    <main>
      <section className="search">
        <div className="search-input-container">
          <Search className="search-icon" size={18} />
          <input
            value={location}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter Location / Ingoa taone whakauru"
            type="text"
          />
        </div>
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onMouseEnter={() => setSelectedIndex(index)} // Allow hover selection
                onMouseLeave={() => setSelectedIndex(-1)} // Reset on leave
                onClick={() => handleSelectLocation(item)}
                className={index === selectedIndex ? "selected" : ""} // Add selected class
              >
                {item.name}, {item.country}
              </li>
            ))}
          </ul>
        )}
      </section>
      {data ? (
        <section className="today">
          <div className="top">
            <h1>
              {data.name}, {data.sys.country}
            </h1>
            <div className="weather">
              <div>
                <img
                  src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                  alt={data.weather.description}
                />
                <h2>{data.weather[0].main}</h2>
              </div>
              <div className="temp">
                <h2>{data.main.temp.toFixed()}°C</h2>
                <span>{data.main.temp_min.toFixed()}°C</span>
                <span style={{ margin: "0 8px" }}>|</span>
                <span>{data.main.temp_max.toFixed()}°C</span>
              </div>
            </div>
          </div>

          <div className="bottom">
            <div>
              <div className="icon-text-group">
                <Thermometer />
                <span className="bold">{data.main.feels_like.toFixed()}°C</span>
              </div>
              <span>Feel like</span>
              <span>Ka rite</span>
            </div>
            <div>
              <div className="icon-text-group">
                <Droplet />
                <span className="bold">{data.main.humidity}%</span>
              </div>
              <span>Humidity</span>
              <span>Haumākū</span>
            </div>
            <div>
              <div className="icon-text-group">
                <Wind />
                <span className="bold">{data.wind.speed.toFixed()} MPH</span>
              </div>
              <span>Wind Speed</span>
              <span>Tere Hau</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="today">
          <div className="top">
            <Skeleton width={"15rem"} height={"3rem"} />
            <div className="weather" style={{ marginTop: "1rem" }}>
              <div>
                <Skeleton
                  width={"5rem"}
                  height={"5rem"}
                  style={{ borderRadius: "50%" }}
                />
                <Skeleton
                  width={"10rem"}
                  height={"2rem"}
                  style={{ marginTop: "0.5rem" }}
                />
              </div>
              <div className="temp">
                <Skeleton width={"4rem"} height={"3rem"} />
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginTop: "1rem",
                  }}
                >
                  <Skeleton width={"3rem"} height={"1.5rem"} />
                  <Skeleton width={"1rem"} height={"1.5rem"} />
                  <Skeleton width={"3rem"} height={"1.5rem"} />
                </div>
              </div>
            </div>
          </div>

          <div className="bottom">
            {Array(3)
              .fill()
              .map((_, index) => (
                <div key={index}>
                  <div className="icon-text-group">
                    <Skeleton
                      width={"1rem"}
                      height={"1rem"}
                      style={{ borderRadius: "50%" }}
                    />
                    <Skeleton width={"3rem"} height={"1.5rem"} />
                  </div>
                  <Skeleton
                    width={"4rem"}
                    height={"1rem"}
                    style={{ marginTop: "0.5rem" }}
                  />
                </div>
              ))}
          </div>
        </section>
      )}
      <section>
        <Recommendation
          temp={data?.main?.temp}
          humidity={data?.main?.humidity}
          wind_speed={data?.wind?.speed}
        />
      </section>
      <section>
        <Forecast lat={coordinates.lat} lon={coordinates.lon} />
      </section>
    </main>
  );
}

export default App;
