'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Stats {
  totalTours: number;
  publishedTours: number;
  draftTours: number;
  totalViews: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalTours: 0,
    publishedTours: 0,
    draftTours: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: tours } = await supabase
        .from('tours')
        .select('status, views_count');

      if (tours) {
        const published = tours.filter(t => t.status === 'published').length;
        const draft = tours.filter(t => t.status === 'draft').length;
        const totalViews = tours.reduce((sum, t) => sum + (t.views_count || 0), 0);

        setStats({
          totalTours: tours.length,
          publishedTours: published,
          draftTours: draft,
          totalViews,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Tours', value: stats.totalTours },
    { name: 'Published', value: stats.publishedTours },
    { name: 'Drafts', value: stats.draftTours },
    { name: 'Total Views', value: stats.totalViews },
  ];

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#00000008] rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-light text-[#000000] font-(family-name:--font-montserrat) mb-2">
          Content Management
        </h2>
        <p className="text-[#00000099]">
          Manage your tours and website content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white border border-[#0000001A] rounded-lg p-6 hover:border-[#4A5B2D]/30 transition-colors"
          >
            <p className="text-sm text-[#00000099] mb-1">
              {stat.name}
            </p>
            <p className="text-3xl font-light text-[#000000] font-(family-name:--font-montserrat)">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-light text-[#000000] font-(family-name:--font-montserrat) mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/dashboard/tours/create"
            className="flex items-center gap-3 p-6 bg-[#4A5B2D] text-white rounded-lg hover:bg-[#3d4a24] transition-colors border border-[#4A5B2D]"
          >
            <span className="text-3xl font-light">+</span>
            <span className="text-lg">Create New Tour</span>
          </Link>
          <Link
            href="/admin/dashboard/tours"
            className="p-6 bg-white text-[#000000] rounded-lg hover:bg-[#00000008] transition-colors border border-[#0000001A]"
          >
            <span className="text-lg">View All Tours →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
