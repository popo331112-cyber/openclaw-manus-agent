import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

// A simple skill module pattern to be integrated with the proxy server
export const videoDownloaderSkill = {
    name: "download_video",
    description: "Downloads a video from a given URL using yt-dlp.",
    parameters: {
        url: "string - The URL of the video to download"
    },
    async execute(url) {
        try {
            console.log(`Downloading video from ${url}...`);
            const outputPath = path.join(process.cwd(), 'public', 'downloads', '%(title)s.%(ext)s');
            
            // Using yt-dlp to download (needs to be installed in the environment)
            const command = `yt-dlp -o "${outputPath}" "${url}"`;
            const { stdout, stderr } = await execAsync(command);
            
            return `Successfully downloaded video. Output: ${stdout}`;
        } catch (error) {
            return `Failed to download video: ${error.message}`;
        }
    }
};
