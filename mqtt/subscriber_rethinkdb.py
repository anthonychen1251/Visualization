import paho.mqtt.client as mqtt
import time
import rethinkdb as r
rdb = r.RethinkDB()
rdb.connect('140.112.42.53', 28015).repl()
#rdb.connect('localhost', 28015).repl()



client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print("Connected")
    client.subscribe("MyHome/Bedroom/AirConditioning/#")
 
def on_message(client, userdata, message):
    #print(message.topic+" "+str(message.payload))
    #print(float(message.payload))
    data_type = message.topic.split("/")[-1]
    data = {'timestamp': int(time.time()), 'value': float(message.payload)}
    if data_type == "Humidity":
        print(data)
        rdb.db('example_app').table('firetony').get(1002).update(
            {"values": rdb.row["values"].append(data)}
        ).run()
    elif data_type == "Temperature":
        print(data)
        rdb.db('example_app').table('firetony').get(1003).update(
            {"values": rdb.row["values"].append(data)}
        ).run()
 
client.on_connect = on_connect
client.on_message = on_message
#client.connect("140.112.42.53", port=12321)
client.connect("localhost")
 
while True:
    client.loop()
