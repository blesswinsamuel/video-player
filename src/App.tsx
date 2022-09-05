import {
  ImgHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDropzone } from "react-dropzone";
import {
  FaPlay,
  FaVolumeUp,
  FaPause,
  FaExpand,
  FaBackward,
  FaForward,
  FaFolder,
} from "react-icons/fa";
import "./App.css";

function App() {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      "video/*": [
        ".mp4",
        ".mp3",
        ".mkv",
        ".webm",
        ".3gp",
        ".avi",
        ".mpeg",
        ".mpg",
        ".ogg",
        ".wmv",
        ".wav",
        ".mov",
      ],
      "audio/*": [
        ".mp4",
        ".mp3",
        ".mkv",
        ".webm",
        ".3gp",
        ".avi",
        ".mpeg",
        ".mpg",
        ".ogg",
        ".wmv",
        ".wav",
        ".mov",
      ],
    },
  });
  const [fileURL, setFileURL] = useState<string | undefined>(undefined);
  useEffect(() => {
    console.log(acceptedFiles);
    const acceptedFile =
      acceptedFiles && acceptedFiles.length > 0 ? acceptedFiles[0] : undefined;
    if (!acceptedFile) return;
    const u = URL.createObjectURL(acceptedFile);
    setFileURL(u);
    console.log("generated file URL", u);
    return () => {
      if (fileURL) console.log("revoking file URL", fileURL);
      if (fileURL) URL.revokeObjectURL(fileURL);
    };
  }, [acceptedFiles]);

  return (
    <div className="App">
      <div id="container">
        <Player src={fileURL} />
      </div>

      <div
        {...getRootProps({
          className: "dropzone",
          style: { display: fileURL ? "none" : undefined },
        })}
      >
        <input {...getInputProps()} />
        <p>Drop video file here, or click to select a video file</p>
      </div>
    </div>
  );
}

function Player({ src }: { src?: string }) {
  const [paused, setPaused] = useState(true);
  const [controlsHidden, setControlsHidden] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVolume, setCurrentVolume] = useState(1.0);
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playing = !paused;

  const playVideo = useCallback(() => {
    videoRef.current?.play();
  }, [videoRef]);
  const pauseVideo = useCallback(() => {
    videoRef.current?.pause();
  }, [videoRef]);
  const playOrPause = useCallback(() => {
    if (videoRef.current?.paused) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [videoRef]);
  const seekVideo = useCallback(
    (change: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(
        Math.min(video.currentTime + change, video.duration),
        0
      );
    },
    [videoRef]
  );
  const setTime = useCallback(
    (pos: number) => {
      if (!videoRef.current) return;
      videoRef.current.currentTime = pos;
    },
    [videoRef]
  );
  const changeVolume = useCallback(
    (change: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.volume = Math.max(Math.min(video.volume + change, 1), 0);
    },
    [videoRef]
  );
  const setVolume = useCallback(
    (vol: number) => {
      if (!videoRef.current) return;
      videoRef.current.volume = vol;
    },
    [videoRef]
  );
  const changePlaybackRate = useCallback(
    (change: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = Math.max(video.playbackRate + change, 0.25);
    },
    [videoRef]
  );
  const setPlaybackRate = useCallback(
    (rate: number) => {
      if (!videoRef.current) return;
      videoRef.current.playbackRate = rate;
    },
    [videoRef]
  );
  const goFullScreen = useCallback(() => {
    videoRef.current?.requestFullscreen();
  }, [videoRef]);

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          return playOrPause();
        case "ArrowLeft":
          return seekVideo(-5);
        case "ArrowRight":
          return seekVideo(5);
        case "ArrowUp":
          return changeVolume(0.05);
        case "ArrowDown":
          return changeVolume(-0.05);
        case "-":
        case "[":
          return changePlaybackRate(-0.25);
        case "=":
        case "]":
          return changePlaybackRate(0.25);
        case "0":
        case "\\":
          return setPlaybackRate(1);
        case "f":
          return goFullScreen();
      }
    };
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [
    playOrPause,
    seekVideo,
    changeVolume,
    changePlaybackRate,
    setPlaybackRate,
  ]);

  // console.log('loaded player')

  if (!src) {
    return <></>;
  }

  return (
    <div
      id="player"
      onContextMenu={(e) => e.preventDefault()}
      onMouseEnter={(e) => {
        console.log("onMouseEnter");
        setControlsHidden(false);
      }}
      onMouseLeave={(e) => {
        console.log("onMouseLeave");
        setControlsHidden(true);
      }}
    >
      <video
        id="video"
        ref={videoRef}
        src={src}
        onContextMenu={(e) => {
          console.log("onContextMenu");
          e.preventDefault();
          playOrPause();
        }}
        onPlay={(e) => {
          console.log("onPlay");
          setPaused(false);
        }}
        onPause={(e) => {
          console.log("onPause");
          setPaused(true);
        }}
        onPlaying={(e) => {
          console.log("playing");
        }}
        onDurationChange={(e) => {
          console.log("onDurationChange");
          setDuration(videoRef.current?.duration || 0);
        }}
        onTimeUpdate={(e) => {
          // console.log("onTimeUpdate");
          setCurrentTime(videoRef.current?.currentTime || 0);
        }}
        onVolumeChange={(e) => {
          console.log("onVolumeChange");
          setCurrentVolume(videoRef.current?.volume || 0);
        }}
        onRateChange={(e) => {
          console.log("onRateChange");
          setCurrentPlaybackRate(videoRef.current?.playbackRate || 1);
        }}
      />
      <Controls
        paused={paused}
        duration={duration}
        volume={currentVolume}
        currentTime={currentTime}
        controls={{
          playVideo,
          pauseVideo,
          playOrPause,
          seekVideo,
          setVolume,
          changeVolume,
          setTime,
          goFullScreen,
        }}
        hidden={controlsHidden}
      />
      {/* <div id="info" className="disp-none"></div> */}
      <div id="lt-info" className="time-info">
        {`${formatTime(currentTime)} / ${formatTime(duration)} ` +
          `[-${formatTime(duration - currentTime)}] ` +
          `(${((currentTime / duration) * 100).toFixed(2)}%) ` +
          `ETA: ${new Intl.DateTimeFormat("en-GB", {
            hourCycle: "h12",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(
            new Date().getTime() +
              ((duration - currentTime) / 1 /*currentPlaybackRate*/) * 1000
          )}`}
      </div>
      <div id="rt-info" className="time-info">
        R: {currentPlaybackRate}, V: {Math.round(currentVolume * 100)}%
      </div>
      {/* <div id="error-info" className="disp-none"></div> */}
    </div>
  );
}

