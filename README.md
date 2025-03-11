# Weather App

Weather App is a simple web application that shows the current weather and forecast for the next 5 days of a location. The location can be searched by city name. The application also shows weather tips based on the current weather powered by AI from Ollama.

## Features

- Search for a location by city name
- Show the current weather and forecast for the next 5 days per 3 hours
- Show weather tips based on the current weather
- Maori language support

## Requirements

- [Node.js](https://nodejs.org/en/)
- [Ollama](https://ollama.com)
- [llama3.1:8b](https://ollama.com/library/llama3.1)

## Installation

```sh
# install the packages
npm install

# run
npm run dev

# build
npm run build

# start
npm start
```

## External API

- [Geocoding API](https://openweathermap.org/api/geocoding-api)
- [Current Weather API](https://openweathermap.org/current)
- [Weather Forecast API](https://openweathermap.org/forecast5)
- [IP-GeoLocation](https://ip-api.com/docs)
- [Public-IP](https://www.ipify.org)
- [Ollama API](https://github.com/ollama/ollama-js)
