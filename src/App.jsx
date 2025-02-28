import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]); // Stores location suggestions
  const [selectedIndex, setSelectedIndex] = useState(-1); // Tracks selected item index

  const WEATHER_API_KEY = "e007ab348b01c579572710d941a3a21c";

  // Fetch location suggestions from OpenWeather Geolocation API
  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setSelectedIndex(-1); //added for using arrow keys
      return;
    }

    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${WEATHER_API_KEY}`;
    try {
      const response = await axios.get(geoUrl);
      //setSuggestions(response.data);

      setSuggestions(
        response.data.map((item) => ({
          name: item.name,
          country: item.country,
          lat: item.lat,
          lon: item.lon,
        }))
      );

      setSelectedIndex(-1); //added for using arrow keys. Reset selection when new suggestions load
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  // Fetch weather data for a selected location

  //const fetchWeather = async (city) => {
  const fetchWeather = async (lat, lon) => {
    //const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${WEATHER_API_KEY}`;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${WEATHER_API_KEY}`;
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  //IP-based detection using ipinfo.io:
  //free token from ipinfo.io.
  useEffect(() => {
    const fetchLocationByIP = async () => {
      try {
        const response = await axios.get(
          "https://ipinfo.io/json?token=1e675b91ebf732"
        );
        if (response.data && response.data.loc) {
          //const city = response.data.city;
          const [lat, lon] = response.data.loc.split(",");
          //setLocation(city);
          //fetchWeather(city);
          setLocation(`${response.data.city}, ${response.data.country}`); // Show City, Country
          fetchWeather(lat, lon); // Fetch weather with lat/lon
        }
      } catch (error) {
        console.error("Error fetching location from IP:", error);
      }
    };

    fetchLocationByIP();
  }, []); // Empty dependency array to run only once on mount

  //Handle input change for location search
  const handleInputChange = (event) => {
    const query = event.target.value;
    setLocation(query);
    fetchSuggestions(query); //fetch suggestion as the user types
  };

  //Handle selecting a location from suggestions
  const handleSelectLocation = (selectedLocation) => {
    const { name, country, lat, lon } = selectedLocation;

    //setLocation(selectedLocation);
    setLocation(`${name}, ${country}`); // Update location state immediately

    setSuggestions([]); //clear suggestions
    setSelectedIndex(-1); // added for using arrow keys

    //fetchWeather(selectedLocation);
    fetchWeather(lat, lon); // Fetch weather using lat and lon
    //fetchCityName(lat, lon)
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
        handleSelectLocation(suggestions[selectedIndex]); //suggestions[selectedIndex].name
      }
    }
  };

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} // Attach key event
          placeholder="Enter Location"
          type="text"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onMouseEnter={() => setSelectedIndex(index)} // Allow hover selection
                onMouseLeave={() => setSelectedIndex(-1)} // Reset on leave
                onClick={() => handleSelectLocation(item)} //(item.name)
                className={index === selectedIndex ? "selected" : ""} // Add selected class
              >
                {item.name}, {item.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()}°F</h1> : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {data.name && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">{data.main.feels_like.toFixed()}°F</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">{data.wind.speed.toFixed()} MPH</p>
              ) : null}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
