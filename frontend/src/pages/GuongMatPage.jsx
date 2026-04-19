import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '../services/api';
import { PublicLayout } from '../components/layout/PublicLayout';

export function GuongMatPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: studentsApi.getAll,
  });
  const students = data?.data?.students || [];

  // Group by academic_year
  const grouped = students.reduce((acc, s) => {
    const yr = s.academic_year || 'Khác';
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(s);
    return acc;
  }, {});

  return (
    <PublicLayout>

      <div className="bg-green-900 text-white py-14 px-4 text-center">
        <span className="inline-block bg-green-800 text-green-200 text-xs px-3 py-1 rounded-full mb-4">
          Khoa Tâm lý học · Năm học 2024–2025
        </span>
        <h1 className="text-3xl font-bold mb-3">
          Gương mặt <span className="text-green-400">Sinh viên 5 Tốt tiêu biểu</span>
        </h1>
        <p className="text-green-300 text-sm mb-6 max-w-md mx-auto">
          Những sinh viên xuất sắc toàn diện của khoa Tâm lý học
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-16">Chưa có dữ liệu.</p>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([year, list]) => (
              <div key={year} className="mb-10">
                <h2 className="text-sm font-semibold text-green-700 mb-4 flex items-center gap-2">
                  <span className="w-4 h-px bg-green-300 inline-block" />
                  Khóa {year}
                  <span className="w-full h-px bg-green-100 inline-block" />
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {list.map((s) => {
                    const initials = s.name.split(' ').slice(-2).map((w) => w[0]).join('');
                    return (
                      <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-all">
                        <div className="flex gap-4">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 font-semibold text-lg flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-green-600 font-medium mt-0.5">{s.achievement}</p>
                            {s.description && (
                              <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{s.description}</p>
                            )}
                          </div>
                        </div>
                        {s.facebook_url && (
                          <a
                            href={s.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-xs text-blue-600 hover:underline"
                          >
                            Facebook →
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
        )}
      </div>
    </PublicLayout>
  );
}
