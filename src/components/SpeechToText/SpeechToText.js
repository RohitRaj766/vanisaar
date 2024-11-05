import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startRecognition, stopRecognition, setTranscription } from '../../redux/actions/speechActions';
import { useSummary } from 'use-react-summary';
import Spinner from './Spinner';
import Navbar from './Navbar';
import { FaSearch } from 'react-icons/fa';
import { jsPDF } from "jspdf";


const STOP_WORDS = [
    'a', 'an', 'and', 'the', 'but', 'or', 'for', 'to', 'with', 'at', 'in', 'on',
    'by', 'as', 'of', 'so', 'that', 'is', 'was', 'were', 'are', 'be', 'been',
    'having', 'if', 'then', 'because', 'although', 'while', 'until', 'when', 'i', 'my', 'me', 'your', 'you', 'very', 'do', 'it'
];

const WordDetailCard = ({ word, definition, synonyms, antonyms, theme }) => {
    return (
        <div className={`border overflow-y-auto cursor-pointer rounded-lg p-6 mb-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 shadow-md hover:shadow-lg  transform hover:scale-110 transition-transform duration-300 ease-in-out
                        min-w-[300px] h-auto md:min-h-[200px] flex flex-col  ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`} onClick={() => window.open(`https://www.google.com/search?q=${word}`, '_blank')} title="Click to search for more information about this word on Google">
            <h2
                className="font-bold text-xl text-cyan-800 underline cursor-pointer "
                onClick={() => window.open(`https://www.google.com/search?q=${word}`, '_blank')}
                title="Click to search for more information about this word on Google"
            >
                {definition ? word : word + " (bad request)"}
            </h2>


            {definition ?
                <p className="mt-2">
                    <strong className='text-cyan-600'>Definition:</strong> {definition || 'Loading...'}
                </p> : "Oop's something went wrong!"
            }
            <div>
                {synonyms.length ?
                    <p className="mt-2 ">
                        <strong className='text-cyan-600'>Synonyms:</strong> {synonyms?.length > 0 ? synonyms.join(', ') : 'None'}
                    </p>:""
                }
                {antonyms.length ?
                    <p className="mt-2">
                        <strong className='text-cyan-600'>Antonyms:</strong> {antonyms?.length > 0 ? antonyms.join(', ') : 'None'}
                    </p>:""
                }
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
    const [searchTerm, setSearchTerm] = useState("");
    const [theme, setTheme] = useState('light');
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
            setTimeout(() => {
                dispatch(setTranscription(uniqueWords));
            }, 300);
            setStorydata(speechIsOn)
        }

    };
    const text = storydata;
    const { summarizeText, isLoading, error } = useSummary({ text, words: 200 });

    useEffect(() => {
        const wordformsummary = summarizeText.props.children.split(" ").filter(word => word.trim().length > 0);
        const FilterWords = wordformsummary.filter((word) => {
            return !STOP_WORDS.includes(word.toLowerCase());
        });

        if (ImpLENGHT - 2 === totalFetchedDetails.length) {
            console.log(true)
            setTimeout(() => {
                dispatch(setTranscription(FilterWords))
            }, 3000)
        }

        const uniqueFinalWords = totalFetchedDetails.filter((item, index, self) =>
            index === self.findIndex((t) => t.word === item.word)
        );


        setFinalWords([...uniqueFinalWords]);
        setStorydata(speechIsOn);

    }, [totalFetchedDetails]);



    const filteredWords = finalWords.filter(({ word }) =>
        word.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const margin = { top: 20, left: 20, right: 20, bottom: 20 };
        let yPosition = margin.top;

        const addTextWithOverflow = (text, fontSize = 12) => {
            doc.setFontSize(fontSize);
            const pageHeight = doc.internal.pageSize.height;
            const lineHeight = 5;
            const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - margin.left - margin.right);
    
      
            for (let i = 0; i < lines.length; i++) {
                if (yPosition + lineHeight > pageHeight - margin.bottom) {
                    doc.addPage(); 
                    yPosition = margin.top; 
                }
    
                doc.text(lines[i], margin.left, yPosition);
                yPosition += lineHeight; 
            }
        };
    
        
        doc.setFontSize(18);
        doc.text("Speech to Text Summary", margin.left, yPosition);
        yPosition += 10; 
    
        doc.setFontSize(12);
        addTextWithOverflow("Speech Transcription:", 14);
        yPosition += 2;
        addTextWithOverflow(storydata || 'No speech detected', 12);
     
        yPosition += 10;
        addTextWithOverflow("Summary:", 14);
        yPosition += 2;
        addTextWithOverflow(summarizeText?.props?.children || 'No summary available', 12);
    
 
        yPosition += 10;
        addTextWithOverflow("Important Words:", 14);
        yPosition += 2;
        if (finalWords.length > 0) {
            finalWords.forEach((item, index) => {
                const cleanedWord = item.word.replace(/[^a-zA-Z0-9\s]/g, '');
                addTextWithOverflow(`${index + 1}. ${cleanedWord}`, 12);
            });
        } else {
            addTextWithOverflow("No important words available.", 12);
        }
    

        yPosition += 10;
        addTextWithOverflow("Word Details:", 14);
        yPosition += 2;
        filteredWords.forEach((wordDetail, index) => {
            yPosition += 2;
            const { word, definition, synonyms, antonyms } = wordDetail;
            addTextWithOverflow(`Word: ${word}`, 12);
            addTextWithOverflow(`Definition: ${definition || 'No definition available'}`, 12);
            addTextWithOverflow(`Synonyms: ${synonyms.length > 0 ? synonyms.join(', ') : 'None'}`, 12);
            addTextWithOverflow(`Antonyms: ${antonyms.length > 0 ? antonyms.join(', ') : 'None'}`, 12);
        });
        doc.save("speech-to-text-summary.pdf");
    };
    
    
    
    return (
        <div className={theme === 'dark' ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-100 text-black min-h-screen'}>
            <Navbar
                theme={theme}
                toggleTheme={toggleTheme}
                generatePDF={generatePDF}
            />

            <div className="p-5 flex flex-col items-center justify-evenly mx-auto bg-transparent ">
                <div className='flex flex-col md:flex-row justify-between gap-5 w-full'>

                    {/* Speech to Text Box */}
                    <div className={`w-full border shadow-md rounded-lg p-6  h-auto md:h-[80vh] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
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
                    <div className={`w-full mt-5 md:mt-0 border shadow-md rounded-lg p-4 h-auto md:h-[80vh] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
                        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-4">Summary</h2>

                        <div className={`p-4 mt-10 border rounded-lg shadow-md overflow-y-auto  h-[calc(100%-7rem)] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
                        >
                            {/* Loading/Error and Summary Section */}
                            <div className="text-center mb-4">
                                {isLoading && <p className="text-cyan-600 font-semibold text-lg">Loading...</p>}
                                {/* {error && <p className="text-red-600 font-semibold text-lg">Error: {error}</p>} */}
                                {summarizeText && (
                                    <div className="text-cyan-700 text-lg mt-4">
                                        {summarizeText}
                                    </div>
                                )}
                            </div>

                            <hr className="border-t-2 my-6" />

                            {/* Important Words Section */}
                            <div className="mt-5">
                                <p className="text-xl font-semibold text-cyan-700 mb-4">
                                    Important Words from Speech and Summary:
                                </p>

                                <p className="text-lg text-gray-700">
                                    {finalWords.length === 0
                                        ? 'Please wait until you have enough speech data.'
                                        : finalWords.map((items, index) => {
                                            const cleanedWord = items.word.replace(/[^a-zA-Z0-9\s]/g, '');
                                            return (
                                                <span
                                                    key={index}
                                                    className="inline-block cursor-pointer bg-blue-200 text-blue-700 px-3 py-1 rounded-lg m-1 text-sm font-medium hover:bg-blue-300 transition-all duration-300"
                                                    onClick={() => {
                                                        setSearchTerm(cleanedWord.toLowerCase());
                                                        const scrollPosition = document.getElementById('detailCards')?.offsetTop;
                                                        window.scrollTo({
                                                            top: scrollPosition,
                                                            behavior: 'smooth'
                                                        });
                                                    }}
                                                    title='Click on me to know my details'
                                                >
                                                    {cleanedWord}
                                                </span>

                                            );
                                        })}
                                </p>
                            </div>
                        </div>

                        <p className='text-left mt-5'>
                            Total important words gathered - {finalWords.length}
                            {console.log(finalWords)}
                        </p>
                    </div>
                </div>

                {/* Cards Layout with Search Bar */}
                <div className='p-4 mt-8 flex flex-col items-center justify-center'>
                    <div className="flex mb-4 w-[300px] md:w-[500px] ">
                        <input
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Search for a word...'
                            className={`border rounded-l-md p-2 flex-1 w-1/4 justify-center items-center outline-none ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                        />
                        <button className='bg-cyan-600 text-white rounded-r-md px-4 hover:bg-cyan-500 transition-colors duration-300'>
                            <FaSearch className="text-white" />
                        </button>
                    </div>

                    <div className='flex flex-wrap justify-evenly gap-4 mt-10' id='detailCards'>
                        {filteredWords.map(({ word, definition, synonyms, antonyms }, index) => (
                            <WordDetailCard
                                key={index}
                                word={word}
                                definition={definition}
                                synonyms={synonyms}
                                antonyms={antonyms}
                                theme={theme}
                            />
                        ))}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default SpeechToText;