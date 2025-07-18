import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const JitsiComponent = ({ roomName, displayName, password }) => {
  const jitsiContainerRef = useRef(null);
  const screenShareContainerRef = useRef(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);

  useEffect(() => {
    jitsiContainerRef.current.innerHTML = '';

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: 600,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        prejoinPageEnabled: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
      },
      password: password,
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    return () => api.dispose();
  }, [roomName, displayName, password]);

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      screenShareContainerRef.current.innerHTML = '';
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setIsScreenSharing(true);
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.className = 'w-full h-full object-contain';
        screenShareContainerRef.current.innerHTML = '';
        screenShareContainerRef.current.appendChild(videoElement);

        // Stop sharing when the stream is closed by the user
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
          screenShareContainerRef.current.innerHTML = '';
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast.error('Failed to share screen.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-pink-600 dark:text-pink-400">
          Video Call
        </h3>
        <button
          onClick={handleScreenShare}
          className={`px-4 py-2 rounded-lg text-white ${
            isScreenSharing
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-pink-600 dark:bg-pink-500 hover:bg-pink-700 dark:hover:bg-pink-600'
          } transition-colors`}
        >
          {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        </button>
      </div>
      <div
        ref={jitsiContainerRef}
        className="w-full h-[600px] rounded-xl overflow-hidden shadow-xl bg-white dark:bg-gradient-to-r dark:from-pink-200 dark:to-purple-200"
      />
      {isScreenSharing && (
        <div className="bg-white dark:bg-gradient-to-r dark:from-pink-200 dark:to-purple-200 p-4 rounded-xl shadow-xl">
          <h4 className="text-lg font-semibold text-pink-600 dark:text-pink-400 mb-2">
            Screen Share
          </h4>
          <div
            ref={screenShareContainerRef}
            className="w-full h-[300px] bg-black rounded-lg overflow-hidden"
          />
        </div>
      )}
    </div>
  );
};

export default JitsiComponent;