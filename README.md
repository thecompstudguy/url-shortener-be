# URL Shortener Backend (`url-shortener-be`)

Backend services for the URL Shortener system, built as a Serverless (AWS Lambda) Node.js/TypeScript project using the Lesgo framework.

**Warning:** This repository must remain private. It includes `.env` files with sensitive server and security configuration.

## Prerequisites

- Node.js version from `.nvmrc` (recommended via `nvm`)
- `npm` (ships with Node)
- AWS credentials for deployment (profile-based, see `AWS_ACCOUNT_PROFILE`)

## Install

```bash
nvm install
nvm use
npm ci
```

## Environment Configuration

This project loads stage-based environment variables from `config/environments/` (see `serverless.yml`). All `.env*` files are ignored by Git (except `.env.example`).

### Creating Environment Files

To set up your environment, use `.env.example` as a template.

#### Root Directory
For local development and general configuration, create a `.env` file in the root directory:
```bash
cp .env.example .env
```

#### config/environments Directory
For stage-specific configurations used during deployment, create the matching stage file under `config/environments/`:
```bash
cp .env.example config/environments/.env.[stage]
```

### Available Stages
The following stages are supported:
- `dev`: Development environment.
- `sandbox`: Sandbox/Testing environment.
- `prod`: Production environment.

Example files to create:
- `config/environments/.env.dev`
- `config/environments/.env.sandbox`
- `config/environments/.env.prod`
- `config/environments/.env` (used for local development)

At minimum, set `APP_NAME`, `AWS_APP_REGION`, and `AWS_ACCOUNT_PROFILE` for your target stage. Some stacks may also require VPC settings (`AWS_VPC_*`) depending on enabled resources.

## Run Locally

Starts the Serverless Offline HTTP API on port `8888`:

```bash
npm run start
```

## Build

```bash
npm run build
```

## Deploy (AWS)

1. Ensure your AWS credentials/profile exists locally (example: `aws configure --profile <profileName>`).
2. Update the stage environment file under `config/environments/`.
3. Deploy:

```bash
npm run deploy -- --stage dev
```

Other useful commands:

```bash
npm run logs -- --stage dev
npm run destroy -- --stage dev
```

## VPC CIDR and Subnet Management

When configuring your environment, be mindful of the CIDR and subnet values assigned to each stage. 

**Important Considerations:**
- **Avoid Overlapping Ranges**: Ensure that VPC CIDR blocks do not overlap across different stages (dev, sandbox, prod) or with other existing networks in your AWS organization. Overlapping ranges will prevent VPC peering and other networking features from working correctly.
- **Unique Subnets**: Each subnet within a VPC must have a unique CIDR block that is a subset of the VPC's CIDR range.
- **Future Growth**: Choose CIDR block sizes that allow for sufficient IP addresses as your infrastructure scales.

You should document your assigned ranges locally or in your organization's network architecture documentation to maintain a clear overview of your network landscape.
