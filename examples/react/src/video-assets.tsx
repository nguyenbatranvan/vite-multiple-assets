import {useRef} from "react";

export const VideoAssets = () => {
    const videoRef = useRef(null);
    return <>
        <video src="/base/flower.mp4" controls ref={videoRef}/>
        <div className="card">
            <button
                onClick={() => {
                    const video = videoRef.current;
                    if (video && video.duration > 0) {
                        video.currentTime = video.duration / 2;
                    }
                }}
            >
                video.currentTime = video.duration / 2
            </button>
        </div>
    </>
}
