import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { videoDownloaderSkill } from './skills/video-downloader/index.js';
import { oracleVpsSkill } from './skills/oracle-vps/index.js';
import { routeIntent } from './router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // LLM Agentic Routing
    const intent = await routeIntent(message);
    console.log("LLM Intent Router Selected:", intent);

    if (intent.skill === 'manage_oracle_vps') {
        const command = intent.parameter || "pm2 status";
        const result = await oracleVpsSkill.execute(command);
        return res.json({
            reply: `Maine Oracle VPS par command chala di hai:\n\n\`\`\`\n${result}\n\`\`\``,
            toolsUsed: ['manage_oracle_vps']
        });
    }

    if (intent.skill === 'download_video') {
        const urlMatch = intent.parameter || message.match(/(https?:\/\/[^\s]+)/)?.[0];
        if (urlMatch) {
            const result = await videoDownloaderSkill.execute(urlMatch);
            return res.json({
                reply: `Maine video download karne ki koshish ki hai.\nResult: ${result}\n(Files public/downloads folder mein save hongi)`,
                toolsUsed: ['download_video_skill']
            });
        } else {
            return res.json({
                reply: `Mujhe video ka link nahi mila. Barae meharbani link faraham karein.`,
                toolsUsed: ['download_video_skill']
            });
        }
    }

    // Normal OpenClaw execution for 'default' and "all-rounder" tasks
    try {
        const child = spawn('npx', ['openclaw', 'agent', '--message', message], {
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
                return res.json({
                    reply: `(Agent running in fallback mode)\nI received your task: "${message}". Please ensure OpenClaw is fully onboarded and API keys are set.`,
                    toolsUsed: ['mcporter', 'system_analysis']
                });
            }

            res.json({
                reply: output || "Task completed.",
                toolsUsed: ['openclaw-core']
            });
        });

        setTimeout(() => {
            if (!child.killed) {
                child.kill();
                res.json({
                    reply: `(Agent running in fallback mode)\nTask timed out. Simulated response for: "${message}".`,
                    toolsUsed: []
                });
            }
        }, 30000);

    } catch (error) {
        console.error('Execution error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Agent Web UI listening on port ${PORT}`);
});
