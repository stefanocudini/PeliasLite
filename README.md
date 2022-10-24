# PeliasLite

Minimal Single Service Interface of Pelias Geocoder in Nodejs

## Use Cases

- **Testing:** in all those cases where a complete instance of Pelias makes little sense to exist because its use is limited to small tests that do not provide accurate results

- **Small datasets:** the total amount of datasource to import is very limited and an elasticsearch instance would be too expensive for the expected results

- **Customized ranking:** you want to have total control over the raking of the results for particular cases where normal geocoding raking is not important

- **Light instance:** you have very limited resources available and you want to use a single docker container but still have the complete Pelias rest api

- **Many others:** contribute to extend the usage scenarios.


## usage

```bash
npm install

npm start
```

development mode

```bash
npm run dev
```

via Docker
```bash
docker-compose up
```

browse: http://localhost:8087/test

## configuration

environments:
  default: prod
#default environment if NODE_ENV is not defined

prod:
  listen_port: 8088
dev:
  listen_port: 9088
  min_text_length: 1

cors:
  origin: '*'
  optionsSuccessStatus: 200
  #some legacy browsers (IE11, various SmartTVs) choke on 2

#TODO cache_ttl: 0
default_lang: 'en'
min_text_length: 3

endpoints:
  default:
    hostname: tourism.opendatahub.bz.it
    method: GET
    port: 443
    size: 5
    method: 'GET'
    headers:
      User-Agent: PeliasLite
    layer: venue

  opentripplanner:
    #TODO enabled: false
    hostname: ${OTP_HOST}
    #hostname: localhost
    # docs  http://dev.opentripplanner.org/apidoc/1.4.0/resource_GeocoderResource.html
    path: /otp/routers/default/geocode?query={{text}}
    port: ${OTP_PORT}
    layer: stops
  
  ...other datasources...
```
