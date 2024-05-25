from flask import Flask, request, render_template
import datetime
import pytz
import json

app = Flask(__name__)

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html', timezones = pytz.all_timezones)

@app.route('/time', methods=['GET'])
def get_time():
    timezone = request.args.get('timezone', default = 'UTC', type = str)
    try:
        time = str(datetime.datetime.now(pytz.timezone(timezone)))
        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {
                "content-type": "application/json"
            },
            "body": {
                "time": time,
                "timezone": timezone
            }

        }
    except pytz.exceptions.UnknownTimeZoneError:
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "headers": {
                "content-type": "application/json"
            },
            "body": "Invalid timezone"
        }

if __name__ == '__main__':
    app.run()