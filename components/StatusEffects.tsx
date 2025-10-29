import React from 'react';
import { GameState } from '../types';

interface StatusEffectsProps {
    status: GameState['status'];
}

const PARTICLE_COUNT = 30;

const StatusEffects: React.FC<StatusEffectsProps> = ({ status }) => {
    const isCheck = status === 'check';
    const isCheckmate = status === 'checkmate';

    if (!isCheck && !isCheckmate) {
        return null;
    }

    const color = isCheckmate ? '#a855f7' : '#f97316'; // Purple for checkmate, orange for check

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
                const style = {
                    '--x-start': `${Math.random() * 100}vw`,
                    '--duration': `${Math.random() * 5 + 5}s`,
                    '--delay': `${Math.random() * 5}s`,
                    '--size': `${Math.floor(Math.random() * 5 + 3)}px`,
                    '--start-opacity': `${Math.random() * 0.5 + 0.2}`,
                    '--color': color,
                } as React.CSSProperties;

                return <div key={i} className="status-particle" style={style}></div>;
            })}
        </div>
    );
};

export default StatusEffects;
