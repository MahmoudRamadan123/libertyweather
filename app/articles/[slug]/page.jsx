"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Tag,
  ChevronRight,
  Share2,
  BookmarkPlus,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Check,
  Hash,
  ChevronDown,
  Eye,
  ThumbsUp,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Globe,
  Mail,
  Send,
  Heart,
  Bookmark,
  Printer,
  ArrowUpRight
} from 'lucide-react';

const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const calculateReadTime = (content) => {
  if (!content) return 5;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const extractHeadings = (content) => {
  if (!content || !content.startsWith("<")) return [];
  
  const headingRegex = /<(h[1-3])[^>]*>([^<]+)<\/h[1-3]>/g;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const tag = match[1];
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    
    headings.push({
      id,
      text,
      level: parseInt(tag.charAt(1))
    });
  }

  return headings;
};

const ArticlePage = ({ params }) => {
  const router = useRouter();
  // Get slug from params - this is now a Promise
  const [slug, setSlug] = useState(null);
  
  const [article, setArticle] = useState({
    id: null,
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image: '',
    author_name: '',
    category_name: '',
    published_at: null,
    read_time: 0,
    like_count: 0,
    view_count: 0,
    tags: [],
    author_avatar: '',
    author_bio: '',
    city: '',
    cover_image_caption: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeHeading, setActiveHeading] = useState('');
  const [tocOpen, setTocOpen] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);

  // Extract slug from params Promise
  useEffect(() => {
    const getSlug = async () => {
      try {
        // Await the params promise
        const resolvedParams = await params;
        setSlug(resolvedParams.slug);
      } catch (err) {
        console.error('Error resolving params:', err);
        setError('Failed to load article parameters');
      }
    };
    
    getSlug();
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    if (article?.content) {
      const headings = extractHeadings(article.content);
      
      const handleScroll = () => {
        const scrollPosition = window.scrollY + 100;
        
        for (const heading of headings) {
          const element = document.getElementById(heading.id);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveHeading(heading.id);
              break;
            }
          }
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [article?.content]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      
      // Fetch main article
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();

      if (articleError) {
        throw articleError;
      }

      if (articleData) {
        setArticle(articleData);
        setLikes(articleData.like_count || 0);
        
        // Fetch comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('article_id', articleData.id)
          .order('created_at', { ascending: false });
        
        setComments(commentsData || []);
      } else {
        setError('Article not found');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const newLiked = !liked;
      const newLikes = newLiked ? likes + 1 : Math.max(0, likes - 1);
      
      setLiked(newLiked);
      setLikes(newLikes);
      
      // Update in database
      await supabase
        .from('articles')
        .update({ like_count: newLikes })
        .eq('id', article.id);
    } catch (err) {
      console.error('Error updating like:', err);
      // Revert on error
      setLiked(!liked);
      setLikes(likes);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article.title;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  // Show loading while slug is being resolved
  if (!slug && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-12"></div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-12"></div>
            <div className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded-xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article.id) {
    // Return a not found page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Articles
          </Link>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(article.content);
  const headings = extractHeadings(article.content);
  const wordCount = article.content ? article.content.split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Back Navigation */}
      <div className="border-b dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="py-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to All Articles</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-900/20 dark:via-gray-900 dark:to-indigo-900/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            {/* Category */}
            <div className="mb-6">
              <Link
                href={`/category/${article.category_name?.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700"
              >
                <Tag className="w-4 h-4" />
                {article.category_name || 'General'}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-3xl">
                {article.excerpt}
              </p>
            )}

            {/* Author and Metadata */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-8 border-y dark:border-gray-800">
              <div className="flex items-center gap-4">
                {/* Author Avatar */}
                {article.author_avatar ? (
                  <div className="relative w-14 h-14">
                    <img
                      src={article.author_avatar}
                      alt={article.author_name}
                    
                      className="rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-lg"
                      sizes="56px"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {article.author_name}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4" />
                      {formatShortDate(article.published_at || article.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {readTime} min read
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      {wordCount.toLocaleString()} words
                    </span>
                    {article.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {article.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

           
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Left Sidebar - Table of Contents */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border dark:border-gray-700">
                  <button
                    onClick={() => setTocOpen(!tocOpen)}
                    className="flex items-center justify-between w-full mb-4"
                  >
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                      <Hash className="w-5 h-5" />
                      Table of Contents
                    </h3>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${tocOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {tocOpen && (
                    <nav className="space-y-2">
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const element = document.getElementById(heading.id);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className={`block text-sm transition-colors duration-200 py-1.5 px-2 rounded-lg ${
                            activeHeading === heading.id
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                              : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }`}
                          style={{ marginLeft: `${(heading.level - 1) * 16}px` }}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              )}

              {/* Article Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Article Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Reading time</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{readTime} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Word count</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Published</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatShortDate(article.published_at || article.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Category</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{article.category_name}</span>
                  </div>
                </div>
              </div>

             
            </div>
          </aside>

          {/* Main Article Content */}
          <main className="flex-1 max-w-4xl mx-auto">
            {/* Cover Image */}
            {article.cover_image && (
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-8 shadow-xl">
                <img
                  src={article.cover_image}
                  alt={article.cover_image_alt || article.title}
                  
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
                {article.cover_image_caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                    <p className="text-white/90 text-sm text-center">
                      {article.cover_image_caption}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Article Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <div 
                className="bg-white text-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border dark:border-gray-700"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </article>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm transition-colors hover:scale-105"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                        liked
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                      <span>Like ({likes})</span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all">
                      <MessageCircle className="w-5 h-5" />
                      <span>Comment ({comments.length})</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Share:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                        aria-label="Share on Twitter"
                      >
                        <Twitter className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-500 rounded-lg transition-colors"
                        aria-label="Share on LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-800 dark:text-blue-600 rounded-lg transition-colors"
                        aria-label="Share on Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Author Bio */}
            <div className="mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {article.author_avatar && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img
                        src={article.author_avatar}
                        alt={article.author_name}
                        className="rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        About {article.author_name}
                      </h3>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-sm">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Expert Writer</span>
                      </div>
                    </div>
                    {article.author_bio && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {article.author_bio}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        {article.city || 'Dallas, TX'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-4 h-4" />
                        Joined {formatShortDate(new Date().setFullYear(new Date().getFullYear() - 2))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center py-8 border-t dark:border-gray-800">
              <div className="text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Previous</p>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>How to Build Scalable Applications</span>
                </Link>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Next</p>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  <span>Advanced React Patterns</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;