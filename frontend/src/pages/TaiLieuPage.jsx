import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { documentsApi, categoriesApi } from '../services/api';
import { PublicLayout } from '../components/layout/PublicLayout';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FileText, Sheet, FileSpreadsheet, Download, FilePlusCorner} from 'lucide-react';

const TYPE_ICON = { pdf: <FileText className="w-4 h-4" />, docx: <FileSpreadsheet className="w-4 h-4" />, xlsx: <Sheet className="w-4 h-4" /> };

export function TaiLieuPage() {
  const [activeCategory, setActiveCategory] = useState('');

  const { data: docsData, isLoading } = useQuery({
    queryKey: ['documents', activeCategory],
    queryFn: () => documentsApi.getAll(activeCategory ? { category: activeCategory } : {}),
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const docs       = docsData?.data?.documents || [];
  const categories = catsData?.data?.categories || [];

  const getIcon = (doc) => {
    if (!doc.file_url) return <FileText className="w-4 h-4" />;
    const ext = doc.file_url.split('.').pop()?.toLowerCase();
    return TYPE_ICON[ext] || <FileText className="w-4 h-4" />;
  };

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tài liệu & Tiêu chuẩn</h1>
          <p className="text-gray-500 text-sm">Bộ tiêu chuẩn Sinh viên 5 Tốt các cấp và biểu mẫu đăng ký</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Documents list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3"><FilePlusCorner className="w-12 h-12 mx-auto" /></p>
            <p className="text-sm">Không có tài liệu nào.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <a
                key={doc.id}
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-4 hover:shadow-sm hover:border-gray-200 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-lg shrink-0">
                  {getIcon(doc)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 group-hover:text-green-700 transition-colors truncate">
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {doc.category_name && (
                      <span className="text-xs text-green-600">{doc.category_name}</span>
                    )}
                    {doc.category_name && <span className="text-gray-300 text-xs">·</span>}
                    <span className="text-xs text-gray-400">
                      {format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{doc.description}</p>
                  )}
                </div>
                <span className="text-xs text-green-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  Tải xuống <Download className="w-3 h-3 inline-block" />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