function formatTime(a: number) {
  var b = Math.round(a);
  a = Math.floor(b / 60);
  b %= 60;
  return `${10 > a ? "0" + a : a}:${10 > b ? "0" + b : b}`;
}

function Controls({
  paused,
  duration,
  volume,
  hidden,
  currentTime,
  controls,
}: {
  paused: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  hidden: boolean;
  controls: {
    playVideo: () => void;
    pauseVideo: () => void;
    playOrPause: () => void;
    seekVideo: (change: number) => void;
    setTime: (change: number) => void;
    changeVolume: (change: number) => void;
    setVolume: (change: number) => void;
    goFullScreen: () => void;
  };
}) {
  return (
    <div
      id="controls"
      style={{ opacity: hidden ? 0 : 1, transition: "opacity .2s" }}
    >
      <div id="progress-controls">
        <div id="progress-times">
          <span id="time-left" className="time">
            {formatTime(currentTime)}
          </span>
          <span id="time-right" className="time">
            {formatTime(duration)}
          </span>
        </div>
        <input
          type="range"
          id="progress"
          min="0"
          max={duration}
          step="any"
          value={currentTime}
          onChange={(e) => {
            controls.setTime(parseFloat(e.target.value));
          }}
        />
      </div>
      <div id="buttons-controls">
        <div id="buttons-left">
          <FaFolder className="btn" />
          <div id="volume-wrap">
            <FaVolumeUp className="btn" />
            <input
              type="range"
              id="volume"
              min={0}
              max={1}
              value={volume}
              onChange={(e) => {
                controls.setVolume(parseFloat(e.target.value));
              }}
              step={0.01}
            />
          </div>
        </div>
        <div id="buttons-center">
          {/* <EmojiIcon emoji="⏮️" className="btn btn-sm" /> */}
          <FaBackward
            className="btn btn-sm"
            onClick={() => controls.seekVideo(-5)}
          />
          {paused ? (
            <FaPlay className="btn" onClick={controls.playVideo} />
          ) : (
            <FaPause className="btn" onClick={controls.pauseVideo} />
          )}
          <FaForward
            className="btn btn-sm"
            onClick={() => controls.seekVideo(5)}
          />
          {/* <EmojiIcon emoji="⏭️" className="btn btn-sm" /> */}
        </div>
        <div id="buttons-right">
          <FaExpand className="btn" onClick={controls.goFullScreen} />
        </div>
      </div>
    </div>
  );
}

export default App;
