export interface Team {
  id: string
  name: string
  code: string
  flag_url: string | null
  group_name: string | null
  created_at: string
}

export interface Stadium {
  id: string
  name: string
  city: string
  country: string
  capacity: number | null
  created_at: string
}

export interface Match {
  id: string
  home_team_id: string
  away_team_id: string
  stadium_id: string
  match_date: string
  stage: 'group_stage' | 'round_of_32' | 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'third_place' | 'final'
  group_name: string | null
  home_score: number | null
  away_score: number | null
  status: 'scheduled' | 'live' | 'finished'
  match_number: number | null
  created_at: string
  updated_at: string
  home_team?: Team
  away_team?: Team
  stadium?: Stadium
}

export interface Bet {
  id: string
  user_id: string
  match_id: string
  predicted_home_score: number
  predicted_away_score: number
  points: number
  created_at: string
  updated_at: string
  match?: Match
}

export interface Profile {
  id: string
  name: string
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Ranking {
  id: string
  user_id: string
  total_points: number
  exact_scores: number
  correct_winners: number
  partial_scores: number
  total_bets: number
  position: number
  updated_at: string
  profile?: Profile
}

export type MatchWithTeams = Match & {
  home_team: Team
  away_team: Team
  stadium: Stadium
}

export type BetWithMatch = Bet & {
  match: MatchWithTeams
}

export type RankingWithProfile = Ranking & {
  profile: Profile
}
