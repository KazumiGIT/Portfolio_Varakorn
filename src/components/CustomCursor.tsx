import { useEffect, useState } from 'react';

export const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isClicking, setIsClicking] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide on touch devices
        const isTouchDevice = () => {
            return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0));
        };

        if (isTouchDevice() || window.innerWidth < 768) {
            setIsVisible(false);
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            // Check if hovering over clickable elements
            const target = e.target as HTMLElement;
            const isClickable = target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') !== null ||
                target.closest('button') !== null ||
                window.getComputedStyle(target).cursor === 'pointer';
            setIsHovering(isClickable);
        };

        const handleMouseDown = () => {
            setIsClicking(true);
            // Play Minecraft click sound
            const audio = new Audio('data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4T8DeHsAAAAAAD/+9DEAAADwBGkGYeQAH+CNINw8gAUgoIQGIoIQMUxgGBSHhSKimGAYBgUh4UiopiQKA4OAYFIeFIqKYkCgODgGBSHhSKimJAoDg4P/7kMQpgAOAEaQZh5AA8AI0gzDyABSHhSKimJAoDg4BgUh4UiopiQKA4OAYFIeFIqKYkCgODgGBSHhSKimJAoDg4BgUh4Uv/7kMQpgAOAEaQZh5AA8AI0gzDyABSKimJAoDg4BgUh4UiopiQKA4OAYFIeFIqKYkCgODgGBSHhSKimJAoDg4BgUh4UiopiQKA4OD/+5DEKYADgBGkGYeQAPACNIMw8gAUh4UiopiQKA4OAYFIeFIqKYkCgODgGBSHhSKimJAoDg4BgUh4UiopiQKA4OAYFIeFIqKYkCgODg==');
            audio.volume = 0.5;
            audio.play().catch(() => { }); // Ignore errors if audio doesn't play
        };

        const handleMouseUp = () => {
            setIsClicking(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
            className="pixel-cursor"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `translate(-50%, -50%) ${isClicking ? 'scale(0.9)' : 'scale(1)'}`,
            }}
        >
            {/* Pixel Hand Cursor SVG */}
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`transition-transform duration-100 ${isHovering ? 'scale-110' : ''}`}
            >
                {/* Hand outline - pixel art style */}
                <g className={isClicking ? 'clicking' : ''}>
                    {/* Finger */}
                    <rect x="14" y="4" width="4" height="4" fill="#FFE5CC" />
                    <rect x="14" y="8" width="4" height="4" fill="#FFD4AA" />

                    {/* Palm */}
                    <rect x="10" y="12" width="12" height="4" fill="#FFE5CC" />
                    <rect x="10" y="16" width="12" height="8" fill="#FFD4AA" />

                    {/* Thumb */}
                    <rect x="6" y="16" width="4" height="4" fill="#FFE5CC" />
                    <rect x="6" y="20" width="4" height="4" fill="#FFD4AA" />

                    {/* Shadow/outline */}
                    <rect x="14" y="4" width="4" height="1" fill="#CC9966" />
                    <rect x="22" y="12" width="1" height="12" fill="#CC9966" />
                    <rect x="10" y="24" width="12" height="1" fill="#CC9966" />
                    <rect x="9" y="16" width="1" height="8" fill="#CC9966" />
                </g>

                {/* Click effect particles */}
                {isClicking && (
                    <>
                        <circle cx="16" cy="16" r="2" fill="#FFD700" opacity="0.6" className="click-particle" />
                        <circle cx="20" cy="12" r="1.5" fill="#FFD700" opacity="0.4" className="click-particle" style={{ animationDelay: '0.05s' }} />
                        <circle cx="12" cy="20" r="1.5" fill="#FFD700" opacity="0.4" className="click-particle" style={{ animationDelay: '0.1s' }} />
                    </>
                )}
            </svg>
        </div>
    );
};
