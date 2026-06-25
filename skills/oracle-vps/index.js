import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

export const oracleVpsSkill = {
    name: "manage_oracle_vps",
    description: "Executes commands on the Oracle Cloud VPS (e.g., pm2 restart, check logs) over SSH.",
    parameters: {
        command: "string - The shell command to execute on the remote VPS (e.g. 'pm2 status' or 'pm2 restart sanwal-chatbot')"
    },
    async execute(command) {
        try {
            console.log(`Executing on Oracle VPS: ${command}`);
            
            // Requires ORACLE_SSH_KEY to be set in environment variables (the actual private key text)
            if (!process.env.ORACLE_SSH_KEY) {
                return "Failed: ORACLE_SSH_KEY environment variable is missing. Please add the content of your ssh-key-2026-03-19.key to Render.";
            }

            await ssh.connect({
                host: '161.118.183.143',
                username: 'ubuntu',
                privateKey: process.env.ORACLE_SSH_KEY
            });

            const result = await ssh.execCommand(command, { cwd: '/home/ubuntu' });
            ssh.dispose();

            let output = `Command: ${command}\n\n`;
            if (result.stdout) output += `STDOUT:\n${result.stdout}\n`;
            if (result.stderr) output += `STDERR:\n${result.stderr}\n`;
            
            return output || "Command executed successfully, but returned no output.";
        } catch (error) {
            return `Failed to execute command on VPS: ${error.message}`;
        }
    }
};
