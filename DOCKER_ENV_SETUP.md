# Docker Environment Setup Guide

## OpenAI API Key Configuration

The Docker containers now require your OpenAI API key to function properly. Here are three ways to set it up:

### Option 1: Environment Variable (Recommended for Development)

Set the environment variable in your terminal before running Docker Compose:

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="your-actual-openai-api-key-here"
docker-compose -f docker-compose.dev.yml up
```

**Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your-actual-openai-api-key-here
docker-compose -f docker-compose.dev.yml up
```

**macOS/Linux (Bash):**
```bash
export OPENAI_API_KEY="your-actual-openai-api-key-here"
docker-compose -f docker-compose.dev.yml up
```

### Option 2: Create a .env file in the project root

Create a `.env` file in the project root (same directory as `docker-compose.dev.yml`):

```bash
# .env file in project root
OPENAI_API_KEY=your-actual-openai-api-key-here
```

Then run:
```bash
docker-compose -f docker-compose.dev.yml up
```

### Option 3: Direct Edit (Not Recommended)

You can temporarily edit the `docker-compose.dev.yml` file and replace `your-openai-api-key-here` with your actual API key, but this is not recommended as you might accidentally commit your API key.

## Important Notes

1. **Never commit your actual API key to version control**
2. **Get your OpenAI API key from:** https://platform.openai.com/api-keys
3. **The API key format looks like:** `sk-...` (starts with "sk-")
4. **Make sure you have credits/billing set up** in your OpenAI account

## Verification

After setting up the API key and running the containers, you should see the backend start successfully without the OpenAI error. The backend logs should show:
```
Backend development server running on port 3001
Database connected successfully
```

## Troubleshooting

- If you still get the OpenAI error, double-check that your API key is correctly set
- Restart the Docker containers after setting the environment variable
- Check that your OpenAI account has available credits
