## Install RethinkDB
```bash
source /etc/lsb-release && echo "deb http://download.rethinkdb.com/apt $DISTRIB_CODENAME main" | sudo tee /etc/apt/sources.list.d/rethinkdb.list
wget -qO- https://download.rethinkdb.com/apt/pubkey.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install rethinkdb
```
## Starting the server

```bash
$ rethinkdb #run this command under ./Visualization/rethinkdb/
#Loading data from directory ./Visualization-master/rethinkdb/rethinkdb_data
#info: Listening 'or intracluster connections on port 29015
#info: Listening for client driver connections on port 28015
#info: Listening for administrative HTTP connections on port 8080
#info: Listening on cluster addresses: 127.0.0.1, 127.0.1.1, ::1
#info: Listening on driver addresses: 127.0.0.1, 127.0.1.1, ::1
#info: Listening on http addresses: 127.0.0.1, 127.0.1.1, ::1
#info: Server ready
```
## Starting the server with IP binding
```bash
$ rethinkdb --bind 192.168.11.43 #run this command under ./Visualization/rethinkdb/
#Loading data from directory ./Visualization-master/rethinkdb/rethinkdb_data
#Loading data from directory ./Visualization-master/rethinkdb/rethinkdb_data
#info: Listening 'or intracluster connections on port 29015
#info: Listening for client driver connections on port 28015
#info: Listening for administrative HTTP connections on port 8080
#info: Listening on cluster addresses: 127.0.0.1, 127.0.1.1, 192.168.11.43, ::1
#info: Listening on driver addresses: 127.0.0.1, 127.0.1.1, 192.168.11.43, ::1
#info: Listening on http addresses: 127.0.0.1, 127.0.1.1, 192.168.11.43, ::1
#info: Server ready
```
## Reference
https://rethinkdb.com/docs/start-a-server/

https://rethinkdb.com/docs/cli-options/
