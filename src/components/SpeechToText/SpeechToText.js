import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startRecognition, stopRecognition, setTranscription } from '../../redux/actions/speechActions';
import Spinner from './Spinner';
import Navbar from './Navbar';

const STOP_WORDS = [
  'a', 'an', 'and', 'the', 'but', 'or', 'for', 'to', 'with', 'at', 'in', 'on', 
  'by', 'as', 'of', 'so', 'that', 'is', 'was', 'were', 'are', 'be', 'been', 
  'having', 'if', 'then', 'because', 'although', 'while', 'until', 'when', 'i', 'my', 'me', 'your', 'you'
];

const WordDetailCard = ({ word, definition, synonyms, antonyms }) => {
  return (
    <div className="border overflow-y-auto rounded-lg p-6 mb-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 h-64 flex flex-col justify-between">
      <h2 className="font-bold text-xl text-cyan-600"> {definition ? word : word + " (bad request)"}</h2>
      <p className="mt-2 text-gray-700">
        <strong>Definition:</strong> {definition || 'Loading...'}
      </p>
      <div>
        <p className="mt-2 text-gray-600">
          <strong>Synonyms:</strong> {synonyms?.length > 0 ? synonyms.join(', ') : 'None'}
        </p>
        <p className="mt-2 text-gray-600">
          <strong>Antonyms:</strong> {antonyms?.length > 0 ? antonyms.join(', ') : 'None'}
        </p>
      </div>
    </div>
  );
};

const SpeechToText = () => {
  const dispatch = useDispatch();
  const { isRecognizing, totalFetchedDetails } = useSelector(state => state.speech);
  
  const recognitionRef = useRef(null);
  const [finalWords, setFinalWords] = useState([]);
  const [speechIsOn, setSpeechIsOn] = useState('');
  const [summary, setSummary] = useState(''); // New state for summary
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState('light'); // Add theme state

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        dispatch(startRecognition());
      };

      recognition.onresult = (event) => {
        const interimText = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');

        setSpeechIsOn(interimText);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        dispatch(stopRecognition());
      };

      recognitionRef.current = recognition;
    } else {
      console.error('Speech recognition not supported in this browser.');
    }
  }, [dispatch]);

  const startRecognitionHandler = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopRecognitionHandler = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      const wordsArray = speechIsOn.split(' ').filter(word => !STOP_WORDS.includes(word.toLowerCase()));
      const uniqueWords = Array.from(new Set(wordsArray));
  
      setTimeout(() => {
        dispatch(setTranscription(uniqueWords)); 
        // Set a summary based on the unique words (for demonstration)
        setSummary(`Summary of words: ${uniqueWords.join(', ')}`);
      }, 300);
    }
  };

  useEffect(() => {
    const uniqueFinalWords = totalFetchedDetails.filter((item, index, self) =>
      index === self.findIndex((t) => t.word === item.word)
    );
    setFinalWords(uniqueFinalWords);
  }, [totalFetchedDetails]);

  // Filtered words based on search term
  const filteredWords = finalWords.filter(({ word }) =>
    word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-100 text-black min-h-screen'}>
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
      
      <div className="p-5 border border-cyan-800 max-w-xl mx-auto rounded-lg shadow-md">
        <div className=' border border-red-700'>
        <h1 className="text-2xl font-bold text-center mb-4">Speech to Text</h1>
        <div className="flex justify-between mb-4">
          <div>
            {isRecognizing ? (
              <>
                <Spinner />
                <button 
                  onClick={stopRecognitionHandler} 
                  disabled={!isRecognizing}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition ml-2"
                >
                  Stop Recognition
                </button>
              </>
            ) : (
              <button 
                onClick={startRecognitionHandler} 
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Start Recognition
              </button>
            )}
          </div>
        </div>
        <p className="p-2 border border-gray-300 rounded bg-white mb-4">
          {speechIsOn}
        </p>

        {/* Summary Box */}
        <div className="p-2 border border-gray-300 rounded bg-white">
          <h2 className="font-bold text-lg">Summary</h2>
          <p>{summary || 'No summary available yet.'}</p>
        </div>
      </div>
        </div>
   

      {/* Cards Layout with Search Bar */}
      <div className='p-4'>
        <div className="flex mb-4">
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search for a word...'
            className='border rounded-l-md p-2 flex-1'
          />
          <button 
            onClick={() => console.log("Searching for:", searchTerm)}
            className='bg-cyan-600 text-white rounded-r-md px-4 hover:bg-cyan-500 transition-colors duration-300'
          >
            Search
          </button>
        </div>
        
        <div className='flex flex-wrap justify-evenly gap-4'>
          {filteredWords.map(({ word, definition, synonyms, antonyms }, index) => (
            <WordDetailCard 
              key={index} 
              word={word} 
              definition={definition} 
              synonyms={synonyms} 
              antonyms={antonyms} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
