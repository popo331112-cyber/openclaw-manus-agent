# OpenClaw Agent (Manus Style)

This repository contains a fully configured OpenClaw workspace to act as an agentic assistant (like Manus AI), ready with WhatsApp integration and Cloud deployment configurations.

## Setup Locally
1. Ensure Node.js v24+ is installed.
2. Run `npm install -g pnpm && pnpm install`
3. Run `npx openclaw onboard` to authenticate WhatsApp and model providers.

## Cloud Deployment (Render)
This repository includes a `render.yaml` for 1-click deployment to Render.
Make sure to provide your `OPENAI_API_KEY` in the Render dashboard environment variables.
