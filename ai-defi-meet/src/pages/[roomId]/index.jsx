import ChatBox from '@/component/ChatBox/ChatBox';
import RemotePeer from '@/component/RemotePeer/RemotePeer';
import {
  useLocalAudio,
  useLocalPeer,
  useLocalScreenShare,
  useLocalVideo,
  usePeerIds,
  useRoom,
} from '@huddle01/react/hooks';
import { AccessToken, Role } from '@huddle01/server-sdk/auth';
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Home({ token }) {
  const [displayName, setDisplayName] = useState('');
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false); // To control the AI listening state
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const recognitionRef = useRef(null);
  const { joinRoom, state } = useRoom({
    onJoin: (room) => {
      console.log('onJoin', room);
      updateMetadata({ displayName });
    },
    onPeerJoin: (peer) => {
      console.log('onPeerJoin', peer);
    },
  });
  const { enableVideo, isVideoOn, stream, disableVideo } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } =
    useLocalScreenShare();
  const { updateMetadata } = useLocalPeer();
  const { peerIds } = usePeerIds();
  const recognition = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (shareStream && screenRef.current) {
      screenRef.current.srcObject = shareStream;
    }
  }, [shareStream]);

  useEffect(() => {
    // Set up SpeechRecognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const SpeechGrammarList =
        window.SpeechGrammarList || window.webkitSpeechGrammarList;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        const speechRecognitionList = new SpeechGrammarList();

        recognition.grammars = speechRecognitionList;
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = false; // Finalized results only
        recognition.maxAlternatives = 1;

        // Event: result received
        recognition.onresult = (event) => {
          const latestTranscript =
            event.results[event.results.length - 1][0].transcript;
          console.log('Transcript:', latestTranscript);
          setTranscript(latestTranscript);
          sendToApi(latestTranscript); // Send to API
        };

        // Event: recognition ended
        recognition.onend = () => {
          if (isListening) {
            recognition.start(); // Restart listening
          }
        };

        // Event: handle recognition errors
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        recognitionRef.current = recognition; // Store in ref
      } else {
        console.error('SpeechRecognition not supported in this browser.');
      }
    }

    // Cleanup on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  // Function to handle the API call
  const sendToApi = async (message) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (data.response) {
        setAiResponse(data.response);
        playAiResponse(data.response);
      } else {
        console.error('AI response error:', data);
      }
    } catch (error) {
      console.error('Error sending message to API:', error);
    }
  };

  // Function to play the AI response as speech
  const playAiResponse = (response) => {
    const speech = new SpeechSynthesisUtterance(response);
    window.speechSynthesis.speak(speech);
  };

  // Function to toggle the listening state
  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      setIsListening(!isListening);
    } else {
      console.error('SpeechRecognition is not initialized');
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-4 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <code className="font-mono font-bold">{state}</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {state === 'idle' && (
            <>
              <input
                disabled={state !== 'idle'}
                placeholder="Display Name"
                type="text"
                className="border-2 border-blue-400 rounded-lg p-2 mx-2 bg-black text-white"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />

              <button
                disabled={!displayName}
                type="button"
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  await joinRoom({
                    roomId: router.query.roomId,
                    token,
                  });
                }}
              >
                Join Room
              </button>
            </>
          )}

          {state === 'connected' && (
            <>
            <button
                className="bg-blue-500 p-2 rounded-lg mx-2"
                onClick={toggleListening}
              >
                {isListening ? 'Stop Listening' : 'Start Listening'}
              </button>
              <button
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  isVideoOn ? await disableVideo() : await enableVideo();
                }}
              >
                {isVideoOn ? 'Disable Video' : 'Enable Video'}
              </button>
              <button
                className="bg-blue-500 p-2 mx-2 rounded-lg"
                onClick={async () => {
                  isAudioOn ? await disableAudio() : await enableAudio();
                }}
              >
                {isAudioOn ? 'Disable Audio' : 'Enable Audio'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="w-full mt-8 flex gap-4 justify-between items-stretch">
        <div className="flex-1 justify-between items-center flex flex-col">
          <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
            <div className="relative flex gap-2">
              <div className="relative flex gap-2">
                {isVideoOn && (
                  <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                    <video
                      ref={videoRef}
                      className="aspect-video rounded-xl"
                      autoPlay
                      muted
                    />
                  </div>
                )}

                {/* AI Video */}
                {state === 'connected' && (
                  <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                    <video
                      className="aspect-video rounded-xl"
                      autoPlay
                      muted
                      loop
                      src="/ai.mp4" // Ensure this path is correct relative to the public directory
                    />
                  </div>
                )}

                {shareStream && (
                  <div className="w-1/2 mx-auto border-2 rounded-xl border-blue-400">
                    <video
                      ref={screenRef}
                      className="aspect-video rounded-xl"
                      autoPlay
                      muted
                    />
                  </div>
                )}
              </div>


            </div>
          </div>

          <div className="mt-8 mb-32 grid gap-2 text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
            {peerIds.map((peerId) =>
              peerId ? <RemotePeer key={peerId} peerId={peerId} /> : null
            )}
          </div>
        </div>
        {state === 'connected' &&
          <div className="w-1/3">
            <ChatBox />
          </div>
        }
      </div>
    </main>
  );
}

export const getServerSideProps = async (ctx) => {
  const accessToken = new AccessToken({
    apiKey: "ak_Vemhe2aX5N5w382v",
    roomId: ctx.params.roomId,

    role: Role.HOST,
    permissions: {
      admin: true,
      canConsume: true,
      canProduce: true,
      canProduceSources: {
        cam: true,
        mic: true,
        screen: true,
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true,
    },
  });

  const token = await accessToken.toJwt();

  console.log(token);

  return {
    props: { token },
  };
};
