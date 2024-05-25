import datetime
import json
import pytz

def lambda_handler(event, context):
    timezone = event.queryStringParameters.get('timezone', 'UTC')
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