import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startRecognition, setTranscription } from '../../redux/actions/speechActions';
import { useSummary } from 'use-react-summary';
import Spinner from './Spinner';
import Navbar from './Navbar';
import { FaSearch } from 'react-icons/fa';
import { FiEdit, FiCheck } from 'react-icons/fi';
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const STOP_WORDS = [
    "a", "an", "the", "and", "but", "or", "for", "to", "with", "at", "in", "on", "by", "as", "of", "so", "that", "is", "was", "were", "are", "be", "been",
    "having", "if", "then", "because", "although", "while", "until", "when", "i", "my", "me", "your", "you", "very", "do", "it", "which", "who", "whom",
    "this", "these", "those", "how", "why", "where", "here", "there", "can", "could", "should", "would", "shall", "will", "just", "up", "down", "out", "into",
    "over", "under", "again", "further", "more", "most", "some", "any", "each", "every", "few", "all", "one", "two", "three", "four", "five", "nor", "not",
    "only", "own", "same", "such", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "d", "ll", "m", "o", "re", "ve", "y", "ain",
    "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn",
    "aren't", "haven't", "hasn't", "hadn't", "won't", "wouldn't", "can't", "couldn't", "don't", "doesn't", "didn't", "isn't", "wasn't", "weren't", "won't",
    "wouldn't", "doesn't", "didn't", "isn't", "wasn't", "weren't", "ain't", "isn't", "shouldn't", "mustn't", "needn't", "hasn't", "haven't", "i'm", "you're",
    "he's", "she's", "it's", "we're", "they're", "i've", "you've", "we've", "they've", "i'll", "you'll", "he'll", "she'll", "it'll", "we'll", "they'll", "i'd",
    "you'd", "he'd", "she'd", "it'd", "we'd", "they'd", "i've", "you've", "he's", "she's", "it's", "we're", "they're", "her", "their", "them", "has", "had",
    "have", "doing", "how", "if", "each", "before", "after", "while", "up", "down", "back", "here", "there", "into", "out", "any", "again", "further", "so",
    "what", "all", "still", "only", "much", "he", "she", "we", "they", "which", "who", "why", "when", "where", "how", "now", "than", "too", "very", "yes", "no",
    "some", "every", "about", "above", "below", "between", "under", "over", "among", "through", "around", "across", "before", "after", "during", "together",
    "without", "along", "beside", "like", "just", "more", "less", "both", "another", "each", "last", "first", "next", "only", "another", "those", "this",
    "until", "while", "above", "across", "against", "along", "among", "around", "before", "behind", "below", "beyond", "despite", "during", "except", "for",
    "from", "in", "into", "near", "of", "off", "on", "out", "over", "since", "through", "throughout", "to", "under", "until", "up", "upon", "with", "within",
    "without", "yet", "about", "all", "also", "an", "and", "are", "aren’t", "be", "because", "been", "being", "before", "being", "both", "but", "by", "can",
    "cannot", "could", "couldn’t", "did", "didn't", "does", "doesn't", "don't", "doing", "don't", "doesn't", "don't", "during", "each", "few", "fewer", "for",
    "from", "had", "hadn't", "has", "hasn't", "have", "haven’t", "having", "how", "how’s", "if", "i'm", "i’ve", "into", "is", "isn't", "isn’t", "it", "it’s",
    "it's", "its", "itself", "let", "let's", "may", "more", "must", "mustn't", "my", "myself", "myself", "neither", "nor", "not", "of", "off", "on", "once",
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "outside", "over", "own", "same", "she", "she’s", "should", "shouldn’t", "so", "some",
    "such", "than", "that", "that's", "the", "theirs", "them", "themselves", "then", "there", "there’s", "therefore", "they", "they're", "they've", "this",
    "those", "through", "to", "too", "under", "until", "up", "upon", "very", "we", "we’re", "we’ve", "what", "what’s", "whatever", "when", "when’s", "where",
    "where’s", "wherever", "whether", "which", "which’s", "while", "while’s", "who", "who’s", "whoever", "whom", "whom’s", "whose", "why", "why’s", "whynot",
    "you", "you’re", "you’ve", "you’ll", "you’d", "your", "yours", "yourself", "yourselves", "your", "yourselves"
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
                    </p> : ""
                }
                {antonyms.length ?
                    <p className="mt-2">
                        <strong className='text-cyan-600'>Antonyms:</strong> {antonyms?.length > 0 ? antonyms.join(', ') : 'None'}
                    </p> : ""
                }
            </div>
        </div>
    );
};


