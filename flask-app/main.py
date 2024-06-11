from flask import Flask, request, render_template
import datetime
import pytz
import json
import os

app = Flask(__name__)
TEMPLATE = os.environ.get('TEMPLATE', 'index.html')

@app.route('/', methods=['GET'])
def home():
    return render_template(TEMPLATE, timezones = pytz.all_timezones)

@app.route('/time', methods=['GET'])
def get_time():
    timezone = request.args.get('timezone', default = 'UTC', type = str)
    try:
        time = str(datetime.datetime.now(pytz.timezone(timezone)))
        return {
                "time": time,
                "timezone": timezone
        }
    except pytz.exceptions.UnknownTimeZoneError:
        return {
            "Invalid timezone"
        }

if __name__ == '__main__':
    app.run()