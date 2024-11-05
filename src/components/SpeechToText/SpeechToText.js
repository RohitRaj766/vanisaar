import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startRecognition, stopRecognition, setTranscription } from '../../redux/actions/speechActions';
import { useSummary } from 'use-react-summary';
import Spinner from './Spinner';
import Navbar from './Navbar';

const STOP_WORDS = [
    'a', 'an', 'and', 'the', 'but', 'or', 'for', 'to', 'with', 'at', 'in', 'on',
    'by', 'as', 'of', 'so', 'that', 'is', 'was', 'were', 'are', 'be', 'been',
    'having', 'if', 'then', 'because', 'although', 'while', 'until', 'when', 'i', 'my', 'me', 'your', 'you', 'very', 'do', 'it'
];

const WordDetailCard = ({ word, definition, synonyms, antonyms, theme }) => {
    return (
        <div className={`border overflow-y-auto rounded-lg p-6 mb-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 shadow-md hover:shadow-lg transition-shadow duration-300 h-64 flex flex-col justify-between ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <h2 className="font-bold text-xl text-cyan-600">{definition ? word : word + " (bad request)"}</h2>
            <p className="mt-2">
                <strong>Definition:</strong> {definition || 'Loading...'}
            </p>
            <div>
                <p className="mt-2">
                    <strong>Synonyms:</strong> {synonyms?.length > 0 ? synonyms.join(', ') : 'None'}
                </p>
                <p className="mt-2">
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
    const [summarizedfinalWords, setSummarizedFinalWords] = useState([]);
    const [speechIsOn, setSpeechIsOn] = useState('');
    const [summary, setSummary] = useState(''); // New state for summary
    const [searchTerm, setSearchTerm] = useState("");
    const [theme, setTheme] = useState('light'); // Add theme state
    const [storydata, setStorydata] = useState();
    const [ImpLENGHT, setImpLENGTH] = useState();



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
            const len = uniqueWords.length
            setImpLENGTH(len);
            console.log("uniquie lenght::: ", len)
            setTimeout(() => {
                dispatch(setTranscription(uniqueWords));
                // Set a summary based on the unique words (for demonstration)
                setSummary(uniqueWords.join(', '));
            }, 300);
            setStorydata(speechIsOn)
        }

    };
    const text = storydata;
    const { summarizeText, isLoading, error } = useSummary({ text, words: 100 });
    useEffect(() => {
        const wordformsummary = summarizeText.props.children.split(" ").filter(word => word.trim().length > 0);

        // Filter out stop words
        const FilterWords = wordformsummary.filter((word) => {
            return !STOP_WORDS.includes(word.toLowerCase());  // Check if the word is not in STOP_WORDS (case insensitive)
        });
        const removeSymbols = /[^a-zA-Z0-9\s]/g;  // This will match everything except alphabets, numbers, and spaces

        console.log("Filtered Words: ", FilterWords);
        // Now remove symbols from each word
const cleanedWords = FilterWords.map(word => word.replace(removeSymbols, ''));

// Join the words into a string, separated by commas (or spaces, depending on your need)
setSummarizedFinalWords(cleanedWords.join(', '));
        console.log("storydate :: ", wordformsummary)
        console.log("totalFetchedDetails :: ", totalFetchedDetails)
        console.log("_LENGHT :: " + (ImpLENGHT - 2) + "totalFetchedDetails.length :: "+ totalFetchedDetails.length)
        if(ImpLENGHT - 2 === totalFetchedDetails.length){
            dispatch(setTranscription(FilterWords))
        }
  
        // const summarizedWords = summarizeText || " ";// Ensure no empty words
    //   const mainsummary =summarizedWords ?  : " "; 
        // Extract unique words from `totalFetchedDetails`
        const uniqueFinalWords = totalFetchedDetails.filter((item, index, self) =>
          index === self.findIndex((t) => t.word === item.word)
        );
      
        // Summarized words will be an array (assuming summarizeText returns a string of text that you split)
        // Combine unique words and summarized words
        setFinalWords([...uniqueFinalWords]);  // Combine arrays if you need both
      
        // Optionally, set story data (if you want to keep the original speech)
        setStorydata(speechIsOn);
      
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

            <div className="p-5 flex flex-col items-center justify-evenly mx-auto bg-transparent ">
                <div className='flex flex-row justify-between space-x-4 w-full'>

                    {/* Speech to Text Box */}
                    <div className={`w-full border shadow-md rounded-lg p-6 h-[80vh] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
                        <h1 className="text-2xl font-bold text-center text-cyan-700 mb-4">Speech to Text</h1>
                        <div className="flex justify-between mb-4"></div>
                        <div className={`p-2 border border-gray-300 rounded-lg bg-gray-50 shadow-inner overflow-y-auto h-[calc(100%-7rem)] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
                            {speechIsOn || 'No speech detected yet.'}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className='text-left'>
                              Total words in speech - {speechIsOn.split(' ').length - 1}
                            </span>
                            {isRecognizing ? (
                                <>
                                    <Spinner />
                                    <button
                                        onClick={stopRecognitionHandler}
                                        disabled={!isRecognizing}
                                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition ml-2"
                                    >
                                        Stop Recognition
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={startRecognitionHandler}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                                >
                                    Start Recognition
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Box */}
                    <div className={`w-full border shadow-md rounded-lg p-4 h-[80vh] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
                        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-4">Summary</h2>
                        <div className={`p-2 mt-10 border border-gray-300 rounded-lg bg-gray-50 shadow-inner overflow-y-auto h-[calc(100%-8rem)] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
                            <p>
                                <div className=' text-cyan-700'>
                                    {isLoading && <p>Loading...</p>}
                                    {error && <p>Error: {error}</p>}
                                    {summarizeText}
                                </div>
                            </p>
<br />

                            <hr />

                            <p className='mt-5'>Important words from speech and summary, details for each words is provided below. <br /><br />
                            
                                {summary || 'No summary available yet.'} <br />
                                {summarizedfinalWords}{console.log("summarizedfinalWords :: ",summarizedfinalWords)}
                    
</p>

                        </div>
                        <p className='text-left mt-5'>
                              Total important words in summary - {finalWords.length}
                        </p>
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
                                theme={theme} // Pass the theme prop
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpeechToText;