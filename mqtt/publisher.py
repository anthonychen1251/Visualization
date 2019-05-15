import Adafruit_DHT
import time
import paho.mqtt.client as mqtt

sensor = Adafruit_DHT.DHT11
pin = 4

client = mqtt.Client()
client.connect('192.168.1.38') # broker ip

try:
    while True:
        humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
        if humidity is not None and temperature is not None:
            print("temperature: %.1f humidity: %.1f"%(temperature, humidity))
            client.publish('MyHome/Bedroom/AirConditioning/Temperature', str(temperature))
            client.publish('MyHome/Bedroom/AirConditioning/Humidity', str(humidity))
        client.loop()
        time.sleep(0.8)
except KeyboardInterrupt:
    print("Finished")
