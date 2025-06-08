import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Modal from '../components/Modal';

const categories = [
    'General Knowledge',
    'Science',
    'History',
    'Geography',
    'Entertainment',
    'Sports',
    'Art',
    'Literature',
    'Technology',
    'Food',
    'Music',
    'Movies',
    'Politics',
    'Nature',
    'Mythology',
];

const difficulties = ["easy", "medium", "hard"];

export default function Home() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDifficulties, setSelectedDifficulties] = useState([]);

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleDifficulty = (difficulty) => {
        setSelectedDifficulties(prev =>
            prev.includes(difficulty)
                ? prev.filter(d => d !== difficulty)
                : [...prev, difficulty]
        );
    };

    const canStart = selectedCategories.length > 0 && selectedDifficulties.length > 0;

    const startGame = () => {
        if (!canStart) return;
        const map = {
            "easy": [0, 1],
            "medium": [2, 3],
            'hard': [4, 5]
        };
        const ndiff = selectedDifficulties.flatMap(d => map[d.toLowerCase()] || []);
        navigate('/game', { state: { selectedCategories, selectedDifficulties: ndiff } });
    };

    return (
        <div className="setup-container">
            <p onClick={() => setShowModal(true)} className="rules-button"> ❓ </p>
            <img src='/whoswisegoose/logo.png' className='logo' />

            <div>
                <h2 className="group-label">Choose 1 or more categories</h2>
                <div className="button-group">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`toggle-btn ${selectedCategories.includes(category) ? 'selected' : ''}`}
                            onClick={() => toggleCategory(category)}
                            type="button"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="group-label">Choose difficulty</h2>
                <div className="button-group">
                    {difficulties.map(difficulty => (
                        <button
                            key={difficulty}
                            className={`toggle-btn ${selectedDifficulties.includes(difficulty) ? 'selected' : ''}`}
                            onClick={() => toggleDifficulty(difficulty)}
                            type="button"
                        >
                            {difficulty}
                        </button>
                    ))}
                </div>
            </div>

            <button
                className="start-button"
                disabled={!canStart}
                onClick={startGame}
                type="button"
            >
                Start Game
            </button>

            <button onClick={() => navigate('/stats')} className="start-button" >
                View Stats
            </button>

            {showModal && <Modal onClose={() => setShowModal(false)} />}
        </div>
    );
}
