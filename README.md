# PeliasLite

Minimal Single Service Interface of Pelias Geocoder in Nodejs

## Use Cases

- **Testing:** in all those cases where a complete instance of Pelias makes little sense to exist because its use is limited to small tests that do not provide accurate results

- **Small datasets:** the total amount of datasource to import is very limited and an elasticsearch instance would be too expensive for the expected results

- **Customized ranking:** you want to have total control over the raking of the results for particular cases where normal geocoding raking is not important

- **Light instance:** you have very limited resources available and you want to use a single docker container but still have the complete Pelias rest api


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

example of config.yml

```yaml
default_lang: 'en'
min_text_length: 3

endpoints:
  default:
    hostname: remote.geocoder.com
    method: GET
    port: 443
    size: 5
    method: 'GET'
    headers:
      User-Agent: PeliasLite
    layer: venue

  opentripplanner:
    hostname: opentripplanner.org
    path: /otp/routers/default/geocode?query={{text}}
    layer: stops
  
  ...other datasources...
```
