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

        // Get video info
        const metadata = await ytDlpWrap.getVideoInfo(url);

        // Find best audio-only format
        const audioFormats = metadata.formats.filter(f =>
            f.vcodec === "none" &&
            f.acodec !== "none"
        );

        if (audioFormats.length === 0) {
            return res.status(404).json({
                error: "No audio format found"
            });
        }

        // Highest bitrate audio
        const bestAudio = audioFormats.sort((a, b) =>
            (b.abr || 0) - (a.abr || 0)
        )[0];

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