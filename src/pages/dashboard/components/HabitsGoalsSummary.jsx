import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/ui/Icon';
import Button from '../../../components/ui/Button';

const HabitsGoalsSummary = ({ habits, goals, habitLogs }) => {
  // Calculate today's habit completions
  const today = new Date().toISOString().split('T')[0];
  const todayCompletedHabits = habitLogs?.filter(log => log?.date === today)?.length || 0;
  const totalHabits = habits?.length || 0;
  const habitCompletionRate = totalHabits > 0 ? Math.round((todayCompletedHabits / totalHabits) * 100) : 0;

  // Calculate goal progress
  const completedGoals = goals?.filter(g => (g?.progress || 0) >= 100)?.length || 0;
  const inProgressGoals = goals?.filter(g => (g?.progress || 0) > 0 && (g?.progress || 0) < 100)?.length || 0;
  const totalGoals = goals?.length || 0;

  // Get upcoming goal deadlines (next 7 days)
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingGoals = goals?.filter(g => {
    if (!g?.targetDate && !g?.deadline) return false;
    const deadline = new Date(g?.targetDate || g?.deadline);
    return deadline >= now && deadline <= sevenDaysFromNow && (g?.progress || 0) < 100;
  })?.length || 0;

  // Get recent habit performance (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayLogs = habitLogs?.filter(log => log?.date === dateStr)?.length || 0;
    last7Days.push({
      date: dateStr,
      completed: dayLogs,
      total: totalHabits,
      percentage: totalHabits > 0 ? (dayLogs / totalHabits) * 100 : 0
    });
  }

  return (
    <div className="space-y-6">
      {/* Habits Summary Card */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Today's Habits</h3>
              <p className="text-sm text-muted-foreground">
                {todayCompletedHabits} of {totalHabits} completed ({habitCompletionRate}%)
              </p>
            </div>
          </div>
          <Link to="/habits-goals">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {/* Today's Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Today's Progress</span>
            <span className="font-medium text-foreground">{habitCompletionRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${habitCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Weekly Habit Heatmap */}
        {totalHabits > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">7-Day Streak</h4>
            <div className="flex space-x-1">
              {last7Days.map((day, index) => (
                <div key={day.date} className="flex-1">
                  <div
                    className={`h-8 rounded text-xs flex items-center justify-center font-medium transition-colors ${
                      day.percentage >= 100
                        ? 'bg-green-500 text-white'
                        : day.percentage >= 75
                        ? 'bg-green-400 text-white'
                        : day.percentage >= 50
                        ? 'bg-yellow-400 text-white'
                        : day.percentage > 0
                        ? 'bg-orange-400 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {day.completed}
                  </div>
                  <div className="text-xs text-center mt-1 text-muted-foreground">
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalHabits === 0 && (
          <div className="text-center py-4">
            <Icon name="Target" size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No habits yet</p>
            <Link to="/habits-goals">
              <Button size="sm">Create Your First Habit</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Goals Summary Card */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="Trophy" size={20} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Goals Overview</h3>
              <p className="text-sm text-muted-foreground">
                {completedGoals} completed • {inProgressGoals} in progress
              </p>
            </div>
          </div>
          <Link to="/habits-goals">
            <Button variant="outline" size="sm">
              Manage Goals
            </Button>
          </Link>
        </div>

        {/* Goals Stats Grid */}
        {totalGoals > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{completedGoals}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{inProgressGoals}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{upcomingGoals}</div>
              <div className="text-xs text-muted-foreground">Due Soon</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Icon name="Trophy" size={24} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No goals set yet</p>
            <Link to="/habits-goals">
              <Button size="sm">Set Your First Goal</Button>
            </Link>
          </div>
        )}

        {/* Upcoming Deadlines Alert */}
        {upcomingGoals > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                {upcomingGoals} goal{upcomingGoals > 1 ? 's' : ''} due this week
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitsGoalsSummary;