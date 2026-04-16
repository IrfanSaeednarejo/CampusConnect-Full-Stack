import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedEvent } from "../../../redux/slices/eventSlice";
import api from "../../../api/axios";
import CircularProgress from "../../../common/CircularProgress";

export default function LeaderboardTab() {
  const { id } = useParams();
  const event = useSelector(selectSelectedEvent);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get(`/competitions/${id}/leaderboard`);
        // Ensure strictly sorted descending
        const sorted = (data.data || []).sort((a,b) => b.totalScore - a.totalScore);
        setBoard(sorted);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLeaderboard();
  }, [id]);

  if (loading) return <div className="py-20 flex justify-center"><CircularProgress /></div>;

  if (error) {
    if (error.toLowerCase().includes("not published")) {
      return (
        <div className="p-10 text-center animate-fade-in">
          <span className="material-symbols-outlined text-6xl text-[#30363d] mb-4">lock</span>
          <h2 className="text-xl font-bold text-white mb-2">Scores Hidden</h2>
          <p className="text-[#8b949e]">The event organizers have not published the final leaderboard yet. Check back after judging concludes!</p>
        </div>
      );
    }
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (board.length === 0) {
    return <div className="p-10 text-center text-[#8b949e]">No submissions scored yet.</div>;
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      {/* Podium Top 3 Wrapper */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-4 mb-12 mt-6">
        {/* Silver */}
        {board[1] && (
           <div className="flex flex-col items-center order-2 md:order-1 flex-1 md:flex-none">
              <span className="material-symbols-outlined text-4xl text-[#c0c0c0] mb-2">workspace_premium</span>
              <div className="w-full md:w-32 bg-[#161b22] border-t-4 border-t-[#c0c0c0] p-4 text-center rounded-t-lg shadow-xl h-32 flex flex-col justify-end">
                <span className="font-bold text-white line-clamp-1">{board[1].team?.name || "Participant"}</span>
                <span className="text-xl font-black text-[#c0c0c0]">{board[1].totalScore} pts</span>
              </div>
           </div>
        )}
        
        {/* Gold */}
        {board[0] && (
           <div className="flex flex-col items-center order-1 md:order-2 flex-1 md:flex-none relative z-10 w-full md:w-auto -mr-2 -ml-2 md:m-0">
              <span className="material-symbols-outlined text-6xl text-[#ffd700] mb-2 animate-pulse">workspace_premium</span>
              <div className="w-full md:w-40 bg-[#0d1117] border-t-8 border-t-[#ffd700] p-4 text-center rounded-t-xl shadow-2xl h-40 flex flex-col justify-end">
                <span className="font-bold text-white text-lg line-clamp-1">{board[0].team?.name || "Participant"}</span>
                <span className="text-2xl font-black text-[#ffd700]">{board[0].totalScore} pts</span>
              </div>
           </div>
        )}

        {/* Bronze */}
        {board[2] && (
           <div className="flex flex-col items-center order-3 md:order-3 flex-1 md:flex-none">
              <span className="material-symbols-outlined text-4xl text-[#cd7f32] mb-2">workspace_premium</span>
              <div className="w-full md:w-32 bg-[#161b22] border-t-4 border-t-[#cd7f32] p-4 text-center rounded-t-lg shadow-xl h-24 flex flex-col justify-end">
                <span className="font-bold text-white line-clamp-1">{board[2].team?.name || "Participant"}</span>
                <span className="text-lg font-black text-[#cd7f32]">{board[2].totalScore} pts</span>
              </div>
           </div>
        )}
      </div>

      {/* Roster Table */}
      {board.length > 3 && (
        <div className="mt-8 overflow-hidden rounded-xl border border-[#30363d]">
          <table className="w-full text-left text-sm">
             <thead className="bg-[#161b22] text-[#8b949e]">
               <tr>
                 <th className="p-4 w-16 text-center font-bold">#</th>
                 <th className="p-4 font-bold">Team / Participant</th>
                 <th className="p-4 text-right font-bold">Score</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-[#30363d] bg-[#0d1117]">
               {board.slice(3).map((item, idx) => (
                 <tr key={idx} className="hover:bg-[#21262d] transition-colors">
                   <td className="p-4 text-center text-[#8b949e] font-semibold">{idx + 4}</td>
                   <td className="p-4 text-white font-semibold">{item.team?.name || "Unknown"}</td>
                   <td className="p-4 text-right text-[#1dc964] font-bold">{item.totalScore}</td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
