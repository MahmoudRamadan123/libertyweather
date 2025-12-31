"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function Cards({ colorBg }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
const { data, error } = await supabase
  .from('articles')
  .select('id,title,slug,excerpt,cover_image,created_at')
  .order('created_at', { ascending: false });


      if (!error) setArticles(data || []);
      setLoading(false);
    }

    fetchArticles();
  }, []);

  if (loading) return null;

  return (
    <section className="px-4 pb-10 flex flex-col items-center gap-10">
      <h2 className="lg:text-5xl text-3xl font-bold text-center text-[#e5f4ff]">
        Helpful Reads for Dallas
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className={`
              bg-[${colorBg}]/90
              border border-[#70c6dd]/30
              rounded-2xl
              p-3
              flex flex-col
              shadow-[0_10px_25px_rgba(0,0,0,0.45)]
              hover:border-[#70c6dd]
              transition
              h-[250px] lg:h-[450px]
            `}
          >
            <div className="w-full h-[60%] rounded-xl border border-[#70c6dd]/40 overflow-hidden">
              {article.cover_image ? (
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#879fb8]/40 to-[#1e211a]/40" />
              )}
            </div>

            <p className="lg:text-[22px] text-[14px] font-semibold text-[#e5f4ff] mt-3 line-clamp-2">
              {article.title}
            </p>

            <p className="text-xs text-[#cde9f5] mt-1 line-clamp-2">
              {article.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
