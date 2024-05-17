import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Select,
  Col,
  Row,
  InputNumber,
} from 'antd';
import axios from 'axios';
import { useMemoAsync } from '@chengsokdara/react-hooks-async';
import { AiOutlineAudio } from 'react-icons/ai';
import {
  defaultStopTimeout,
  ffmpegCoreUrl,
  silenceRemoveCommand,
  whisperApiEndpoint,
} from './config';

/**
 * default useWhisper configuration
 */
const defaultConfig = {
  apiKey: `${process.env.REACT_APP_OPENAI_API_KEY}`,
  autoTranscribe: true,
  mode: 'transcriptions',
  nonStop: true,
  removeSilence: false,
  stopTimeout: defaultStopTimeout,
  streaming: false,
  timeSlice: 1_000,
  onDataAvailable: undefined,
  onTranscribe: undefined,
};

/**
 * default timeout for recorder
 */
const defaultTimeout = {
  stop: undefined,
};

/**
 * default transcript object
 */
// const defaultTranscript = {
//   blob: undefined,
//   text: undefined,
// };

// Default voice setting for text-to-speech
const inputVoice = `${process.env.REACT_APP_INPUT_VOICE}`; // https://platform.openai.com/docs/guides/text-to-speech/voice-options
const inputModel = `${process.env.REACT_APP_INPUT_MODEL}`; // https://platform.openai.com/docs/guides/text-to-speech/audio-quality

const templateList = [
  'In this theme, students learn words to describe feelings and emotions. They also learn how to give and accept apologies.',
  "In this theme, students learn how to describe people's personalities. Students also practice sharing opinions about different situations.",
  'This theme covers common vocabulary used in celebrations. Students will also practice expressing affection with family and friends.',
];

