# PeliasLite

minimal standalone interface of Pelias geocoder

## Use Cases

** Testing: ** in all those cases where a complete instance of Pelias makes little sense to exist because its use is limited to small tests that do not provide accurate results

** Small datasets ** the total amount of datasource to import is very limited and an elasticsearch instance would be too expensive for the expected results

** customized results ** you want to have total control over the raking of the results for particular cases where normal geocoding raking is not important

** light instance ** you have very limited resources available and you want to use a single docker container but still have the complete Pelias rest api

** many others: ** contribute to extend the usage scenarios.


## usage

```bash
npm install

npm start
```

browse: http://localhost:8087/test
