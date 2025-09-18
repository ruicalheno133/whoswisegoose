import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import questionsData from '../data/wwg_questions.json';
import './Game.css';

function getStoredQIDs() {
    return JSON.parse(localStorage.getItem('usedQIDs') || '[]');
}
function storeQID(qid) {
    const current = getStoredQIDs();
    const updated = [...new Set([...current, qid])];
    localStorage.setItem('usedQIDs', JSON.stringify(updated));
}
function resetStoredQIDs() {
    localStorage.setItem('usedQIDs', JSON.stringify([]));
}

export default function Game() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [currentQ, setCurrentQ] = useState(null);
    const [options, setOptions] = useState([]);
    const [disabledOptions, setDisabledOptions] = useState([]); // now stores indexes
    const [showModal, setShowModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answerState, setAnswerState] = useState(null);

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isInitialDelay, setIsInitialDelay] = useState(true);
    const [initialDelayTime, setInitialDelayTime] = useState(10);
    const [showTimer, setShowTimer] = useState(true);
    const timerRef = useRef(null);
    const initialDelayRef = useRef(null);
    const initialCountdownRef = useRef(null);

    // Timer functions
    const playTimerSound = () => {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    };

    const startTimer = () => {
        // Clear any existing timers
        if (timerRef.current) clearInterval(timerRef.current);
        if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
        if (initialCountdownRef.current) clearInterval(initialCountdownRef.current);

        setIsInitialDelay(true);
        setIsTimerActive(false);
        setTimeRemaining(0);
        setInitialDelayTime(10);

        // Start initial delay countdown
        initialCountdownRef.current = setInterval(() => {
            setInitialDelayTime(prev => {
                if (prev <= 1) {
                    clearInterval(initialCountdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Start 10-second initial delay
        initialDelayRef.current = setTimeout(() => {
            setIsInitialDelay(false);

            // Generate random timer duration between 10-25 seconds
            const randomDuration = Math.floor(Math.random() * 16) + 10; // 10-25 seconds
            setTimeRemaining(randomDuration);
            setIsTimerActive(true);

            // Start countdown timer
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        setIsTimerActive(false);
                        playTimerSound();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, 10000); // 10 second initial delay
    };

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
        if (initialCountdownRef.current) clearInterval(initialCountdownRef.current);
        startTimer();
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
        if (initialCountdownRef.current) clearInterval(initialCountdownRef.current);
        setIsTimerActive(false);
        setIsInitialDelay(false);
    };

    const nextQuestion = () => {
        let filtered = questionsData.filter(
            q =>
                state.selectedCategories.includes(q.category) &&
                state.selectedDifficulties.includes(q.difficulty) &&
                !getStoredQIDs().includes(q.qid)
        );

        if (filtered.length === 0) {
            resetStoredQIDs();
            filtered = questionsData.filter(
                q =>
                    state.selectedCategories.includes(q.category) &&
                    state.selectedDifficulties.includes(q.difficulty)
            );
        }

        const q = filtered[Math.floor(Math.random() * filtered.length)];
        storeQID(q.qid);
        setCurrentQ(q);
        setOptions([...q.options]);
        setDisabledOptions([]);
        setSelectedOption(null);
        setAnswerState(null);

        // Reset timer for new question
        resetTimer();
    };

    const removeWrongOption = () => {
        if (!currentQ || selectedOption !== null) return;

        // Find wrong options that are still enabled
        const wrongOptionIndexes = options
            .map((_, idx) => idx)
            .filter(idx => idx !== currentQ.answer && !disabledOptions.includes(idx));

        // Only remove if more than 2 options remain enabled
        const enabledOptionsCount = options.length - disabledOptions.length;
        if (enabledOptionsCount <= 2) return;  // allow remove only if more than 2 options enabled

        if (wrongOptionIndexes.length === 0) return;

        const toDisable = wrongOptionIndexes[Math.floor(Math.random() * wrongOptionIndexes.length)];
        setDisabledOptions(prev => [...prev, toDisable]);
    };


    const onSelectOption = (idx) => {
        if (selectedOption !== null) return;

        setSelectedOption(idx);

        // Stop timer when answer is selected
        stopTimer();

        if (idx === currentQ.answer) {
            setAnswerState('correct');
        } else {
            setAnswerState('wrong');
        }
    };

    useEffect(() => {
        nextQuestion();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (initialDelayRef.current) clearTimeout(initialDelayRef.current);
            if (initialCountdownRef.current) clearInterval(initialCountdownRef.current);
        };
    }, []);

    if (!currentQ) return null;

    return (
        <div className="game-container">
            <img src='/whoswisegoose/logo.png' alt="logo" className='logo' />

            <div className="game-header">
                <p className="game-title">{currentQ.category} {'🥚'.repeat(Math.floor(currentQ.difficulty / 2) + 1)}</p>
            </div>

            <p className="question-text">{currentQ.question}</p>

            <div className="options-grid">
                {options.map((opt, idx) => {
                    let classes = 'option-button';

                    if (selectedOption !== null) {
                        if (idx === selectedOption) {
                            classes += idx === currentQ.answer ? ' option-correct' : ' option-wrong';
                        } else if (idx === currentQ.answer) {
                            classes += ' option-correct-unselected';
                        } else {
                            classes += ' option-disabled';
                        }
                    } else {
                        if (disabledOptions.includes(idx)) {
                            classes += ' option-disabled';
                        }
                    }

                    return (
                        <button
                            key={idx}
                            disabled={selectedOption !== null || disabledOptions.includes(idx)}
                            className={classes}
                            onClick={() => onSelectOption(idx)}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            <div className="buttons-container">
                <button
                    onClick={nextQuestion}
                    className="action-button btn-skip"
                >
                    Skip
                </button>
                <button
                    onClick={removeWrongOption}
                    disabled={selectedOption !== null}
                    className="action-button btn-remove"
                >
                    Remove One
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="action-button btn-leave"
                >
                    Leave
                </button>
            </div>

            {/* Timer Toggle and Display */}
            <div className="timer-section">
                <button
                    onClick={() => setShowTimer(!showTimer)}
                    className="timer-toggle"
                    title={showTimer ? "Hide timer" : "Show timer"}
                >
                    {showTimer ? "Hide timer ⏱️" : "Show timer ⏱️"}
                </button>

                {showTimer && (
                    <div className="timer-container">
                        {isInitialDelay ? (
                            <div className="timer-text timer-initial">
                                Reading time: {initialDelayTime}s
                            </div>
                        ) : isTimerActive ? (
                            <div className="timer-text timer-active">
                                ⏰ {timeRemaining}s
                            </div>
                        ) : (
                            <div className="timer-text timer-inactive">
                                Time's up! 🔔
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