export function VoiceChat() {
  /**
   * React Hook for OpenAI Whisper
   */
  const {
    apiKey,
    autoTranscribe,
    mode,
    nonStop,
    removeSilence,
    stopTimeout,
    streaming,
    timeSlice,
    whisperConfig,
    onDataAvailable: onDataAvailableCallback,
    onTranscribe: onTranscribeCallback,
  } = {
    ...defaultConfig,
  };

  if (!apiKey && !onTranscribeCallback) {
    throw new Error('apiKey is required if onTranscribe is not provided');
  }

  const chunks = useRef([]);
  const encoder = useRef();
  const listener = useRef();
  const recorder = useRef();
  const stream = useRef();
  const timeout = useRef(defaultTimeout);

  // const [recording, setRecording] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // const [transcribing, setTranscribing] = useState(false);
  // const [transcript, setTranscript] = useState(defaultTranscript);
  const [recordFlag, setRecordFlag] = useState(false);

  const [systemPrompt, setSystemPrompt] = useState('');
  const [theme, setTheme] = useState(0);

  const [count, setCount] = useState(10);
  const [endFlag, setEndFlag] = useState(false);
  const [userFlag, setUserFlag] = useState(false);
  const [botFlag, setBotFlag] = useState(false);
 
  /**
   * cleanup on component unmounted
   * - flush out and cleanup lamejs encoder instance
   * - destroy recordrtc instance and clear it from ref
   * - clear setTimout for onStopRecording
   * - clean up hark speaking detection listeners and clear it from ref
   * - stop all user's media steaming track and remove it from ref
   */
  useEffect(() => {
   
    return () => {
        
      if (chunks.current) {
        chunks.current = [];
      }
      if (encoder.current) {
        encoder.current.flush();
        encoder.current = undefined;
      }
      if (recorder.current) {
        recorder.current.destroy();
        recorder.current = undefined;
      }
      onStopTimeout('stop');
      if (listener.current) {
        // @ts-ignore
        listener.current.off('speaking', onStartSpeaking);
        // @ts-ignore
        listener.current.off('stopped_speaking', onStopSpeaking);
      }
      if (stream.current) {
        stream.current.getTracks().forEach((track) => track.stop());
        stream.current = undefined;
      }
    };
  }, []);
 

  /**
   * start speech recording and start listen for speaking event
   */
  const startRecording = async () => {
    console.log("onStart");
    await onStartRecording();
  };

  /**
   * stop speech recording and start the transcription
   */
  const stopRecording = async () => {
    await onStopRecording();
  };

  /**
   * start speech recording event
   * - first ask user for media stream
   * - create recordrtc instance and pass media stream to it
   * - create lamejs encoder instance
   * - check recorder state and start or resume recorder accordingly
   * - start timeout for stop timeout config
   * - update recording state to true
   */
  
  const onStartRecording = async () => {
    try {
      if (!stream.current) {
        await onStartStreaming();
      }
      if (stream.current) {
        if (!recorder.current) {
          const {
            default: { RecordRTCPromisesHandler, StereoAudioRecorder },
          } = await import('recordrtc');
          const recorderConfig = {
            mimeType: 'audio/wav',
            numberOfAudioChannels: 1, // mono
            recorderType: StereoAudioRecorder,
            sampleRate: 44100, // Sample rate = 44.1khz
            timeSlice: streaming ? timeSlice : undefined,
            type: 'audio',
            ondataavailable: undefined,
          };
          recorder.current = new RecordRTCPromisesHandler(
            stream.current,
            recorderConfig,
          );
        }
        if (!encoder.current) {
          const { Mp3Encoder } = await import('lamejs');
          encoder.current = new Mp3Encoder(1, 44100, 96);
        }
        const recordState = await recorder.current.getState();
        if (recordState === 'inactive' || recordState === 'stopped') {
            console.log(recordState);
          await recorder.current.startRecording();
        }
        if (recordState === 'paused') {
          await recorder.current.resumeRecording();
        }
        if (nonStop) {
          onStartTimeout('stop');
        }
        // setRecording(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * get user media stream event
   * - try to stop all previous media streams
   * - ask user for media stream with a system popup
   * - register hark speaking detection listeners
   */
  const onStartStreaming = async () => {
    try {
      if (stream.current) {
        stream.current.getTracks().forEach((track) => track.stop());
      }
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      if (!listener.current) {
        const { default: hark } = await import('hark');
        listener.current = hark(stream.current, {
          interval: 100,
          play: false,
        });
        listener.current.on('speaking', onStartSpeaking);
        listener.current.on('stopped_speaking', onStopSpeaking);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * start stop timeout event
   */
  const onStartTimeout = (type) => {
    if (!timeout.current[type]) {
      timeout.current[type] = setTimeout(onStopRecording, stopTimeout);
    }
  };

  /**
   * user start speaking event
   * - set speaking state to true
   * - clear stop timeout
   */
  const onStartSpeaking = () => {
    console.log('start speaking');
    setSpeaking(true);
    onStopTimeout('stop');
  };

  /**
   * user stop speaking event
   * - set speaking state to false
   * - start stop timeout back
   */
  const onStopSpeaking = () => {
    console.log('stop speaking');
    setSpeaking(false);
    if (nonStop) {
      onStartTimeout('stop');
    }
  };

  /**
   * stop speech recording event
   * - flush out lamejs encoder and set it to undefined
   * - if recorder state is recording or paused, stop the recorder
   * - stop user media stream
   * - clear stop timeout
   * - set recording state to false
   * - start Whisper transcription event
   * - destroy recordrtc instance and clear it from ref
   */
  const onStopRecording = async () => {
    try {
      if (recorder.current) {
        const recordState = await recorder.current.getState();
        if (recordState === 'recording' || recordState === 'paused') {
          await recorder.current.stopRecording();
        }
        onStopStreaming();
        onStopTimeout('stop');
        // setRecording(false);
        if (autoTranscribe) {
          await onTranscribing();
        } else {
          // const blob = await recorder.current.getBlob();
          // setTranscript({
          //   blob,
          // });
        }
        await recorder.current.destroy();
        chunks.current = [];
        if (encoder.current) {
          encoder.current.flush();
          encoder.current = undefined;
        }
        recorder.current = undefined;
      }
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * stop media stream event
   * - remove hark speaking detection listeners
   * - stop all media stream tracks
   * - clear media stream from ref
   */
  const onStopStreaming = () => {
    if (listener.current) {
      // @ts-ignore
      listener.current.off('speaking', onStartSpeaking);
      // @ts-ignore
      listener.current.off('stopped_speaking', onStopSpeaking);
      listener.current = undefined;
    }
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop());
      stream.current = undefined;
    }
  };

  /**
   * stop timeout event
   * - clear stop timeout and remove it from ref
   */
  const onStopTimeout = (type) => {
    if (timeout.current[type]) {
      clearTimeout(timeout.current[type]);
      timeout.current[type] = undefined;
    }
  };

  /**
   * start Whisper transcrition event
   * - make sure recorder state is stopped
   * - set transcribing state to true
   * - get audio blob from recordrtc
   * - if config.removeSilence is true, load ffmpeg-wasp and try to remove silence from speec
   * - if config.customServer is true, send audio data to custom server in base64 string
   * - if config.customServer is false, send audio data to Whisper api in multipart/form-data
   * - set transcript object with audio blob and transcription result from Whisper
   * - set transcribing state to false
   */
  const onTranscribing = async () => {
    console.log('transcribing speech');
    try {
      if (encoder.current && recorder.current) {
        const recordState = await recorder.current.getState();
        if (recordState === 'stopped') {
          // setTranscribing(true);
          let blob = await recorder.current.getBlob();
          if (removeSilence) {
            const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
            const ffmpeg = createFFmpeg({
              mainName: 'main',
              corePath: ffmpegCoreUrl,
              log: true,
            });
            if (!ffmpeg.isLoaded()) {
              await ffmpeg.load();
            }
            const buffer = await blob.arrayBuffer();
            console.log({ in: buffer.byteLength });
            ffmpeg.FS('writeFile', 'in.wav', new Uint8Array(buffer));
            await ffmpeg.run(
              '-i', // Input
              'in.wav',
              '-acodec', // Audio codec
              'libmp3lame',
              '-b:a', // Audio bitrate
              '96k',
              '-ar', // Audio sample rate
              '44100',
              '-af', // Audio filter = remove silence from start to end with 2 seconds in between
              silenceRemoveCommand,
              'out.mp3', // Output
            );
            const out = ffmpeg.FS('readFile', 'out.mp3');
            console.log({ out: out.buffer.byteLength });
            // 225 seems to be empty mp3 file
            if (out.length <= 225) {
              ffmpeg.exit();
              // setTranscript({
              //   blob,
              // });
              // setTranscribing(false);
              return;
            }
            blob = new Blob([out.buffer], { type: 'audio/mpeg' });
            ffmpeg.exit();
          } else {
            const buffer = await blob.arrayBuffer();
            console.log({ wav: buffer.byteLength });
            const mp3 = encoder.current.encodeBuffer(new Int16Array(buffer));
            blob = new Blob([mp3], { type: 'audio/mpeg' });
            console.log({ blob, mp3: mp3.byteLength });
          }
          if (typeof onTranscribeCallback === 'function') {
            const transcribed = await onTranscribeCallback(blob);
            console.log('onTranscribe', transcribed);
            // setTranscript(transcribed);
          } else {
            const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' });
            const text = await onWhispered(file);
            console.log('onTranscribing', { text });
            // setTranscript({
            //   blob,
            //   text,
            // });
            sendQuestion(text);
          }
          // setTranscribing(false);
        }
      }
    } catch (err) {
      console.info(err);
      // setTranscribing(false);
    }
  };

  /**
   * Send audio file to Whisper to be transcribed
   * - create formdata and append file, model, and language
   * - append more Whisper config if whisperConfig is provided
   * - add OpenAPI Token to header Authorization Bearer
   * - post with axios to OpenAI Whisper transcript endpoint
   * - return transcribed text result
   */
  const onWhispered = useMemoAsync(
    async (file) => {
      // Whisper only accept multipart/form-data currently
      const body = new FormData();
      body.append('file', file);
      body.append('model', 'whisper-1');
      if (mode === 'transcriptions') {
        body.append('language', whisperConfig?.language ?? 'en');
      }
      if (whisperConfig?.prompt) {
        body.append('prompt', whisperConfig.prompt);
      }
      if (whisperConfig?.response_format) {
        body.append('response_format', whisperConfig.response_format);
      }
      if (whisperConfig?.temperature) {
        body.append('temperature', `${whisperConfig.temperature}`);
      }
      const headers = {};
      headers['Content-Type'] = 'multipart/form-data';
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      const { default: axios } = await import('axios');
      const response = await axios.post(whisperApiEndpoint + mode, body, {
        headers,
      });
      return response.data.text;
    },
    [apiKey, mode, whisperConfig],
  );

  // Function to convert text to speech and play it using Speaker
  const playAudio = async (inputText) => {
    const url = 'https://api.openai.com/v1/audio/speech';
    const headers = {
      Authorization: `Bearer ${apiKey}`, // API key for authentication
    };

    const data = {
      model: inputModel,
      input: inputText,
      voice: inputVoice,
      response_format: 'mp3',
    };

    try {
      // Make a POST request to the OpenAI audio API
      const response = await axios.post(url, data, {
        headers: headers,
        responseType: 'blob',
      });
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' }); // Replace 'audio/mp3' with the correct type
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.addEventListener('loadeddata', () => {
        audio
          .play()
          .catch((error) => console.error('Error playing the audio', error));
      });
      audio.addEventListener('ended', async () => {
        setBotFlag(false);
        if (
          messages?.filter((message) => message.isBot === false).length >= count
        ) {
          setEndFlag(true);
        } else {
          setUserFlag(true);
          await startRecording();
        }
      });
    } catch (error) {
      // Handle errors from the API or the audio processing
      if (error.response) {
        console.error(
          `Error with HTTP request: ${error.response.status} - ${error.response.statusText}`,
        );
      } else {
        console.error(`Error in streamedAudio: ${error.message}`);
      }
    }
  };

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [feedback, setFeedback] = useState('');

  const sendQuestion = (text) => {
    setQuestion(text);
    setMessages((messages) => [
      ...messages,
      { key: messages.length, isBot: false, data: text },
      { key: messages.length + 1, isBot: true, data: '...' },
    ]);
    setUserFlag(false);
    setBotFlag(true);
  };

  useEffect(() => {
    if (messages.length && recordFlag && question) {
      var config = {
        method: 'POST',
        url: `${process.env.REACT_APP_SERVER_URL}/chat`,
        data: {
          system_input: systemPrompt,
          human_input: question,
        },
      };

      setQuestion('');

      axios(config)
        .then(async (response) => {
          let current_messages = messages;
          current_messages.pop();

          setMessages((prev) => [
            ...current_messages,
            {
              key: current_messages.length,
              isBot: true,
              data: response.data,
            },
          ]);

          await playAudio(response.data);
        })
        .catch((error) => {
          return error;
        });
    }
  }, [messages]);

  useEffect(() => {
    (async () => {
      try {
        if (endFlag && messages.length) {
          setRecordFlag(false);
          setUserFlag(false);
          setBotFlag(false);
          await stopRecording();
          let response = await axios.post(
            `${process.env.REACT_APP_SERVER_URL}/feedback`,
            {
              chat_history: messages?.map((item) => ({
                who: item.isBot ? 'ai' : 'user',
                text: item.data,
              })),
            },
          );
          setFeedback(response.data);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [endFlag]);

  const handleAudio = async () => {
    if (!recordFlag) {
      setRecordFlag(true);
      setUserFlag(true);
      await startRecording();
    }
  };

  return (
    <>
      <Row style={{ height: 'calc(100vh - 450px)' }}>
        <Col span={16}>
          <div style={{ width: '100%' }}>
            {/* <Space direction="vertical"> */}
            <Select
              defaultValue="lucy"
              style={{ width: 300 }}
              onChange={(value) => {
                setTheme(value);
                setSystemPrompt(templateList[value - 1]);
              }}
              value={theme}
              options={[
                { value: 0, label: 'Select Theme', disabled: true },
                { value: 1, label: 'Expressing Feelings and Emotions' },
                { value: 2, label: "Describing People's Personalities" },
                { value: 3, label: 'Celebrations' },
              ]}
            />
            <br />
            <br />
            <Input.TextArea
              rows={4}
              placeholder="System Prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
            <br />
            <br />
            <div style={{ display: 'flex' }}>
              <Space>
                <InputNumber
                  addonBefore="Chat Limit:"
                  style={{ width: '200' }}
                  min={1}
                  max={50}
                  value={count}
                  onChange={(value) => setCount(value)}
                />
                <Button
                  type="primary"
                  style={{}}
                  onClick={() => setEndFlag(true)}
                >
                  Chat End
                </Button>
              </Space>
            </div>
            <br />
            <br />
            <div
              onClick={handleAudio}
              style={{
                display: 'flex',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {recordFlag ? (
                <AiOutlineAudio
                  size={40}
                  color="lightgreen"
                  className="voice-svg"
                />
              ) : (
                <AiOutlineAudio size={40} className="voice-svg" />
              )}
            </div>

            <div
              style={{
                padding: 8,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <img
                style={{
                  width: 40,
                  height: 40,
                  marginTop: 25,
                  backgroundColor: botFlag ? 'gray' : '',
                }}
                className="voice-svg"
                src="assets/ai-speech2.png"
                alt="assets/ai-speech2.png"
              />
              <img
                style={{
                  width: 40,
                  height: 40,
                  marginTop: 25,
                  backgroundColor: userFlag ? 'gray' : '',
                }}
                className="voice-svg"
                src="assets/user-speech2.png"
                alt="NYC"
              />
            </div>
          </div>
        </Col>
        <Col offset={1} span={7} className="feedback-card">
          <Card title="Feedback">
            <div
              dangerouslySetInnerHTML={{
                __html: feedback.replace(/\n/g, '<br />'),
              }}
            ></div>
          </Card>
        </Col>
      </Row>
    </>
  );
}

VoiceChat.displayName = 'VoiceChat';

export default VoiceChat;
