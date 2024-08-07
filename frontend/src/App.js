import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ResultDisplay from './components/ResultDisplay';
import AdvancedSearchPanel from './components/AdvancedSearchPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip'
import Container from 'react-bootstrap/esm/Container';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    const [results, setResults] = useState([]);
    const [activeButton, setActiveButton] = useState('rag_with_link');
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    const [temperature, setTemperature] = useState(0.7);  // Default temperature
    const [searchMode, setSearchMode] = useState('relevance');  // Default search mode
    const [numSourceDocs, setNumSourceDocs] = useState(3);  // Default number of source documents

    useEffect(() => {
        localStorage.removeItem('chatHistory');
    }, []);

    useEffect(() => {
        localStorage.setItem('chatHistory', JSON.stringify(results));
    }, [results]);

    const handleSearch = (query, mode) => {
        console.log('Search query:', query);
        console.log('Query mode:', mode);

        const newResult = { query, response: '', mode, source_documents: [] };
        setResults(prevResults => [...prevResults, newResult]);

        fetchStreamData('/stream', { query, mode, temperature, search_mode: searchMode, num_source_docs: numSourceDocs })
    };

    const fetchStreamData = async (url, data) => {

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            console.log("Error in response");
            return;
        }

        let streamedMessage = '';
        const reader = res.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            let rawResult = new TextDecoder("utf-8").decode(value);
            let results = rawResult.split('$EOL');

            let newMessages = results.filter(message => message.startsWith('Result: '))
            newMessages = newMessages.map(message => message.replace('Result: ', ''))
            streamedMessage += newMessages.join('')
            const newResult = { query: data.query, response: streamedMessage, mode: data.mode, source_documents: [] };
            setResults(prevResults => [...prevResults.slice(0, prevResults.length - 1), newResult]);

            let rawSource = results.filter(message => message.startsWith('Source: '))
            if(rawSource.length > 0){
                let rawSourceData = rawSource[0].replace('Source: ', '').replace('$EOL', '');
                let source_documents = [];
                if(rawSourceData!=='None') {
                    try {
                        source_documents = JSON.parse(rawSourceData);
                    } catch (error) {
                        console.error("Failed to parse JSON:", error);
                        source_documents = []; // or any default value you prefer
                    }    
                }
                const newResult = { query: data.query, response: streamedMessage, mode: data.mode, source_documents };
                setResults(prevResults => [...prevResults.slice(0, prevResults.length - 1), newResult]);
            }
        }
    }

    const handleButtonClick = (mode) => {
        setActiveButton(mode);
        handleNewChat();  // Clear results and local storage
    };

    const handleNewChat = () => {
        setResults([]);
        setIsAdvancedSearchOpen(false);  // Close advanced search if open
        localStorage.removeItem('chatHistory');  // Clear local storage
    
        // Send a signal to the backend
        fetch('/new_chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (response.ok) {
                console.log('New chat started successfully');
            } else {
                console.log('Failed to start a new chat');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    };
    
    


    const toggleAdvancedSearch = () => {
        setIsAdvancedSearchOpen(!isAdvancedSearchOpen);
    };

    const handleTemperatureChange = (value) => {
        setTemperature(value);
    };

    const handleSearchModeChange = (value) => {
        setSearchMode(value);
    };
    
    const handleNumSourceDocsChange = (value) => {
        setNumSourceDocs(value);
    };
    return (
        <div className="App">
            <Header handleButtonClickCallback={handleButtonClick}/>
            <Container>
            <ResultDisplay results={results} />
            <div className="search-bar-container">
                <button className="secondary-button" onClick={handleNewChat}>
                    <Tooltip id="my-tooltip-newchat" />
                    <a data-tooltip-id="my-tooltip-newchat" data-tooltip-content="New Chat">
                    <FontAwesomeIcon icon={faPlus}/>
                    </a>
                </button>
                <SearchBar onSearch={(query) => handleSearch(query, activeButton)} />
                {activeButton === 'rag_with_link' && (
                    <button className="secondary-button" onClick={toggleAdvancedSearch}>
                    <Tooltip id="my-tooltip-advanced" />
                    <a data-tooltip-id="my-tooltip-advanced" data-tooltip-content="Advanced Search Options">
                    <FontAwesomeIcon icon={faGear}/>
                    </a>
                    </button>
                )}

            </div>
            {isAdvancedSearchOpen && activeButton === 'rag_with_link' &&(
                <AdvancedSearchPanel
                    temperature={temperature}
                    onTemperatureChange={handleTemperatureChange}
                    searchMode={searchMode}
                    onSearchModeChange={handleSearchModeChange}
                    numSourceDocs={numSourceDocs}
                    onNumSourceDocsChange={handleNumSourceDocsChange}
                />
            )}
            </Container>
        </div>
    );
}

export default App;