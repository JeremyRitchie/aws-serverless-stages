import datetime
import json
import asyncio
import os
import python_weather

def lambda_handler(event, context):
    try:
        timezone = event['queryStringParameters']['timezone']
    except KeyError:
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "headers": {
                "content-type": "application/json"
            },
            "body": "Invalid weather timezone"
        }
    packet = asyncio.run(get_weather(timezone.split('/')[1]))
    return packet


async def get_weather(location):
  async with python_weather.Client(unit=python_weather.METRIC) as client:
    try:
        weather = await client.get(location)
        return {
            "isBase64Encoded": False,
            "statusCode": 200,
            "headers": {
                "content-type": "application/json"
            },
            "body": json.dumps({
                "temperature": weather.temperature,
                "humidity": weather.humidity,
                "wind_speed": weather.wind_speed,
                "wind_direction": weather.wind_direction.value,
                "local_population": weather.local_population,
                "datetime": weather.datetime.strftime("%Y-%m-%d %H:%M:%S"),
            })
        }
    except python_weather.errors.Error:
        return {
            "isBase64Encoded": False,
            "statusCode": 400,
            "headers": {
                "content-type": "application/json"
            },
            "body": "Invalid weather timezone"
        }