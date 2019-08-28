## Install Horizon Server
```bash
$ sudo npm install -g horizon
```
## Initialize an example application
```bash
$ hz init example_app #run this command under ./Visualization/horizon/
```
## Starting the Horizon server
```bash
$ hz serve --dev #run this command under ./Visualization/horizon/example-app/
```
## Configuration file for the Horizon server
`./horizon/example-app/.hz/config.toml` is a TOML configuration file for the Horizon server.
```toml
###############################################################################
# IP options
# 'bind' controls which local interfaces will be listened on
# 'port' controls which port will be listened on
#------------------------------------------------------------------------------
# bind = [ "localhost" ]
bind = ["localhost", "192.168.11.43"] # IP binding
# port = 8181
###############################################################################
# RethinkDB Options
# 'connect' and 'start_rethinkdb' are mutually exclusive
# 'connect' will connect to an existing RethinkDB instance
# 'start_rethinkdb' will run an internal RethinkDB instance
# 'rdb_timeout' is the number of seconds to wait when connecting to RethinkDB
#------------------------------------------------------------------------------
connect = "192.168.11.43:28015" # client driver connections of RethinkDB
# start_rethinkdb = false
# rdb_timeout = 30
```

## Reference
https://github.com/rethinkdb/horizon

https://github.com/rethinkdb/horizon-docs/blob/master/getting-started.md
