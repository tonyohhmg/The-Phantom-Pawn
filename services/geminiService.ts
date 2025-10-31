import { GoogleGenAI } from "@google/genai";
import { Board, PlayerColor } from '../types';
import { boardToFEN } from './chessService';

export const getBestMove = async (board: Board, currentPlayer: PlayerColor, legalMoves: string[]): Promise<string> => {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        console.error("API_KEY for Gemini is not set. Using random move.");
        throw new Error("Gemini API key not configured.");
    }

    // If there's only one move, don't bother calling the API.
    if (legalMoves.length === 1) {
        return legalMoves[0];
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const fen = boardToFEN(board, currentPlayer);
    const prompt = `You are a chess engine API. Your only job is to return the best chess move from a provided list, in coordinate notation. Your response must be ONLY the move, like "e7e5" or "g1f3". Do not include any other words, symbols, or explanations. Just the move string.

FEN: "${fen}". Player: ${currentPlayer}. From this list of legal moves: [${legalMoves.join(', ')}], what is the best move?`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        const responseText = response.text.trim();
        const moveMatch = responseText.match(/[a-h][1-8][a-h][1-8][qrbn]?/);

        // First, check if the response is a valid move format and is in the provided legal moves list.
        if (moveMatch && moveMatch[0] && legalMoves.includes(moveMatch[0])) {
            return moveMatch[0];
        }
        
        // If the AI gives an invalid response, log it and fall back to a random legal move.
        // This makes the service resilient and prevents crashes from unexpected AI output.
        console.error(`AI response ("${responseText}") was invalid or not in the legal move list. Falling back to a random move.`);
        return legalMoves[Math.floor(Math.random() * legalMoves.length)];

    } catch (error) {
        console.error("Error in getBestMove from Gemini:", error);
        // Re-throw the error to be handled by the calling hook.
        throw error;
    }
};