"use client";

import { useCallback, useEffect, useState } from "react";
import { Group, KnockoutMatch, Match, Player } from "@/lib/types";

interface TournamentData {
  players: Player[];
  groups: Group[];
  matches: Match[];
  knockout: KnockoutMatch[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTournament(): TournamentData {
  const [players, setPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [knockout, setKnockout] = useState<KnockoutMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const [playersRes, groupsRes, matchesRes, knockoutRes] = await Promise.all([
        fetch("/api/players"),
        fetch("/api/groups"),
        fetch("/api/matches"),
        fetch("/api/knockout"),
      ]);
      const [playersData, groupsData, matchesData, knockoutData] = await Promise.all([
        playersRes.json(),
        groupsRes.json(),
        matchesRes.json(),
        knockoutRes.json(),
      ]);
      setPlayers(playersData.players ?? []);
      setGroups(groupsData.groups ?? []);
      setMatches(matchesData.matches ?? []);
      setKnockout(knockoutData.knockout ?? []);
      setError(null);
    } catch {
      setError("Não foi possível carregar os dados do torneio.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { players, groups, matches, knockout, loading, error, refetch };
}
