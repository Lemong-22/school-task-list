/**
 * LeaderboardPage Component
 * Full-page leaderboard view showing all students ranked by coins
 * Phase 3G: Leaderboard Page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeaderboard, useStudentRank } from '../hooks/useLeaderboard';
import { useAuth } from '../contexts/AuthContext';
import { LeaderboardCard } from '../components/LeaderboardCard';

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard(50);
  const { rank: currentUserRank, loading: rankLoading } = useStudentRank(user?.id || null);
  
  const loading = leaderboardLoading || rankLoading;
  const error = leaderboardError;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Leaderboard</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-2xl">←</span>
              <span className="font-medium">Back</span>
            </button>
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                🏆 Leaderboard
              </h1>
              <p className="text-gray-600 mt-1">Top students by coins earned</p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Current User Rank Card (if not in top visible) */}
        {currentUserRank && currentUserRank.rank > 10 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>📍</span>
              <span>Your Rank</span>
            </h2>
            <LeaderboardCard entry={currentUserRank} isCurrentUser={true} />
          </div>
        )}

        {/* Top Rankings */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>👑</span>
            <span>Top Students</span>
          </h2>
        </div>

        {/* Leaderboard List */}
        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Rankings Yet</h3>
            <p className="text-gray-600">
              Complete tasks to earn coins and appear on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <LeaderboardCard
                key={entry.student_id}
                entry={entry}
                isCurrentUser={user?.id === entry.student_id}
              />
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How to Earn Coins</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Complete assigned tasks to earn coins</li>
                <li>• Each task has a coin reward set by your teacher</li>
                <li>• Climb the leaderboard by completing more tasks</li>
                <li>• Check your dashboard for available tasks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
