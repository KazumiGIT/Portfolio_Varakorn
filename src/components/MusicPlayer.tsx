import { useEffect, useRef } from 'react';

interface MusicPlayerProps {
    videoId: string;
    isPlaying: boolean;
    volume: number;
    onEnded?: () => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export const MusicPlayer = ({ videoId, isPlaying, volume, onEnded }: MusicPlayerProps) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                initializePlayer();
            };
        } else {
            initializePlayer();
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };
    }, []);

    // Handle videoId changes
    useEffect(() => {
        if (playerRef.current && playerRef.current.loadVideoById) {
            playerRef.current.loadVideoById(videoId);
        }
    }, [videoId]);

    // Handle playing state
    useEffect(() => {
        if (playerRef.current && playerRef.current.getPlayerState) {
            if (isPlaying) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }
        }
    }, [isPlaying]);

    // Handle volume changes
    useEffect(() => {
        if (playerRef.current && playerRef.current.setVolume) {
            playerRef.current.setVolume(volume);
        }
    }, [volume]);

    const initializePlayer = () => {
        if (!containerRef.current) return;

        playerRef.current = new window.YT.Player(containerRef.current, {
            height: '0',
            width: '0',
            videoId: videoId,
            playerVars: {
                'playsinline': 1,
                'controls': 0,
                'disablekb': 1,
                'fs': 0,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    };

    const onPlayerReady = (event: any) => {
        event.target.setVolume(volume);
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const onPlayerStateChange = (event: any) => {
        // YT.PlayerState.ENDED is 0
        if (event.data === 0 && onEnded) {
            onEnded();
        }
    };

    return <div ref={containerRef} style={{ display: 'none' }} />;
};
