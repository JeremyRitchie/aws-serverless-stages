FROM public.ecr.aws/lambda/python:3.10
COPY ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt
COPY . ${LAMBDA_TASK_ROOT}
CMD ["lambda_function.lambda_handler"]