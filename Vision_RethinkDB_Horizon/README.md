## Install required packages 
```bash
$ npm install
```
## Start developing
```bash
$ npm run start
```

## Set up the configuration file for Horizon server
To grab the data from RethinkDB via Horizon server, we need to add a configuration file called `horizon-config.json` under `./src/connectors/`.
The format of configuration file is listed as follow:
```json
{
    "horizon": {
        "host": "140.112.42.53",
        "port": 8181,
        "table": "firetony"
    }
}
```

## Reference
https://github.com/Destinia/Vision
