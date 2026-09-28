import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Sparkles, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { useProductStore } from '../store/useProductStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';

export const AddCraftPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useProductStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [badge, setBadge] = useState<'New' | 'Bestseller' | 'Handmade' | 'Limited' | ''>('New');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subcategories for chosen category
  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId || !subcategoryId) {
      alert('Please fill in all required fields');
      return;
    }

    const finalImage =
      imagePreview ||
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80';

    setIsSubmitting(true);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const selectedSub = selectedCategory?.subcategories.find((s) => s.id === subcategoryId);

    const newCraft: Product = {
      id: `custom_${Date.now()}`,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      description: description.trim() || 'A beautiful handcrafted creation from Anu Atelier.',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      categoryId,
      categoryName: selectedCategory ? selectedCategory.name : 'Handicrafts',
      subcategoryId,
      subcategoryName: selectedSub ? selectedSub.name : subcategoryId,
      image: finalImage,
      stock: Number(stock) || 1,
      status: 'published',
      badge: badge ? badge : null,
      rating: 5.0,
      reviewsCount: 1,
      soldCount: 1,
      createdAt: Date.now(),
    };

    addProduct(newCraft);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('products').insert({
          name: newCraft.name,
          slug: newCraft.slug,
          category_name: newCraft.categoryName,
          subcategory_name: newCraft.subcategoryName,
          price: newCraft.price,
          original_price: newCraft.originalPrice,
          stock: newCraft.stock,
          badge: newCraft.badge,
          description: newCraft.description,
          images: [newCraft.image],
          is_featured: false,
          is_active: true,
        });
      } catch (err) {
        console.warn('Supabase product sync warning:', err);
      }
    }

    setIsSubmitting(false);
    alert('🎉 Craft published successfully! It is now live in the store.');
    navigate('/admin?tab=crafts');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full border border-[var(--border-color)] hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            Add New Craft
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Publish a new handmade craft item directly to the storefront.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-pink-200/70 shadow-sm space-y-6">
        {/* Section 1: Basic Info */}
        <div className="p-5 sm:p-6 rounded-2xl bracket-pink space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-pink-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-600" />
            <span>1. Basic Information</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Craft Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hand-carved Terracotta Diya with Floral Motifs"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200/70 bg-white/80 text-gray-900 text-sm focus:outline-none focus:border-pink-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Description & Artisan Notes
              </label>
              <textarea
                rows={3}
                placeholder="Tell the story of how this craft was created, materials used, and care instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-pink-200/70 bg-white/80 text-gray-900 text-sm focus:outline-none focus:border-pink-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Categorization */}
        <div className="p-5 sm:p-6 rounded-2xl bracket-purple space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-800">
            2. Categorization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200/70 bg-white/80 text-gray-900 text-sm focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Subcategory <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={!categoryId}
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200/70 bg-white/80 text-gray-900 text-sm focus:outline-none focus:border-purple-500 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <option value="">Select subcategory</option>
                {selectedCategory?.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Pricing & Inventory */}
        <div className="p-5 sm:p-6 rounded-2xl bracket-amber space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-800">
            3. Pricing & Inventory
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="e.g. 599"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200/70 bg-white/80 text-gray-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Original MRP (₹) (Optional)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 799"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200/70 bg-white/80 text-gray-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-amber-200/70 bg-white/80 text-gray-900 text-sm focus:outline-none focus:border-amber-500 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Craft Photo (4:5 Fixed Aspect Ratio) */}
        <div className="p-5 sm:p-6 rounded-2xl bracket-sky space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-800 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-sky-600" />
            <span>4. Product Media (4:5 Aspect Ratio)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Upload Craft Photo
                </label>
                <label className="border-2 border-dashed border-sky-300/70 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/70 transition-colors text-center shadow-xs">
                  <Upload className="h-6 w-6 text-sky-600" />
                  <span className="text-xs font-semibold text-gray-900">
                    Click to browse image
                  </span>
                  <span className="text-[11px] text-gray-500">
                    JPG, PNG, or WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Or Paste Direct Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-sky-200/70 bg-white/80 text-gray-900 text-xs focus:outline-none focus:border-sky-500 shadow-xs"
                />
              </div>
            </div>

            {/* Live 4:5 Preview Box */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-900">
                Live 4:5 Card Preview
              </span>
              <div className="relative aspect-[4/5] max-w-[200px] rounded-2xl overflow-hidden bg-white/90 border border-sky-200/80 flex items-center justify-center shadow-xs">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageUrl('');
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4 text-[var(--text-muted)] text-xs">
                    <ImageIcon className="h-8 w-8 mx-auto mb-1 opacity-40" />
                    <span>Upload image to see preview</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-[var(--border-color)] flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isSubmitting ? 'Publishing Craft...' : 'Publish Craft Now'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
