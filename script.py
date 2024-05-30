# Webserver to send RGB data
# Tony Goodhew 5 July 2022
import network
import socket
import time
from machine import Pin, ADC
from secret import ssid, password
import random
import json

from picozero import pico_temp_sensor, pico_led


wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(ssid, password)

# Wait for connect or fail
max_wait = 10
while max_wait > 0:
    if wlan.status() < 0 or wlan.status() >= 3:
        break
    max_wait -= 1
    print('waiting for connection...')
    time.sleep(1)

# Handle connection error
if wlan.status() != 3:
    raise RuntimeError('network connection failed')
else:
    print('connected')
    status = wlan.ifconfig()
    print('ip = ' + status[0])

# Open socket
addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]

s = socket.socket()
s.bind(addr)
s.listen(5)

print('listening on', addr)

# Listen for connections
while True:
    try:
        cl, addr = s.accept()
        print('client connected from', addr)
        request = cl.recv(1024)
        print(request)

        # Interpretarea requestului
        if b'/lighton' in request:
            pico_led.on()  # Aprinde becul
            print('Becul a fost aprins')
        elif b'/lightoff' in request:
            pico_led.off()  # Stinge becul
            print('Becul a fost stins')
        elif b'/udaplanda' in request:
            cl.send('Planta a fost udata')
            cl.close()
            continue
        else:
            print('Comandă necunoscută')

        temperature = pico_temp_sensor.temp
        led_state = pico_led.value

        data_to_send = {
            'temperatura': temperature,
            'stareLED': 'on' if led_state else 'off'
        }

        response = json.dumps(data_to_send)

        cl.send(response)
        cl.close()

    except OSError as e:
        cl.close()
        print('connection closed')
