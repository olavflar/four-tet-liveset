import React from 'react';

// Cool Edit Pro component for Four Tet click-to-loop functionality
const CoolEditWindow: React.FC = () => {
    const [isLooping, setIsLooping] = React.useState(false);

    const handleClick = () => {
        setIsLooping(!isLooping);
        // Implement the click-to-loop functionality here
        console.log(isLooping ? 'Looping off' : 'Looping on');
    };

    return (
        <div className="cool-edit-window">
            <h2>Cool Edit Pro</h2>
            <button onClick={handleClick}>{isLooping ? 'Stop Looping' : 'Start Looping'}</button>
        </div>
    );
};

export default CoolEditWindow;