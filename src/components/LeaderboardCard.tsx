/**
 * LeaderboardCard Component
 * Displays a single leaderboard entry with rank, name, and coins
 * Phase 3E: UI Components
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { LeaderboardEntry } from '../types/coin';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entry, isCurrentUser = false }) => {
  const { rank, student_name, total_coins } = entry;

  // Get medal emoji for top 3
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const medal = getMedalEmoji(rank);

  // Styling for current user
  const cardClasses = isCurrentUser
    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-400'
    : 'bg-white border border-gray-200';

  // Styling for top 3
  const rankClasses = rank <= 3 ? 'text-yellow-600 font-bold' : 'text-gray-600';

  return (
    <Link 
      to={`/profile/${entry.student_id}`}
      className={`${cardClasses} rounded-lg p-4 shadow-sm hover:shadow-lg transition-all block cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Rank and Name */}
        <div className="flex items-center gap-4 flex-1">
          {/* Rank */}
          <div className="flex items-center justify-center w-12 h-12">
            {medal ? (
              <span className="text-3xl">{medal}</span>
            ) : (
              <span className={`text-2xl font-bold ${rankClasses}`}>#{rank}</span>
            )}
          </div>

          {/* Student Name */}
          <div className="flex-1">
            <p className={`font-semibold text-lg ${isCurrentUser ? 'text-indigo-700' : 'text-gray-800'}`}>
              {student_name}
              {isCurrentUser && (
                <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Coins */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg shadow-sm">
          <span className="text-2xl">🪙</span>
          <span className="text-xl font-bold">{total_coins}</span>
        </div>
      </div>
    </Link>
  );
};
