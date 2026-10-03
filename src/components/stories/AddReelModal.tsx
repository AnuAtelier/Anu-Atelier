import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, PlusCircle, Sparkles, Video, Image, MapPin, User, Tag, Heart, Music } from 'lucide-react';
import { useReelStore } from '../../store/useReelStore';
import { useProductStore } from '../../store/useProductStore';
import { ReelStory } from '../../types';

export const AddReelModal: React.FC = () => {
  const { isAddModalOpen, closeAddModal, addReel } = useReelStore();
  const { products } = useProductStore();

  const [type, setType] = useState<'artisan' | 'customer'>('artisan');
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [location, setLocation] = useState('Varanasi, Uttar Pradesh');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('video');
  const [mediaUrl, setMediaUrl] = useState('/videos/reel-pottery-molding.mp4');
  const [caption, setCaption] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [badge, setBadge] = useState('🎥 Live Video Reel');
  const [selectedMusicIndex, setSelectedMusicIndex] = useState(0);

  const presetMusicTracks = [
    {
      title: 'Vadodara Sitar & Percussion (Instrumental) 🪕',
      artist: 'Kevin MacLeod (Pure Sitar Instrumental - No Vocals)',
      audioUrl: '/audio/vadodora-sitar.mp3',
    },
    {
      title: 'Shri Nilotpala Divine Veena (Instrumental) 🪕',
      artist: 'L. Ramakrishnan (Pure Classical Veena - No Vocals)',
      audioUrl: '/audio/veena-melody.ogg',
    },
    {
      title: 'Jalandhar Bansuri Flute & Sitar Raag (Instrumental) 🪈',
      artist: 'Kevin MacLeod (Pure Sitar & Flute - No Vocals)',
      audioUrl: '/audio/jalandhar-rag.mp3',
    },
    {
      title: 'Raag Kiravani Classical Violin Solo (Instrumental) 🎻',
      artist: 'L. Ramakrishnan (Pure Indian Classical Violin - No Vocals)',
      audioUrl: '/audio/kiravani-violin.ogg',
    },
    {
      title: 'Eastern Thought Sitar & Tanpura Symphony (Instrumental) 🎶',
      artist: 'Kevin MacLeod (Pure Sitar Meditation - No Vocals)',
      audioUrl: '/audio/eastern-thought.mp3',
    },
  ];

  const presetVideos = [
    { label: 'Pottery Wheel Kulhad', url: '/videos/reel-pottery-molding.mp4' },
    { label: 'Clay Sculpting', url: '/videos/reel-ceramic-modeling.mp4' },
    { label: 'Chikankari Needlework', url: '/videos/reel-embroidery-needlework.mp4' },
    { label: 'Wall Mural Painting', url: '/videos/reel-artist-painting.mp4' },
    { label: 'Earthenware Studio', url: '/videos/reel-pottery-workshop.mp4' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !authorName.trim() || !mediaUrl.trim()) {
      alert('Please fill out Title, Author Name, and Media URL!');
      return;
    }

    const matchedProduct = products.find((p) => p.id === selectedProductId);

    const newReelData: Omit<ReelStory, 'id' | 'createdAt' | 'likesCount' | 'viewsCount'> = {
      type,
      title: title.trim(),
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || (type === 'artisan' ? 'Master Artisan' : 'Verified Buyer'),
      authorAvatar: '/img/story-clay-prep.jpg',
      location: location.trim(),
      mediaType,
      mediaUrl: mediaUrl.trim(),
      caption: caption.trim() || title.trim(),
      badge: badge.trim(),
      musicTrack: presetMusicTracks[selectedMusicIndex],
      craftTag: matchedProduct
        ? {
            productId: matchedProduct.id,
            productSlug: matchedProduct.slug,
            productName: matchedProduct.name,
            productPrice: matchedProduct.price,
            productImage: matchedProduct.image,
          }
        : undefined,
      customerReview:
        type === 'customer'
          ? {
              rating: 5,
              city: location.trim(),
              comment: caption.trim(),
            }
          : undefined,
    };

    addReel(newReelData);

    // Reset form
    setTitle('');
    setAuthorName('');
    setAuthorRole('');
    setCaption('');
  };

  if (!isAddModalOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fade-in"
      onClick={closeAddModal}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-200/80 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold">Add Artisan Video Reel or Story</h3>
              <p className="text-xs text-pink-100">
                Publish genuine craft videos with authentic Indian songs & music
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAddModal}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Reel Category Toggle */}
          <div>
            <label className="font-bold text-gray-800 block mb-1.5">Reel Story Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('artisan')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'artisan'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span>🏺 Artisan Workshop Reel</span>
              </button>
              <button
                type="button"
                onClick={() => setType('customer')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'customer'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                <span>🏡 Customer Showcase Reel</span>
              </button>
            </div>
          </div>

          {/* Reel Title */}
          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Reel Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Traditional Terracotta Kulhad Wheel Spinning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50"
            />
          </div>

          {/* Author Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-800 block mb-1">
                Artisan or Buyer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rameshwar Kumhar"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="font-bold text-gray-800 block mb-1">Role / Title</label>
              <input
                type="text"
                placeholder={type === 'artisan' ? 'e.g. Master Potter' : 'e.g. Verified Homeowner'}
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Location & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-800 block mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Gorakhpur, Uttar Pradesh"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50"
              />
            </div>
            <div>
              <label className="font-bold text-gray-800 block mb-1">Badge Tag</label>
              <input
                type="text"
                placeholder="e.g. 🎥 Live Video Reel"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Indian Background Music / Song Selection */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200">
            <label className="font-bold text-pink-900 flex items-center gap-1.5 mb-1.5">
              <Music className="h-4 w-4 text-pink-600" />
              <span>Background Song / Music Track</span>
            </label>
            <select
              value={selectedMusicIndex}
              onChange={(e) => setSelectedMusicIndex(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-pink-300 bg-white font-medium text-stone-800 focus:outline-none focus:border-pink-500 text-xs sm:text-sm"
            >
              {presetMusicTracks.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m.title} ({m.artist})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-pink-700/80 mt-1">
              Plays soothing authentic Indian instrumental music when viewers watch the video reel.
            </p>
          </div>

          {/* Media Video URL with Quick Pick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-800">
                Media URL (Video MP4) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className="px-2 py-0.5 rounded-md font-semibold bg-pink-100 text-pink-700 cursor-pointer"
                >
                  Video (MP4)
                </button>
              </div>
            </div>
            <input
              type="text"
              required
              placeholder="/videos/reel-pottery-molding.mp4 or https://.../video.mp4"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50"
            />

            {/* Quick Pick Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-stone-500 font-medium mr-1">Quick pick craft video:</span>
              {presetVideos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMediaUrl(p.url);
                    setMediaType('video');
                  }}
                  className="px-2 py-0.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-[10px] font-semibold border border-pink-200 transition-colors cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tagged Craft Product */}
          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Tag a Craft (Allows 1-Click Purchase in Reel)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50 cursor-pointer text-xs sm:text-sm"
            >
              <option value="">-- No Tagged Product --</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} (₹{prod.price})
                </option>
              ))}
            </select>
          </div>

          {/* Caption / Story */}
          <div>
            <label className="font-bold text-gray-800 block mb-1">
              Story Caption / Customer Review Quote
            </label>
            <textarea
              rows={3}
              placeholder="Tell the artisan's technique or customer's heartfelt feedback..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl border border-stone-300 focus:outline-none focus:border-pink-500 bg-stone-50/50 resize-none text-xs sm:text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Publish Reel With Music</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
