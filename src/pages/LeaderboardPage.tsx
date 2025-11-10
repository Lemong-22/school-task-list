/**
 * LeaderboardPage Component
 * Full-page leaderboard view showing all students ranked by coins
 * Phase 3G: Leaderboard Page
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { getNamecardStyle } from '../config/namecardStyles';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const { leaderboard, loading, error } = useLeaderboard(50);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter leaderboard based on search
  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <main className="flex-1 flex flex-col gap-4 mt-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 px-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Leaderboard
            </h1>
            <p className="text-slate-400 text-base font-normal leading-normal">
              See who's on top this week.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-3">
          {/* Filter Buttons */}
          <div className="flex w-full sm:w-auto">
            <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#223149] p-1">
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg h-8 px-4 bg-primary text-white text-sm font-medium">
                <span className="truncate">This Week</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg h-8 px-4 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                <span className="truncate">This Month</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg h-8 px-4 text-slate-400 hover:text-white text-sm font-medium transition-colors">
                <span className="truncate">All Time</span>
              </label>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#223149] text-white placeholder:text-[#90a7cb] border border-transparent focus:border-primary focus:ring-0 text-sm focus:outline-none"
              placeholder="Find user..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="px-4 py-3">
          <div className="flex overflow-hidden rounded-xl border border-[#314668] bg-[#182334]/50">
            {loading ? (
              <div className="w-full flex items-center justify-center py-12">
                <div className="text-center">
                  <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-slate-400">Loading leaderboard...</p>
                </div>
              </div>
            ) : error ? (
              <div className="w-full p-6">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-red-400">Error: {error}</p>
                </div>
              </div>
            ) : filteredLeaderboard.length === 0 ? (
              <div className="w-full p-12 text-center">
                <p className="text-slate-400">No users found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-transparent">
                  <tr>
                    <th className="px-6 py-4 text-left text-white/70 w-24 text-sm font-medium leading-normal">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-white/70 text-sm font-medium leading-normal">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-white/70 text-sm font-medium leading-normal">
                      <div className="flex items-center gap-2">
                        <span>Total Coins</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#314668]">
                  {filteredLeaderboard.map((entry) => {
                    const isCurrentUser = user?.id === entry.student_id;
                    const isTop3 = entry.rank <= 3;
                    const namecardStyle = getNamecardStyle(entry.active_namecard_name);
                    
                    return (
                      <tr
                        key={entry.student_id}
                        className={`transition-all ${
                          entry.active_namecard_name
                            ? `${namecardStyle.background} ${namecardStyle.border} ${namecardStyle.effects}`
                            : isCurrentUser 
                              ? 'bg-primary/20 ring-1 ring-inset ring-primary' 
                              : 'hover:bg-white/5'
                        }`}
                      >
                        <td className="h-[72px] px-6 py-2 text-white text-base font-medium">
                          {isTop3 ? (
                            <div className="flex items-center gap-2">
                              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                              </svg>
                              <span>{entry.rank}</span>
                            </div>
                          ) : (
                            <span>{entry.rank}</span>
                          )}
                        </td>
                        <td className="h-[72px] px-6 py-2">
                          <div className="flex items-center gap-3">
                            <Link
                              to={`/profile/${entry.student_id}`}
                              className={`text-lg font-bold hover:opacity-80 transition-all ${
                                entry.active_namecard_name ? namecardStyle.textColor : 'text-white hover:text-primary'
                              }`}
                            >
                              {entry.student_name}
                            </Link>
                            {entry.active_title_name && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-black italic ${
                                entry.namecard_rarity === 'legendary' 
                                  ? 'bg-gradient-to-r from-yellow-600/40 to-orange-600/40 border border-yellow-500/60 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-pulse animate-shimmer' 
                                  : entry.namecard_rarity === 'epic'
                                    ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-500/60 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse animate-shimmer'
                                    : entry.namecard_rarity === 'rare'
                                      ? 'bg-gradient-to-r from-blue-600/40 to-cyan-600/40 border border-blue-500/50 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400'
                                      : 'bg-gray-700/40 border border-gray-600/50 text-gray-300'
                              }`}>
                                「{entry.active_title_name}」
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="h-[72px] px-6 py-2">
                          <div className={`flex items-center gap-2 text-base font-bold leading-normal ${
                            entry.active_namecard_name ? namecardStyle.textColor : 'text-white'
                          }`}>
                            <span className="text-lg">🪙</span>
                            <span>{entry.total_coins.toLocaleString()}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
};
