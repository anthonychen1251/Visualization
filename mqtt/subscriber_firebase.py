import paho.mqtt.client as mqtt
import time
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from google.cloud.firestore_v1 import ArrayUnion

cred = credentials.Certificate("./firebase_python_api/vision-admin.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
doc_ref_temp = db.collection('test_data').document('serial_temperature')
doc_ref_humidity = db.collection('test_data').document('serial_humidity')

client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print("Connected")
    client.subscribe("MyHome/Bedroom/AirConditioning/#")
 
def on_message(client, userdata, message):

    print(message)
    data_type = message.topic.split("/")[-1]
    data = {'timestamp': int(time.time()), 'value': float(message.payload)}
    if data_type == "Humidity":
        print(data)
        doc_ref_humidity.update({'values': ArrayUnion([data])})

    elif data_type == "Temperature":
        print(data)
        doc_ref_temp.update({'values': ArrayUnion([data])})
 
client.on_connect = on_connect
client.on_message = on_message
#client.connect("140.112.42.53", port=12321)
client.connect("localhost")
while True:
    client.loop()
