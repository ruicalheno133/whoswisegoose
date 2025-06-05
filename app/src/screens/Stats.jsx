import React from 'react';
import { useNavigate } from 'react-router-dom';
import questionsData from '../data/wwg_questions.json';
import './Stats.css';

function getStoredQIDs() {
    return JSON.parse(localStorage.getItem('usedQIDs') || '[]');
}

export default function Stats() {
    const navigate = useNavigate();
    const usedQIDs = getStoredQIDs();

    const totalQuestions = questionsData.length;
    const usedQuestions = usedQIDs.length;
    const usedPercentage = ((usedQuestions / totalQuestions) * 100).toFixed(1);

    // Aggregate stats per category
    const categoryStats = questionsData.reduce((acc, q) => {
        if (!acc[q.category]) acc[q.category] = { total: 0, used: 0 };
        acc[q.category].total += 1;
        if (usedQIDs.includes(q.qid)) acc[q.category].used += 1;
        return acc;
    }, {});

    return (
        <div className="stats-screen">
            <h1 className="font-luckiest text-3xl mb-4">Game Stats</h1>

            <div className="overall-stats mb-6">
                <p className="used-percentage">
                    Total Questions Seen: <strong>{usedQuestions}</strong> / <strong>{totalQuestions}</strong>
                </p>
            </div>

            <div className="category-stats">
                {Object.entries(categoryStats).map(([category, { total, used }]) => {
                    const categoryPercentage = ((used / total) * 100).toFixed(1);
                    return (
                        <div key={category} className="category-box">
                            <h2 className="category-title">{category}</h2>
                            <h2 className="used-percentage">{used} / {total} ({categoryPercentage}%)</h2>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => navigate('/')}
                className="mt-6 back-btn"
            >
                Back to Setup
            </button>
        </div>
    );
}
