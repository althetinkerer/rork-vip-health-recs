import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import {
  Star, TrendingUp, Flame, Trophy, Crown, Users, BookOpen,
  Calendar, CheckCircle, Circle, Target, Gift, RefreshCcw,
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, shadow } from '@/constants/theme';
import Card from '@/components/Card';
import {
  healthRewards,
  dailyChallenges,
  weeklyGoals,
  achievements,
  leaderboard,
  type DailyChallenge,
} from '@/mocks/dashboardData';
import { useData } from '@/context/DataContext';

const achievementIconMap: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Flame, Calendar, BookOpen, Crown, Users, Star,
};

export default function GamificationPanel() {
  const { gamificationProfile, completedChallenges, completeDailyChallenge, refetchAll } = useData();
  const [toggledIds, setToggledIds] = useState<Record<string, boolean>>({});

  const handleDevReset = async () => {
    try {
      const { supabase } = require('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Delete their completions
      await supabase.from('completed_challenges').delete().eq('user_id', user.id);
      
      // Reset points
      await supabase.from('user_profiles').update({ total_points: 0, current_level: 1 }).eq('id', user.id);
      
      setToggledIds({});
      refetchAll();
      alert('State Reset! ✅');
    } catch (e) {
      console.error(e);
      alert('Failed to reset');
    }
  };

  const handleToggle = (id: string) => {
    setToggledIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleComplete = (id: string, points: number) => {
    completeDailyChallenge({ challengeId: id, points });
  };

  const points = gamificationProfile?.total_points || 0;
  const level = gamificationProfile?.current_level || 1;
  const streak = gamificationProfile?.current_streak || 0;
  
  const levelTarget = level * 1000;
  const prevLevelTarget = (level - 1) * 1000;
  const progressToNextLevel = ((points - prevLevelTarget) / (levelTarget - prevLevelTarget)) * 100;
  const pointsToNextLevel = levelTarget - points;

  return (
    <View>
      <View style={[s.rewardsHeader, { justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Trophy size={20} color={colors.primary} />
          <Text style={s.sectionTitle}>Health Rewards</Text>
        </View>
        <Pressable onPress={handleDevReset} style={{ padding: 4, backgroundColor: '#fee2e2', borderRadius: 4 }}>
          <Text style={{ fontSize: 10, color: '#ef4444', fontWeight: 'bold' }}>DEV RESET</Text>
        </Pressable>
      </View>
      <Text style={s.rewardsSubtitle}>Track your progress and earn rewards for healthy habits</Text>

      <View style={s.rewardsRow}>
        <View style={[s.rewardCard, { backgroundColor: '#EDF3FA' }]}>
          <Text style={s.rewardLabel}>Total Points</Text>
          <View style={s.rewardValueRow}>
            <Text style={s.rewardValue}>{points.toLocaleString()}</Text>
            <Star size={24} color={colors.primary} fill={colors.primary} />
          </View>
        </View>
        <View style={[s.rewardCard, { backgroundColor: '#EDF3FA' }]}>
          <Text style={s.rewardLabel}>Current Level</Text>
          <View style={s.rewardValueRow}>
            <Text style={s.rewardValue}>{level}</Text>
            <TrendingUp size={24} color="#3B9BF5" />
          </View>
          <View style={s.levelBar}>
            <View style={[s.levelFill, { width: `${progressToNextLevel}%` }]} />
          </View>
          <Text style={s.levelText}>{pointsToNextLevel} pts to Level {level + 1}</Text>
        </View>
        <View style={[s.rewardCard, { backgroundColor: '#FFF7ED' }]}>
          <Text style={s.rewardLabel}>Current Streak</Text>
          <View style={s.rewardValueRow}>
            <Text style={[s.rewardValue, { color: '#F97316' }]}>{streak}</Text>
            <Flame size={24} color="#F97316" />
          </View>
          <Text style={[s.rewardValue, { fontSize: 14 }]}>days</Text>
          <Text style={s.streakText}>Keep it going! 🔥</Text>
        </View>
      </View>

      <Card style={s.sectionCard}>
        <View style={s.challengeHeader}>
          <Target size={18} color={colors.primary} />
          <Text style={s.cardSectionTitle}>Daily Challenges</Text>
        </View>
        {dailyChallenges.map((c: DailyChallenge) => {
          const isCompleted = completedChallenges?.includes(c.id) || c.completed;
          const isToggled = toggledIds[c.id];
          return (
            <View key={c.id} style={[s.challengeItem, isCompleted && s.challengeCompleted]}>
              <View style={s.challengeLeft}>
                <Pressable onPress={() => !isCompleted && handleToggle(c.id)}>
                  {isCompleted || isToggled ? (
                    <View style={s.challengeCheckDone}>
                      <CheckCircle size={24} color="#22C55E" />
                    </View>
                  ) : (
                    <View style={s.challengeCheckUndone}>
                      <Circle size={24} color={colors.border} />
                    </View>
                  )}
                </Pressable>
                <View style={s.challengeInfo}>
                  <Text style={s.challengeName}>{c.title}</Text>
                  <Text style={s.challengeDesc}>{c.description}</Text>
                </View>
              </View>
              <View style={s.challengeRight}>
                <View style={s.pointsBadge}>
                  <Text style={s.pointsText}>+{c.points} pts</Text>
                </View>
                {!isCompleted && (c.id === '1' || c.id === '2') && (
                  <Pressable 
                    style={[s.completeBtn, !isToggled && s.completeBtnDisabled]} 
                    onPress={() => isToggled && handleComplete(c.id, c.points)}
                    disabled={!isToggled}
                  >
                    <Text style={s.completeBtnText}>Complete</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </Card>

      <View style={s.goalsAchievementsRow}>
        <Card style={s.goalsCard}>
          <View style={s.cardHeaderRow}>
            <Star size={16} color={colors.primary} />
            <Text style={s.cardSectionTitle}>Weekly Goals</Text>
          </View>
          {weeklyGoals.map(g => (
            <View key={g.id} style={s.goalItem}>
              <View style={s.goalLabelRow}>
                <Text style={s.goalLabel}>{g.label}</Text>
                <Text style={s.goalProgress}>{g.current}/{g.target}</Text>
              </View>
              <View style={s.goalBar}>
                <View style={[s.goalFill, { width: `${(g.current / g.target) * 100}%` }]} />
              </View>
            </View>
          ))}
          <View style={s.goalBonus}>
            <Text style={s.goalBonusText}>Complete all weekly goals to earn a <Text style={s.goalBonusBold}>250 point bonus!</Text></Text>
          </View>
        </Card>

        <Card style={s.achievementsCard}>
          <View style={s.cardHeaderRow}>
            <Trophy size={16} color={colors.primary} />
            <Text style={s.cardSectionTitle}>Achievements</Text>
          </View>
          <View style={s.badgeGrid}>
            {achievements.map(a => {
              const Icon = achievementIconMap[a.icon] || Star;
              return (
                <View key={a.id} style={[s.badge, !a.earned && s.badgeLocked]}>
                  <View style={[s.badgeIcon, a.earned ? s.badgeIconEarned : s.badgeIconLocked]}>
                    <Icon size={18} color={a.earned ? '#FFFFFF' : colors.textTertiary} />
                  </View>
                  <Text style={[s.badgeName, !a.earned && s.badgeNameLocked]} numberOfLines={2}>{a.name}</Text>
                  {a.date && <Text style={s.badgeDate}>{a.date}</Text>}
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      <Card style={s.sectionCard}>
        <View style={s.cardHeaderRow}>
          <Users size={18} color={colors.primary} />
          <Text style={s.cardSectionTitle}>Community Leaderboard</Text>
        </View>
        {leaderboard.map((entry, idx) => (
          <View key={entry.id} style={[s.lbRow, entry.isYou && s.lbRowYou]}>
            <View style={s.lbRank}>
              {idx < 3 ? (
                <Crown size={18} color={idx === 0 ? '#F59E0B' : idx === 1 ? '#F59E0B' : '#F97316'} />
              ) : (
                <Text style={s.lbRankText}>{idx + 1}</Text>
              )}
            </View>
            <View style={s.lbAvatar}>
              <Text style={s.lbInitials}>{entry.initials}</Text>
            </View>
            <Text style={s.lbName}>{entry.name}</Text>
            {entry.isYou && (
              <View style={s.youBadge}>
                <Text style={s.youBadgeText}>You</Text>
              </View>
            )}
            <View style={s.lbPointsContainer}>
              <Star size={14} color={colors.primary} fill={colors.primary} />
              <Text style={s.lbPoints}>{entry.points.toLocaleString()}</Text>
            </View>
          </View>
        ))}
        <View style={s.lbReward}>
          <Gift size={24} color={colors.primary} />
          <Text style={s.lbRewardText}>Top 3 earn special rewards each month!</Text>
        </View>
      </Card>
    </View>
  );
}

const s = StyleSheet.create({
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    fontWeight: '700' as const,
  },
  rewardsSubtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  rewardsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  rewardCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.sm,
  },
  rewardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rewardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  levelBar: {
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  levelFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  levelText: {
    ...typography.small,
    color: colors.textTertiary,
    marginTop: 2,
  },
  streakText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic' as const,
  },
  sectionCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cardSectionTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  challengeCompleted: {
    backgroundColor: '#F0FFF4',
    borderColor: '#BBF7D0',
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  challengeCheckDone: {},
  challengeCheckUndone: {},
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  challengeDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  challengeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pointsBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pointsText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600' as const,
  },
  completeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  completeBtnDisabled: {
    opacity: 0.5,
  },
  completeBtnText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600' as const,
  },
  goalsAchievementsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  goalsCard: {
    flex: 1,
  },
  achievementsCard: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  goalItem: {
    marginBottom: spacing.md,
  },
  goalLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  goalLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  goalProgress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  goalBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  goalFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  goalBonus: {
    backgroundColor: '#EDF3FA',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  goalBonusText: {
    ...typography.small,
    color: colors.primary,
    textAlign: 'center',
  },
  goalBonusBold: {
    fontWeight: '700' as const,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    width: '30%' as unknown as number,
    alignItems: 'center',
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badgeIconEarned: {
    backgroundColor: colors.primary,
  },
  badgeIconLocked: {
    backgroundColor: colors.borderLight,
  },
  badgeName: {
    ...typography.small,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  badgeNameLocked: {
    color: colors.textTertiary,
  },
  badgeDate: {
    fontSize: 9,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: 1,
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lbRowYou: {
    backgroundColor: '#EDF3FA',
    borderRadius: borderRadius.md,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryFaded,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryFaded,
  },
  lbRank: {
    width: 28,
    alignItems: 'center',
  },
  lbRankText: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '600' as const,
  },
  lbAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  lbInitials: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700' as const,
  },
  lbName: {
    ...typography.headline,
    color: colors.textPrimary,
    flex: 1,
  },
  youBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  youBadgeText: {
    ...typography.small,
    color: colors.textInverse,
    fontWeight: '600' as const,
  },
  lbPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lbPoints: {
    ...typography.headline,
    color: colors.primary,
  },
  lbReward: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: '#EDF3FA',
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  lbRewardText: {
    ...typography.callout,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});
