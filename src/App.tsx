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

// function EmojiIcon({
//   emoji,
//   ...props
// }: {
//   emoji: string;
// } & React.ImgHTMLAttributes<HTMLImageElement>) {
//   return (
//     <img
//       src={`data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`}
//       {...props}
//     />
//   );
// }

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
  console.log(acceptedFiles);
  const fileUrl = useMemo(() => {
    const files = acceptedFiles;
    if (!files) return;
    if (files.length === 0) return;
    const file = files[0];
    return URL.createObjectURL(file);
  }, [acceptedFiles]);

  return (
    <div className="App">
      <div id="container">
        <Player src={fileUrl} />
      </div>

      <div
        {...getRootProps({
          className: "dropzone",
          style: { display: fileUrl ? "none" : undefined },
        })}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
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
      video.playbackRate = Math.max(video.playbackRate + change, 0);
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
          return changePlaybackRate(-0.25);
        case "=":
          return changePlaybackRate(0.25);
        case "f":
          return goFullScreen();
      }
    };
    document.addEventListener("keydown", keydownListener);
    return () => {
      document.removeEventListener("keydown", keydownListener);
    };
  }, [playOrPause, seekVideo, changeVolume, changePlaybackRate]);

  // console.log('loaded player')

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
          setCurrentPlaybackRate(videoRef.current?.playbackRate || 0);
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
          `(${((currentTime / duration) * 100).toFixed(2)}%)`}
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
