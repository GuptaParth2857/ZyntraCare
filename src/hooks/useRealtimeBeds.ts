'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface RealtimeBedData {
  hospitalId: string;
  hospitalName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  totalICU: number;
  availableICU: number;
  occupiedICU: number;
  occupancyPercent: number;
  icuOccupancy: number;
  lastUpdated: string;
}

export function useRealtimeBeds(hospitalIds?: string[]) {
  const [bedData, setBedData] = useState<RealtimeBedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const fetchBedData = useCallback(async () => {
    if (!hospitalIds || hospitalIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('real_time_beds')
        .select('*')
        .in('hospitalId', hospitalIds)
        .order('updatedAt', { ascending: false });

      if (fetchError) throw fetchError;

      const formatted = (data || []).map(bed => ({
        hospitalId: bed.hospitalId,
        hospitalName: bed.hospitalName,
        totalBeds: bed.totalBeds,
        availableBeds: bed.availableBeds,
        occupiedBeds: bed.occupiedBeds,
        totalICU: bed.totalICU,
        availableICU: bed.availableICU,
        occupiedICU: bed.occupiedICU,
        occupancyPercent: bed.totalBeds > 0 
          ? Math.round(((bed.totalBeds - bed.availableBeds) / bed.totalBeds) * 100) 
          : 0,
        icuOccupancy: bed.totalICU > 0 
          ? Math.round(((bed.totalICU - bed.availableICU) / bed.totalICU) * 100) 
          : 0,
        lastUpdated: bed.updatedAt
      }));

      setBedData(formatted);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bed data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hospitalIds]);

  useEffect(() => {
    fetchBedData();

    if (!hospitalIds || hospitalIds.length === 0) return;

    const channel = supabase
      .channel('bed-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'real_time_beds',
          filter: hospitalIds.map(id => `hospitalId=eq.${id}`).join(',')
        },
        (payload) => {
          console.log('Bed update received:', payload);
          fetchBedData();
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hospitalIds, fetchBedData]);

  return { bedData, loading, error, connected, refetch: fetchBedData };
}

export async function updateHospitalBeds(
  hospitalId: string,
  hospitalName: string,
  totalBeds: number,
  availableBeds: number,
  totalICU: number,
  availableICU: number,
  adminKey: string
) {
  const occupiedBeds = totalBeds - availableBeds;
  const occupiedICU = totalICU - availableICU;

  const { data, error } = await supabase
    .from('real_time_beds')
    .upsert({
      hospitalId,
      hospitalName,
      totalBeds,
      availableBeds,
      occupiedBeds,
      totalICU,
      availableICU,
      occupiedICU,
      lastUpdatedBy: adminKey,
      updateSource: 'manual',
      isVerified: true,
      updatedAt: new Date().toISOString()
    }, { onConflict: 'hospitalId' })
    .select();

  if (error) throw error;
  return data;
}

export async function getBedStatusForHospital(hospitalId: string) {
  const { data, error } = await supabase
    .from('real_time_beds')
    .select('*')
    .eq('hospitalId', hospitalId)
    .single();

  if (error) throw error;
  return data;
}