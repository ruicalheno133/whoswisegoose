import './Modal.css';

export default function Modal({ onClose }) {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="game-rules-title">Game Rules</h2>
                <p>Welcome to <span className='game-title'>Who's Wise Goose?</span>. This is your trusty companion app. To start the game pick the categories you want and how hard you want the questions to be.</p>
                <p>Play a SWAP card? Just hit the SKIP button to get a fresh question — no questions asked.</p>
                <p>Play a CLUE card? Tap REMOVE OPTION to take away one wrong option and make things easier.</p>
                <p>When the player answers, click their option to see if they got it right or wrong.</p>
                <p>Now, let’s get started and see who is <span className='game-title'>The Wisest Goose!</span></p>
                <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-xl">Close</button>
            </div>
        </div>
    );
}
