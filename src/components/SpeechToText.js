import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startRecognition, setTranscription } from '../redux/actions/speechActions';
import Spinner from './Spinner';
import Navbar from './Navbar';
import { FaSearch } from 'react-icons/fa';
import { FiEdit, FiCheck } from 'react-icons/fi';
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {STOP_WORDS} from './stopwords'; // Moved large array into a separate file

const WordDetailCard = ({ word, definition, synonyms, antonyms, theme }) => (
  <div
    className={`border overflow-y-auto cursor-pointer rounded-lg p-6 mb-4 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 shadow-md hover:shadow-lg transform hover:scale-110 transition-transform duration-300 ease-in-out min-w-[300px] h-auto md:min-h-[200px] flex flex-col ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
    onClick={() => window.open(`https://www.google.com/search?q=${word}`, '_blank')}
    title="Click to search for more information about this word on Google"
  >
    <h2
      className="font-bold text-xl text-cyan-800 underline cursor-pointer"
      onClick={() => window.open(`https://www.google.com/search?q=${word}`, '_blank')}
    >
      {definition ? word : `${word} (bad request)`}
    </h2>
    {definition
      ? <p className="mt-2"><strong className='text-cyan-600'>Definition:</strong> {definition}</p>
      : "Oop's something went wrong!"
    }
    {synonyms.length > 0 && (
      <p className="mt-2"><strong className='text-cyan-600'>Synonyms:</strong> {synonyms.join(', ')}</p>
    )}
    {antonyms.length > 0 && (
      <p className="mt-2"><strong className='text-cyan-600'>Antonyms:</strong> {antonyms.join(', ')}</p>
    )}
  </div>
);

const SpeechToText = () => {
  const dispatch = useDispatch();
  const { totalFetchedDetails } = useSelector(state => state.speech);
  const recognitionRef = useRef(null);

  const [finalWords, setFinalWords] = useState([]);
  const [speechIsOn, setSpeechIsOn] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState('light');
  const [storydata, setStorydata] = useState();
  const [ImpLENGTH, setImpLENGTH] = useState();
  const [mobileData, setMobileData] = useState([]);
  const [ismobileFlag, setIsMobileFlag] = useState(false);
  const [recog, setRecog] = useState(false);
  const [summing, setSumming] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const [summaryText, setSummaryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobileFlag(isMobile);

    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      let lastRecognizedText = '';

      recognition.onstart = () => dispatch(startRecognition());

      recognition.onresult = (event) => {
        const interimText = Array.from(event.results).map(r => r[0].transcript).join(' ');
        if (isMobile) {
          const words = interimText.trim().split(/\s+/);
          const uniqueWords = [...new Set(words)];
          setMobileData(prev => [...new Set([...prev, ...uniqueWords])]);
        }
        if (interimText !== lastRecognizedText) {
          setSpeechIsOn(interimText);
          lastRecognizedText = interimText;
        }
      };

      recognition.onerror = (e) => console.error('Speech recognition error:', e.error);
      recognitionRef.current = recognition;
    }
  }, [dispatch]);

  const startRecognitionHandler = () => {
    recognitionRef.current?.start();
    setRecog(true);
  };

  const stopRecognitionHandler = () => {
    recognitionRef.current?.stop();
    setRecog(false);
  };

  const fetchSummaryFromGemini = async (text) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Summarize the following text:\n\n${text}` }] }]
          })
        }
      );
      const data = await res.json();
      setSummaryText(data?.candidates?.[0]?.content?.parts?.[0]?.text || '');
    } catch (err) {
      console.error('Gemini API Error:', err);
    }
    setIsLoading(false);
  };

 const handleSummary = () => {
  const textToSummarize = ismobileFlag ? mobileData.join(" ") : speechIsOn;
  const filteredWords = textToSummarize
    .split(' ')
    .filter(w => w && !STOP_WORDS.includes(w.toLowerCase()));
  const uniqueWords = [...new Set(filteredWords)];

  setImpLENGTH(uniqueWords.length);
  setStorydata(textToSummarize);
  dispatch(setTranscription(uniqueWords));
  fetchSummaryFromGemini(textToSummarize);
  setSumming(true);
};

useEffect(() => {
  const filteredSummaryWords = summaryText
    .split(" ")
    .filter(w => w.trim() && !STOP_WORDS.includes(w.toLowerCase()));

  if (ImpLENGTH - 2 === totalFetchedDetails.length) {
    setTimeout(() => dispatch(setTranscription(filteredSummaryWords)), 3000);
  }

  const uniqueFinalWords = totalFetchedDetails.filter((item, index, self) =>
    index === self.findIndex(t => t.word === item.word)
  );
  setFinalWords(uniqueFinalWords);

  // Keep storydata in sync with most recent text:
  const latestText = ismobileFlag ? mobileData.join(" ") : speechIsOn;
  setStorydata(latestText);
}, [totalFetchedDetails, summaryText, ImpLENGTH, dispatch, speechIsOn, ismobileFlag, mobileData]);

  const filteredWords = finalWords.filter(({ word }) =>
    word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleEdit = () => setIsEditable(!isEditable);

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;

    const addText = (text, size = 12) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - margin * 2);
      lines.forEach(line => {
        if (y > doc.internal.pageSize.height - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 5;
      });
    };

    doc.setFontSize(18);
    doc.text("Speech to Text Summary", margin, y);
    y += 10;

    addText("Speech Transcription:", 14);
    addText(ismobileFlag ? mobileData.join(" ") : storydata || 'No speech detected');
    y += 5;

    addText("Summary:", 14);
    addText(summaryText || 'No summary available');
    y += 5;

    addText("Important Words:", 14);
    finalWords.length
      ? finalWords.forEach((item, i) => addText(`${i + 1}. ${item.word.replace(/[^a-zA-Z0-9\s]/g, '')}`))
      : addText("No important words available.");
    y += 5;

    addText("Word Details:", 14);
    filteredWords.forEach(({ word, definition, synonyms, antonyms }) => {
      addText(`Word: ${word}`);
      addText(`Definition: ${definition || 'No definition available'}`);
      // addText(`Synonyms: ${synonyms.length ? synonyms.join(', ') : 'None'}`);
      // addText(`Antonyms: ${antonyms.length ? antonyms.join(', ') : 'None'}`);
    });

    doc.save("speech-to-text-summary.pdf");
  };

  useEffect(() => {
    if (summing && speechIsOn.length > 0) {
      toast.success("Summarizing, Hold Tight!", { autoClose: 2000 });
      setSumming(false);
    } else if (summing && speechIsOn.length <= 0) {
      toast.error("Oop's no data to summarize", { autoClose: 2000 });
      setSumming(false);
    }
  }, [summing, speechIsOn]);

  useEffect(() => {
    if (isEditable) {
      toast.success("Edit mode is now enabled!", { autoClose: 2000, icon: <FiCheck size={20} /> });
    }
  }, [isEditable]);

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 text-white min-h-screen' : 'bg-gray-100 text-black min-h-screen'}>
      <Navbar theme={theme} toggleTheme={toggleTheme} generatePDF={generatePDF} />
      <ToastContainer />
      <div className="p-5 flex flex-col items-center justify-evenly mx-auto bg-transparent">
        <div className='flex flex-col md:flex-row justify-between gap-5 w-full'>
          {/* Speech Box */}
          <div className={`w-full border shadow-md rounded-lg p-6 h-auto md:h-[80vh] ${theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white border-gray-300"}`}>
            <h1 className="text-2xl font-bold text-center text-cyan-700 mb-4">Speech to Text</h1>
            <div className="relative mb-4">
              <button onClick={toggleEdit} className="absolute top-[-40px] right-0 p-2 text-gray-500 hover:text-gray-700">
                {isEditable ? <FiCheck size={24} /> : <FiEdit size={24} />}
              </button>
              <textarea
                value={ismobileFlag ? mobileData.join(" ") : speechIsOn}
                className={`p-2 pl-8 outline-none border w-full rounded-lg overflow-y-auto md:h-[calc(100%-7rem)] ${theme === "dark" ? "bg-gray-800 text-white border-gray-600" : "bg-white border-gray-300"}`}
                placeholder="No speech detected yet"
                readOnly={!isEditable}
                onChange={(e) => ismobileFlag ? setMobileData(e.target.value.split(" ")) : setSpeechIsOn(e.target.value)}
                style={{ minHeight: '300px', resize: 'vertical', paddingTop: '25px' }}
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <span>Total words - {ismobileFlag ? mobileData.length : speechIsOn.split(" ").length - 1}</span>
              {recog
                ? <>
                    <Spinner />
                    <button onClick={stopRecognitionHandler} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 ml-2">Stop</button>
                  </>
                : <button onClick={startRecognitionHandler} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Start</button>
              }
            </div>
          </div>

          {/* Summary Box */}
          <div className={`w-full mt-5 md:mt-0 border shadow-md rounded-lg p-4 h-auto md:h-[80vh] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}>
            <h2 className="text-2xl font-bold text-center text-cyan-700 mb-4">Summary</h2>
            <div className={`p-4 mt-10 border rounded-lg shadow-md overflow-y-auto h-[calc(100%-9rem)] ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}>
              {isLoading && <p className="text-cyan-600 font-semibold text-lg">Loading...</p>}
              {summaryText && <div className="text-cyan-700 text-lg mt-4">{summaryText}</div>}
              <hr className="border-t-2 my-6" />
              <p className="text-xl font-semibold text-cyan-700 mb-4">Important Words:</p>
              {finalWords.length
                ? finalWords.map((items, index) => {
                    const cleanedWord = items.word.replace(/[^a-zA-Z0-9\s]/g, '');
                    return (
                      <span
                        key={index}
                        className="inline-block cursor-pointer bg-blue-200 text-blue-700 px-3 py-1 rounded-lg m-1 text-sm font-medium hover:bg-blue-300"
                        onClick={() => {
                          setSearchTerm(cleanedWord.toLowerCase());
                          window.scrollTo({ top: document.getElementById('detailCards')?.offsetTop, behavior: 'smooth' });
                        }}
                      >
                        {cleanedWord}
                      </span>
                    );
                  })
                : 'Please wait until you have enough speech data.'}
            </div>
            <div className="flex flex-col md:flex-row justify-between mt-5">
              <p>Total important words - {finalWords.length}</p>
              <button onClick={handleSummary} className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Summarize</button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className='p-4 mt-8 flex flex-col items-center'>
          <div className="flex mb-4 w-[300px] md:w-[500px]">
            <input
              type='text'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search for a word...'
              className={`border rounded-l-md p-2 flex-1 outline-none ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}
            />
            <button className='bg-cyan-600 text-white rounded-r-md px-4 hover:bg-cyan-500'>
              <FaSearch />
            </button>
          </div>
          <div className='flex flex-wrap justify-evenly gap-4 mt-10' id='detailCards'>
            {filteredWords.map((props, index) => <WordDetailCard key={index} {...props} theme={theme} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
