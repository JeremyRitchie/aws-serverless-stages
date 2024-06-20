# AWS Serverless Stages

This repository is intended to be widely reused as an example of various serverless architectures using AWS CDK with TypeScript.

Read more about this repository and how you can best use it in [Part 1](https://jeremyritchie.com/posts/13/) and [Part 2](https://jeremyritchie.com/posts/14/).

## Prerequisites

Before getting started, make sure you have the following prerequisites:

- AWS account with appropriate permissions
- Node.js and npm installed
- CDK framework

## Installation

To install and set up this AWS CDK TypeScript app, follow these steps:

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/jeremyritchie/aws-serverless-stages.git
    ```

2. Navigate to the project directory:

    ```bash
    cd aws-serverless-stages
    ```

3. Install the required dependencies using npm:

    ```bash
    npm install
    ```

4. Configure your AWS credentials by running the following command and following the prompts:

    ```bash
    aws configure
    ```

5. Deploy the AWS resources using the CDK:

    ```bash
    cdk deploy
    ```

    This command will create the necessary AWS resources based on the configurations defined in the CDK app.

6. Once the deployment is successful, you can start using the serverless stages template.

    Congratulations! You have successfully installed and deployed the AWS CDK TypeScript app.

## Usage

Once the deployment is successful, you can start using the serverless stages template. The repository provides a set of pre-defined serverless architectures that you can leverage for your own projects. Feel free to modify and customize the codebase according to your requirements.

## Contributing

Contributions are welcome! If you have any suggestions, improvements, or bug fixes, please submit a pull request. Make sure to follow the existing coding style and conventions.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for more information.