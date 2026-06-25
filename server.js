import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fallback logic for when OpenClaw CLI is not fully setup
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Since npx openclaw chat is interactive, we will simulate a simple CLI call
    // For a real production app, you would use OpenClaw's API/Gateway methods.
    // Here we use a child_process to call openclaw run (if supported) or return a mock.
    
    try {
        // Try to execute a one-off openclaw command. 
        // This assumes openclaw has a way to run a task non-interactively.
        // If not, we will fallback to a simulated response for demonstration.
        const child = spawn('npx', ['openclaw', 'run', '--prompt', message], {
            env: { ...process.env, OPENAI_API_KEY: process.env.OPENAI_API_KEY }
        });

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0 && !output) {
                console.error(`Command failed with code ${code}: ${errorOutput}`);
                // Fallback to simulated response if openclaw run fails (e.g. not configured yet)
                return res.json({
                    reply: `(Agent running in fallback mode)\nI received your task: "${message}". Please ensure OpenClaw is fully onboarded and API keys are set.`,
                    toolsUsed: ['mcporter (simulated)']
                });
            }

            res.json({
                reply: output || "Task completed.",
                toolsUsed: ['openclaw-cli']
            });
        });

        // Add a timeout
        setTimeout(() => {
            if (!child.killed) {
                child.kill();
                res.json({
                    reply: `(Agent running in fallback mode)\nTask timed out. Simulated response for: "${message}".`,
                    toolsUsed: []
                });
            }
        }, 30000); // 30s timeout

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Agent Web UI listening on port ${PORT}`);
});
