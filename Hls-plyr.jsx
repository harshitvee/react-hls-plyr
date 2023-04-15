import React, { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

const HLSPlayer = ({ url }) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [currentLevel, setCurentLevel] = useState(0);
    const [hlsInstance, setHlsInstance] = useState({});
    var config = {
        xhrSetup: function (xhr, url) {
            xhr.withCredentials = true; // do send cookies
        },
    };
    useEffect(() => {
        hlsInstance.currentLevel = currentLevel;
    }, [currentLevel]);

    useEffect(() => {
        const hls = new Hls(config);
        const video = videoRef.current;

        if (Hls.isSupported()) {
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                console.log("video and hls.js are now bound together !");
            });

            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                console.log(
                    "manifest loaded, found " +
                        data.levels.length +
                        " quality level"
                );

                setHlsInstance(hls);

                const availableResolutions = hls.levels.map((level) => {
                    return level.height;
                });

                playerRef.current = new Plyr(videoRef.current, {
                    quality: {
                        default: 0,
                        options: [0, ...availableResolutions],
                        forced: true,
                        onChange: (quality) => {
                            if (quality === 0) {
                                setCurentLevel(-1);
                            } else {
                                hls.levels.forEach((level, levelIndex) => {
                                    if (level.height === quality) {
                                        setCurentLevel(levelIndex);
                                    }
                                });
                            }
                        },
                    },
                    i18n: {
                        qualityLabel: {
                            0: "Auto",
                        },
                    },
                    controls: [
                        "play-large", // The large play button in the center
                        "restart", // Restart playback
                        "rewind", // Rewind by the seek time (default 10 seconds)
                        "play", // Play/pause playback
                        "fast-forward", // Fast forward by the seek time (default 10 seconds)
                        "progress", // The progress bar and scrubber for playback and buffering
                        "current-time", // The current time of playback
                        "duration", // The full duration of the media
                        "mute", // Toggle mute
                        "volume", // Volume control
                        "captions", // Toggle captions
                        "settings", // Settings menu
                        "pip", // Picture-in-picture (currently Safari only)
                        // "airplay", // Airplay (currently Safari only)

                        "fullscreen", // Toggle fullscreen
                    ],
                });
                hls.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
                    var span = document.querySelector(
                        ".plyr__menu__container [data-plyr='quality'][value='0'] span"
                    );
                    if (hls.autoLevelEnabled) {
                        span.innerHTML = `AUTO (${
                            hls.levels[data.level].height
                        }p)`;
                    } else {
                        span.innerHTML = `AUTO`;
                    }
                });
            });
        } else if (
            videoRef.current.canPlayType("application/vnd.apple.mpegurl")
        ) {
            videoRef.current.src = src;
            playerRef.current = new Plyr(videoRef.current);

            videoRef.current.addEventListener("loadedmetadata", () => {
                playerRef.current.play();
            });
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, [url]);

    return (
        <>
            <video ref={videoRef} controls></video>
        </>
    );
};

export default HLSPlayer;
