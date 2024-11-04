import React, { useEffect, useRef, useState } from 'react';

const Spinner = () => (
  <div className="animate-spin h-5 w-5 border-4 border-blue-500 rounded-full border-t-transparent"></div>
);

const SpeechToText = () => {
  const startBtnRef = useRef(null);
  const stopBtnRef = useRef(null);
  const [recognition, setRecognition] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [definition, setDefinition] = useState("");
  const [antonyms, setAntonyms] = useState([]);
  const [synonyms, setSynonyms] = useState([]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onstart = () => {
        setIsRecognizing(true);
      };

      recognitionInstance.onresult = (event) => {
        const interimText = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');

        setTranscription(interimText);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionInstance.onend = () => {
        setIsRecognizing(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, []);

  const startRecognition = () => {
    if (recognition) {
      recognition.start();
      setTranscription('');
    }
  };

  const stopRecognition = () => {
    if (recognition) {
      recognition.stop();
      fetchWordData(transcription);
    }
  };

  const fetchWordData = async (text) => {
    const filteredWords = text.split(' ').filter(word =>
      !['is', 'the', 'at', 'and', 'a', 'an', 'he', 'she', 'it', 'they', 'we', 'you', 'me', 'him', 'her', 'this'].includes(word.toLowerCase())
    );

    const definitions = [];
    const synonymsList = [];
    const antonymsList = [];
  
    await Promise.all(filteredWords.map(async (word) => {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
  
        if (data[0]?.meanings[0]?.definitions[0]) {
          definitions.push(data[0].meanings[0].definitions[0].definition || "No definition available");
          synonymsList.push(...(data[0].meanings[0].definitions[0].synonyms || []));
          antonymsList.push(...(data[0].meanings[0].definitions[0].antonyms || []));
        }
      } catch (error) {
        console.error('Error fetching word data:', error);
      }
    }));
  
    // Update state with the accumulated results
    if (definitions.length > 0) {
      setDefinition(definitions[0]); // Set only the first definition
    } else {
      setDefinition("No definition available");
    }
    
    setSynonyms(synonymsList);
    setAntonyms(antonymsList);
  };
  

  return (
    <div className="p-5 max-w-xl mx-auto bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-4">Speech to Text</h1>
      <div className="flex justify-center mb-4">
        {isRecognizing ? (
          <>
            <Spinner />
            <button 
              ref={stopBtnRef} 
              onClick={stopRecognition} 
              disabled={!isRecognizing}
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition ml-2"
            >
              Stop Recognition
            </button>
          </>
        ) : (
          <button 
            ref={startBtnRef} 
            onClick={startRecognition} 
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Start Recognition
          </button>
        )}
      </div>
      <p className="p-2 border border-gray-300 rounded bg-white">
        {transcription}
      </p>
      <div className="mt-4">
        <h2 className="font-semibold">Definition:</h2>
        <p>{definition}</p>
        <h2 className="font-semibold">Synonyms:</h2>
        <p>{synonyms.length > 0 ? synonyms.join(', ') : 'None'}</p>
        <h2 className="font-semibold">Antonyms:</h2>
        <p>{antonyms.length > 0 ? antonyms.join(', ') : 'None'}</p>
      </div>
    </div>
  );
};

export default SpeechToText;
