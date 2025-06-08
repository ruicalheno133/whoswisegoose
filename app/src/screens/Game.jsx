import React, { useEffect, useState } from 'react';
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
        </div>
    );
}
