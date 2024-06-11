import pytz
from jinja2 import Template

def lambda_handler(event, context):
    print(event)
    template = Template(open("index_v2.html").read())
    content = template.render(timezones=pytz.all_timezones)
    return {
        "isBase64Encoded": False,
        "statusCode": 200,
        "headers": {
            "content-type": "text/html"
        },
        "body": content
    }