const SpeechToText = () => {
    const dispatch = useDispatch();
    const { totalFetchedDetails } = useSelector(state => state.speech);
    const recognitionRef = useRef(null);
    const [finalWords, setFinalWords] = useState([]);
    const [speechIsOn, setSpeechIsOn] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [theme, setTheme] = useState('light');
    const [storydata, setStorydata] = useState();
    const [ImpLENGHT, setImpLENGTH] = useState();
    const [mobileData, setMobileData] = useState([])
    const [ismobileFlag, setIsMobileFlag] = useState(false);
    const [recog, setRecog] = useState(false)
    const [summing, setSumming] = useState(false)
    const [isEditable, setIsEditable] = useState(false);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        setIsMobileFlag(isMobile)
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            let lastRecognizedText = '';

            recognition.onstart = () => {
                dispatch(startRecognition());
            };

            recognition.onresult = (event) => {
                const interimText = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join(' ');


                if (interimText !== lastRecognizedText) {
                    setSpeechIsOn(interimText);
                    lastRecognizedText = interimText;
                }

                if (event.results[event.results.length - 1].isFinal) {
                    const finalText = interimText.trim();
                    if (finalText !== lastRecognizedText) {
                        setSpeechIsOn(finalText);
                        lastRecognizedText = finalText;
                    }
                }
            };

            if (isMobile) {
                recognition.onresult = (event) => {
                    const interimText = Array.from(event.results)
                        .map(result => result[0].transcript)
                        .join(' ');

                    const words = interimText.trim().split(/\s+/);
                    const uniqueWords = [...new Set(words)];

                    setMobileData((prevData) => {
                        const updatedMobileData = [...prevData];

                        uniqueWords.forEach((word) => {
                            if (!updatedMobileData.includes(word)) {
                                updatedMobileData.push(word);
                            }
                        });

                        return updatedMobileData;
                    });

                    if (interimText !== lastRecognizedText) {
                        setSpeechIsOn(interimText);
                        lastRecognizedText = interimText;
                    }

                    if (event.results[event.results.length - 1].isFinal) {
                        const finalText = interimText.trim();
                        if (finalText !== lastRecognizedText) {
                            setSpeechIsOn(finalText);
                            lastRecognizedText = finalText;
                        }
                    }
                };
            }


            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
            recognitionRef.current = recognition;
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    }, [dispatch]);

    const stopRecognitionHandler = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setRecog(!recog)
        }
    };

    const handleSummary = () => {
        const wordsArray = speechIsOn.split(' ').filter(word => !STOP_WORDS.includes(word.toLowerCase()));
        const uniqueWords = Array.from(new Set(wordsArray));
        const len = uniqueWords.length
        setImpLENGTH(len);
        setTimeout(() => {
            dispatch(setTranscription(uniqueWords));
        }, 300);
        setStorydata(speechIsOn)
        setSumming(!summing)
    }

    const startRecognitionHandler = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setRecog(!recog)
        }
    };

    const text = ismobileFlag ? mobileData : storydata;


    const { summarizeText, isLoading, error } = useSummary({ text, words: 200 });

    useEffect(() => {
        const wordformsummary = summarizeText.props.children.split(" ").filter(word => word.trim().length > 0);
        const FilterWords = wordformsummary.filter((word) => {
            return !STOP_WORDS.includes(word.toLowerCase());
        });

        if (ImpLENGHT - 2 === totalFetchedDetails.length) {
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
        ismobileFlag ? addTextWithOverflow(mobileData.toString().split(",").join(" ") || 'No speech detected', 12) : addTextWithOverflow(storydata || 'No speech detected', 12);

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

    const toggleEdit = () => {
        setIsEditable(!isEditable);
    };


    useEffect(() => {

        if (summing && speechIsOn.length > 0) {
            toast.success("Summarizing, Hold Tight!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            setSumming(!summing)
        }

        if (summing && speechIsOn.length <= 0) {
            toast.error("Oop's no data to summarize ", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            setSumming(!summing)
        }

    }, [recog, summing]);

    useEffect(() => {
        if (isEditable) {
            toast.success("Edit mode is now enabled!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                icon: <FiCheck size={20} />,
            });
        }
    }, [isEditable]);

    return (
        <div className={theme === 'dark' ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-100 text-black min-h-screen'}>
            <Navbar
                theme={theme}
                toggleTheme={toggleTheme}
                generatePDF={generatePDF}
            />
            <ToastContainer />
            <div className="p-5 flex flex-col items-center justify-evenly mx-auto bg-transparent ">
                <div className='flex flex-col md:flex-row justify-between gap-5 w-full'>

                    {/* Speech to Text Box */}
                    <div
                        className={`w-full border shadow-md rounded-lg p-6 h-auto md:h-[80vh] ${theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white border-gray-300"
                            }`}
                    >
                        <h1 className="text-2xl font-bold text-center text-cyan-700 mb-4">Speech to Text</h1>

                        <div className="relative mb-4">
                            <button
                                onClick={toggleEdit}
                                className="absolute top-[-40px] right-0 p-2 text-gray-500 hover:text-gray-700"
                            >
                                {isEditable ? <FiCheck size={24} /> : <FiEdit size={24} />}
                            </button>

                            <textarea
                                value={ismobileFlag ? mobileData.toString().split(",").join(" ") : speechIsOn}
                                className={`p-2 pl-8 flex justify-start outline-none border w-full rounded-lg bg-gray-50 shadow-inner overflow-y-auto md:h-[calc(100%-7rem)] ${theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white border-gray-300"
                                    }`}
                                placeholder="No speech detected yet"
                                readOnly={!isEditable}
                                onChange={(e) => setSpeechIsOn(e.target.value)}
                                style={{
                                    minHeight: '300px',
                                    resize: 'vertical',
                                    paddingTop: '25px',
                                }}
                            />

                            <style jsx>{`
                textarea::-webkit-scrollbar {
                    width: 8px; /* Set the width of the scrollbar */
                }

                textarea::-webkit-scrollbar-thumb {
                    background-color: lightgray; /* Light gray color for the scrollbar thumb */
                    border-radius: 10px; /* Rounded corners for the thumb */
                }

                textarea::-webkit-scrollbar-track {
                    background-color: transparent; /* Make the track background transparent */
                }
            `}</style>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-left">
                                Total words in speech -{" "}
                                {ismobileFlag ? mobileData.length : speechIsOn.split(" ").length - 1}
                            </span>
                            {recog ? (
                                <>
                                    <Spinner />
                                    <button
                                        onClick={stopRecognitionHandler}
                                        disabled={!recog}
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
                    <div className={`summaryBox w-full mt-5 md:mt-0 border shadow-md rounded-lg p-4 h-auto md:h-[80vh] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
                        <h2 className="text-2xl font-bold text-center text-cyan-700 mb-4">Summary</h2>

                        <div className={`p-4 mt-10 border rounded-lg shadow-md overflow-y-auto  h-[calc(100%-9rem)] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
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

                        <div className="flex flex-col md:flex-row justify-between mt-5">


                            <p className='text-left mt-5'>
                                Total important words gathered - {finalWords.length}
                            </p>
                            <button
                                onClick={handleSummary}
                                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                            >
                                Summarize

                            </button>
                        </div>

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