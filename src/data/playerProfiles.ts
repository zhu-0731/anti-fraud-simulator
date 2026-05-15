import type { PlayerProfile } from '@/domain/types/game';

export const defaultPlayerProfile: PlayerProfile = {
  id: 'player_chenli',
  name: '陈莉',
  school: '某省重点本科院校',
  major: '计算机科学与技术',
  year: '大四',
  targetSchool: 'Z大学',
  targetMajor: '软件工程',
  backstory:
    '你是大四学生陈莉，已通过Z大学软件工程系的保研初试和复试。当前正处于等待正式录取确认阶段。你的导师说最近保研确认期间出现了不少诈骗信息，要你小心。',
  avatarInitials: '陈',
};

export const playerProfiles: PlayerProfile[] = [defaultPlayerProfile];
