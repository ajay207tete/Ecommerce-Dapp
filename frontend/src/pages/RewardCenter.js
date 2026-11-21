import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CodeRain from '../components/CodeRain';
import { Gift, Trophy, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RewardCenter = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const socialTasks = [
    { id: 'telegram', type: 'telegram', name: 'Follow on Telegram', url:'https://t.me/thrustercommunity'
, reward: 10 },
    { id: 'instagram', type: 'instagram', name: 'Follow on Instagram', url:'https://www.instagram.com/thruster.co.in?igsh=cTF2MG05ZDczNHU='
, reward: 10 },
    { id: 'youtube', type: 'youtube', name: 'Subscribe on YouTube', url:'https://youtube.com/@thruster-yt?si=Hy1cOUrDoCZN37q-', reward: 15 },
  ];

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    fetchRewards();
    fetchTasks();
  }, [user, token, navigate]);

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API}/rewards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRewards(response.data.rewards || []);
      setTotalRewards(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleCompleteTask = async (task) => {
    window.open(task.url, '_blank');

    try {
      await axios.post(
        `${API}/tasks/complete?task_id=${task.type}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Task completed! You earned ${task.reward} tokens!`);
      fetchRewards();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete task');
    }
  };

  const isTaskCompleted = (taskId) => {
    return tasks.some(t => t.task_type === taskId && t.status === 'completed');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CodeRain />
        <div className="text-2xl font-bold uppercase tracking-[0.3em] text-[#fcee0a] animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-12 px-4" data-testid="reward-center-page">
      <CodeRain />

      <div className="container mx-auto">
        <div className="mb-12">
          <p className="font-mono text-sm text-[#00f0ff] mb-2">On-chain rewards</p>
          <h1 className="text-5xl md:text-7xl font-bold uppercase mb-3 text-white">
            Reward <span className="text-[#fcee0a]">Center</span>
          </h1>
          <p className="text-lg text-white/60">Earn tokens and NFTs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#fcee0a] p-8">
            <div className="flex items-center gap-4 mb-4">
              <Trophy className="h-12 w-12 text-[#fcee0a]" />
              <div>
                <div className="text-sm text-white/60 uppercase tracking-wider">Total Rewards</div>
                <div className="text-4xl font-bold text-[#fcee0a] font-mono" data-testid="total-rewards">
                  {totalRewards.toFixed(2)}
                </div>
              </div>
            </div>
            <p className="text-white/60">THRUSTER Tokens earned</p>
          </div>

          <div className="cut bg-[#0d0d0d] border-l-[3px] border-[#00f0ff] p-8">
            <div className="flex items-center gap-4 mb-4">
              <Gift className="h-12 w-12 text-[#00f0ff]" />
              <div>
                <div className="text-sm text-white/60 uppercase tracking-wider">NFTs Earned</div>
                <div className="text-4xl font-bold text-[#00f0ff] font-mono">
                  {rewards.filter(r => r.reward_type === 'nft').length}
                </div>
              </div>
            </div>
            <p className="text-white/60">Exclusive collectibles</p>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl text-white mb-6">Social Tasks</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {socialTasks.map((task) => {
              const completed = isTaskCompleted(task.type);
              return (
                <div
                  key={task.id}
                  className={`cut bg-[#0d0d0d] border-l-[3px] p-6 transition-colors ${
                    completed ? 'border-[#00f0ff]' : 'border-[#fcee0a] hover:bg-[#141414]'
                  }`}
                  data-testid={`social-task-${task.id}`}
                >
                  <h3 className="text-xl text-white mb-2">{task.name}</h3>
                  <p className="text-[#00f0ff] font-mono text-lg mb-4">
                    +{task.reward} tokens
                  </p>

                  {completed ? (
                    <div className="flex items-center gap-2 text-[#00f0ff]">
                      <CheckCircle className="h-5 w-5" />
                      <span className="uppercase tracking-wider">Completed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCompleteTask(task)}
                      className="cp-btn w-full inline-flex items-center justify-center"
                      data-testid={`complete-task-${task.id}`}
                    >
                      Complete Task
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-3xl text-white mb-6">Reward History</h2>
          {rewards.length === 0 ? (
            <div className="bg-[#0d0d0d] border-2 border-dashed border-[#262626] p-12 text-center">
              <Gift className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <p className="text-xl text-white/60">No rewards yet</p>
            </div>
          ) : (
            <div className="space-y-[2px] bg-[#262626]">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-[#0d0d0d] p-4"
                  data-testid={`reward-${reward.id}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-white">{reward.description}</div>
                      <div className="text-sm text-white/40 font-mono">
                        {new Date(reward.earned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-[#fcee0a] font-mono">
                      +{reward.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardCenter;