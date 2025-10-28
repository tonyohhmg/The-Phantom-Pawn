import { GoogleGenAI } from "@google/genai";
import { Board, PlayerColor } from '../types';
import { boardToFEN } from './chessService';

export const getBestMove = async (board: Board, currentPlayer: PlayerColor): Promise<string> => {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error("API_KEY for Gemini is not set. Hint feature will be disabled.");
        throw new Error("Gemini API key not configured. Hint feature disabled.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const fen = boardToFEN(board, currentPlayer);
    const prompt = `FEN: "${fen}". Player: ${currentPlayer}. What is the best move in coordinate notation?`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are a chess engine API. Your only job is to return the best chess move in coordinate notation. Your response must be ONLY the move, like "e7e5" or "g1f3". Do not include any other words, symbols, or explanations. Just the move string.`,
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        const responseText = response.text.trim();
        const moveMatch = responseText.match(/[a-h][1-8][a-h][1-8][qrbn]?/);

        if (moveMatch && moveMatch[0]) {
            return moveMatch[0];
        }
        
        // Throw an error if the response doesn't contain a valid move format.
        throw new Error(`AI response did not contain a valid move: "${responseText}"`);
    } catch (error) {
        console.error("Error in getBestMove from Gemini:", error);
        // Re-throw the error to be handled by the UI component.
        throw error;
    }
};