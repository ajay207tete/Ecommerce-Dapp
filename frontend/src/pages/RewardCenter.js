import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
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
    { id: 'telegram', type: 'telegram', name: 'Follow on Telegram', url: 'https://t.me/thruster', reward: 10 },
    { id: 'instagram', type: 'instagram', name: 'Follow on Instagram', url: 'https://instagram.com/thruster', reward: 10 },
    { id: 'youtube', type: 'youtube', name: 'Subscribe on YouTube', url: 'https://youtube.com/@thruster', reward: 15 },
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
        `${API}/tasks/complete?task_id=${task.id}`,
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
        <div className="text-2xl font-orbitron text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="reward-center-page">
      <div className="container mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold font-orbitron uppercase mb-4 text-white">Reward Center</h1>
          <p className="text-lg text-white/60 font-rajdhani">Earn tokens and NFTs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/50 p-8">
            <div className="flex items-center gap-4 mb-4">
              <Trophy className="h-12 w-12 text-primary" />
              <div>
                <div className="text-sm text-white/60 font-rajdhani">Total Rewards</div>
                <div className="text-4xl font-bold text-primary font-mono" data-testid="total-rewards">
                  {totalRewards.toFixed(2)}
                </div>
              </div>
            </div>
            <p className="text-white/60 font-rajdhani">THRUSTER Tokens earned</p>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/20 to-transparent border-secondary/50 p-8">
            <div className="flex items-center gap-4 mb-4">
              <Gift className="h-12 w-12 text-secondary" />
              <div>
                <div className="text-sm text-white/60 font-rajdhani">NFTs Earned</div>
                <div className="text-4xl font-bold text-secondary font-mono">
                  {rewards.filter(r => r.reward_type === 'nft').length}
                </div>
              </div>
            </div>
            <p className="text-white/60 font-rajdhani">Exclusive collectibles</p>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-orbitron text-white mb-6">Social Tasks</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {socialTasks.map((task) => {
              const completed = isTaskCompleted(task.type);
              return (
                <Card
                  key={task.id}
                  className={`p-6 ${
                    completed
                      ? 'bg-secondary/10 border-secondary/30'
                      : 'bg-[#0F0F1C]/80 border-white/10 hover:border-primary/50'
                  } transition-all duration-300`}
                  data-testid={`social-task-${task.id}`}
                >
                  <h3 className="text-xl font-orbitron text-white mb-2">{task.name}</h3>
                  <p className="text-secondary font-mono text-lg mb-4">
                    +{task.reward} tokens
                  </p>
                  
                  {completed ? (
                    <div className="flex items-center gap-2 text-secondary">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-rajdhani">Completed</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCompleteTask(task)}
                      className="w-full bg-primary hover:bg-primary/90"
                      data-testid={`complete-task-${task.id}`}
                    >
                      Complete Task
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-orbitron text-white mb-6">Reward History</h2>
          {rewards.length === 0 ? (
            <Card className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-12 text-center">
              <Gift className="h-16 w-16 mx-auto mb-4 text-white/20" />
              <p className="text-xl text-white/60 font-rajdhani">No rewards yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <Card
                  key={reward.id}
                  className="bg-[#0F0F1C]/80 backdrop-blur-md border-white/10 p-4"
                  data-testid={`reward-${reward.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-rajdhani">{reward.description}</div>
                      <div className="text-sm text-white/40 font-mono">
                        {new Date(reward.earned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-primary font-mono">
                      +{reward.amount}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardCenter;