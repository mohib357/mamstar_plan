import React, { useState } from 'react';

const VideoUploader = ({ videos, onVideosChange }) => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateVideoUrl = (url) => {
        // Check if URL is valid YouTube or Vimeo URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/(\d+)/;

        return youtubeRegex.test(url) || vimeoRegex.test(url);
    };

    const addVideo = async () => {
        if (!videoUrl.trim()) {
            setError('Please enter a video URL');
            return;
        }

        if (!validateVideoUrl(videoUrl)) {
            setError('Please enter a valid YouTube or Vimeo URL');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulate API call to validate URL
            await new Promise(resolve => setTimeout(resolve, 500));

            const newVideo = {
                url: videoUrl,
                title: videoTitle || getVideoTitle(videoUrl),
                thumbnail: getVideoThumbnail(videoUrl),
                platform: videoUrl.includes('youtube') ? 'YouTube' :
                    videoUrl.includes('vimeo') ? 'Vimeo' : 'Video'
            };

            onVideosChange([...videos, newVideo]);
            setVideoUrl('');
            setVideoTitle('');
        } catch (err) {
            setError('Failed to add video. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const removeVideo = (index) => {
        onVideosChange(videos.filter((_, i) => i !== index));
    };

    const getVideoThumbnail = (url) => {
        // YouTube thumbnail
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            if (videoId) {
                return `https://img.youtube.com/vi/${videoId[1]}/0.jpg`;
            }
        }
        // Vimeo thumbnail
        else if (url.includes('vimeo.com')) {
            const videoId = url.match(/vimeo\.com\/(\d+)/);
            if (videoId) {
                // In a real app, you would use Vimeo API to get the thumbnail
                return `https://vumbnail.com/${videoId[1]}.jpg`;
            }
        }
        // Fallback placeholder
        return '/placeholder-video.jpg';
    };

    const getVideoTitle = (url) => {
        // Extract video ID for display
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return videoId ? `YouTube Video: ${videoId[1]}` : 'YouTube Video';
        } else if (url.includes('vimeo.com')) {
            const videoId = url.match(/vimeo\.com\/(\d+)/);
            return videoId ? `Vimeo Video: ${videoId[1]}` : 'Vimeo Video';
        }
        return 'Video';
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addVideo();
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Videos (URLs)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="space-y-3 mb-4">
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter YouTube or Vimeo URL"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        disabled={loading}
                    />
                    <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Video title (optional)"
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        disabled={loading}
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button
                        type="button"
                        onClick={addVideo}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                            </>
                        ) : 'Add Video'}
                    </button>
                </div>

                {/* Video Previews */}
                {videos.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Video Previews:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {videos.map((video, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <div className="relative">
                                        <img
                                            src={video.thumbnail || getVideoThumbnail(video.url || video)}
                                            alt="Video thumbnail"
                                            className="w-full h-32 object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/placeholder-video.jpg';
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                            {video.platform || (video.url?.includes('youtube') ? 'YouTube' :
                                                video.url?.includes('vimeo') ? 'Vimeo' : 'Video')}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium truncate" title={video.title || getVideoTitle(video.url || video)}>
                                            {video.title || getVideoTitle(video.url || video)}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate" title={video.url || video}>
                                            {video.url || video}
                                        </p>
                                        <div className="flex justify-end mt-2">
                                            <button
                                                type="button"
                                                onClick={() => removeVideo(index)}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoUploader;