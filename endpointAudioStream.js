const express = require("express");
const YTDlpWrap = require("yt-dlp-wrap").default;

const app = express();

app.use(express.json());

const ytDlpWrap = new YTDlpWrap();

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/audioStream", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                error: "Missing URL"
            });
        }

        console.log(`Fetching audio stream for URL: ${url}`);
        // Get video info
        const metadata = await ytDlpWrap.getVideoInfo(url);

        console.log(`Metadata fetched for ${metadata.title}`);
        // Find best audio-only format
        const audioFormats = metadata.formats.filter(f =>
            f.vcodec === "none" &&
            f.acodec !== "none"
        );
        console.log(`Found ${audioFormats.length} audio formats for ${metadata.title}`);


        if (audioFormats.length === 0) {
            return res.status(404).json({
                error: "No audio format found"
            });
        }
        console.log(`Selected audio format for ${metadata.title}: ${bestAudio.ext}`);
        // Highest bitrate audio
        const bestAudio = audioFormats.sort((a, b) =>
            (b.abr || 0) - (a.abr || 0)
        )[0];

        console.log(`Best audio format for ${metadata.title}: ${bestAudio.ext} at ${bestAudio.abr} kbps`);
        return res.json({
            title: metadata.title,
            streamUrl: bestAudio.url,
            mimeType: bestAudio.ext
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            error: "Failed to fetch audio stream"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});