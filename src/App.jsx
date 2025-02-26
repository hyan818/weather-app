// import { useState } from "react";
// import axios from "axios";

// function App() {
//   const [data, setData] = useState({});
//   const [location, setLocation] = useState("");

//   const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=5d3c818cd59d50b2f6df161a467a154b`;

//   const searchLocation = (event) => {
//     if (event.key === "Enter") {
//       axios.get(url).then((response) => {
//         setData(response.data);
//         console.log(response.data);
//       });
//       setLocation("");
//     }
//   };

//   return (
//     <div className="app">
//       <div className="search">
//         <input
//           value={location}
//           onChange={(event) => setLocation(event.target.value)}
//           onKeyPress={searchLocation}
//           placeholder="Enter Location"
//           type="text"
//         />
//       </div>
//       <div className="container">
//         <div className="top">
//           <div className="location">
//             <p>{data.name}</p>
//           </div>
//           <div className="temp">
//             {data.main ? <h1>{data.main.temp.toFixed()}°F</h1> : null}
//           </div>
//           <div className="description">
//             {data.weather ? <p>{data.weather[0].main}</p> : null}
//           </div>
//         </div>

//         {data.name !== undefined && (
//           <div className="bottom">
//             <div className="feels">
//               {data.main ? (
//                 <p className="bold">{data.main.feels_like.toFixed()}°F</p>
//               ) : null}
//               <p>Feels Like</p>
//             </div>
//             <div className="humidity">
//               {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
//               <p>Humidity</p>
//             </div>
//             <div className="wind">
//               {data.wind ? (
//                 <p className="bold">{data.wind.speed.toFixed()} MPH</p>
//               ) : null}
//               <p>Wind Speed</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;


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
      setSuggestions(response.data);
      setSelectedIndex(-1); //added for using arrow keys. Reset selection when new suggestions load
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  // Fetch weather data for a selected location
  const fetchWeather = async (city) => {
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${WEATHER_API_KEY}`;
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  
 // Fetch city name from latitude & longitude
const fetchCityName = async (lat, lon) => {
  const reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${WEATHER_API_KEY}`;

  try {
    const response = await axios.get(reverseGeoUrl);
    if (response.data.length > 0) {
      const cityName = response.data[0].name;
      setLocation(cityName);
      fetchWeather(cityName);
    } else {
      console.error("No city found for the given coordinates.");
    }
  } catch (error) {
    console.error("Error fetching city name:", error);
  }
};

//IP-based detection using ipinfo.io:
//free token from ipinfo.io.
useEffect(() => {
  const fetchLocationByIP = async () => {
    try {
      const response = await axios.get("https://ipinfo.io/json?token=1e675b91ebf732");
      if (response.data && response.data.city) {
        const city = response.data.city;
        setLocation(city);
        fetchWeather(city);
      }
    } catch (error) {
      console.error("Error fetching location from IP:", error);
      // setLocation("New York"); // Fallback city
      // fetchWeather("New York");
    }
  };

  fetchLocationByIP();
}, []);




  const handleInputChange = (event) => {
    const query = event.target.value;
    setLocation(query);
    fetchSuggestions(query); //fetch suggestion
  };

   //Handle selecting a location
  const handleSelectLocation = (selectedLocation) => {
    setLocation(selectedLocation);
    setSuggestions([]); //clear suggestions
    setSelectedIndex(-1); // added for using arrow keys
    fetchWeather(selectedLocation);
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
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : 0
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (selectedIndex >= 0) {
        handleSelectLocation(suggestions[selectedIndex].name);
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
                onClick={() => handleSelectLocation(item.name)}
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
              {data.main ? <p className="bold">{data.main.feels_like.toFixed()}°F</p> : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? <p className="bold">{data.wind.speed.toFixed()} MPH</p> : null}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
