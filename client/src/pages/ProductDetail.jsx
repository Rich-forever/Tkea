import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../lib/api';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ProductLightbox from '../components/ProductLightbox';
import Breadcrumb from '../components/Breadcrumb';
import ShareButton from '../components/ShareButton';

const humanizeSpecKey = (key = '') =>
  String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const { t } = useTranslation();
  useEffect(() => {
    api.get(`/products/${slug}`).then(r => setP(r.data));
  }, [slug]);

  const [activeImage, setActiveImage] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const scrollRef = React.useRef(null);

  useEffect(() => {
    if (p) setActiveImage(p.heroImageUrl);
  }, [p]);

  const scrollGallery = (dir) => {
    if (scrollRef.current) {
      const amount = 200;
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  if (!p) return <div className="container-px max-w-7xl mx-auto py-12">{t('common.loading')}</div>;

  const skinTypeKey = typeof p.skinType === 'string'
    ? p.skinType.toLowerCase()
    : null;

  const skinTypeLabel = skinTypeKey
    ? t(`filters.skin_type_tags.${skinTypeKey}`)
    : null;

  const allImages = [p.heroImageUrl, ...(p.galleryImageUrls || [])].filter(Boolean);
  const specs = p.specs || {};

  const lang = i18n.language.startsWith('ar') ? 'Ar' : 'En';
  const name = p[`name${lang}`] || p.name;
  const shortDescription = p[`shortDescription${lang}`] || p.shortDescription;
  const longDescription = p[`longDescription${lang}`] || p.longDescription;
  const category = p[`category${lang}`] || p.category;
  const scentProfile = p[`scentProfile${lang}`] || p.scentProfile;
  const benefits = p[`benefits${lang}`] || p.benefits || [];

  return (
    <div>
      <Helmet><title>{name} — {t('brand')}</title></Helmet>

      <div className="container-px max-w-7xl mx-auto pt-6">
        <Link to="/collection" className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors mb-4">
          <ChevronLeft className="w-4 h-4" />
          <span>{t('cta.view_all')} {t('nav.collection')}</span>
        </Link>
      </div>

      <Breadcrumb items={[
        { label: t('nav.home'), href: '/' },
        { label: t('nav.collection'), href: '/collection' },
        { label: name, href: `/product/${slug}` }
      ]} />

      {/* Lightbox */}
      <AnimatePresence mode="wait">
        {lightboxOpen && (
          <ProductLightbox
            key="product-lightbox"
            activeImage={activeImage}
            allImages={allImages}
            onClose={() => setLightboxOpen(false)}
            setActiveImage={setActiveImage}
          />
        )}
      </AnimatePresence>

      <div className="container-px max-w-7xl mx-auto py-6 md:py-10 px-3 sm:px-4 md:px-6">
        <div className="md:hidden mb-5">
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight">{name}</h1>
          <p className="text-black/70 mt-2 text-sm sm:text-base">{shortDescription}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-10 lg:gap-12">
          <div className="order-1 space-y-3 w-full">
            <div
              className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-soft bg-white border border-black/5 cursor-zoom-in aspect-[4/3] sm:aspect-[5/4] md:aspect-[4/3]"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={activeImage || p.heroImageUrl}
                alt={name}
                className="h-full w-full object-contain bg-white"
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-2 rounded-full shadow-sm">
                <Maximize2 className="w-5 h-5 text-charcoal" />
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="relative group">
                {allImages.length > 4 && (
                  <button
                    onClick={() => scrollGallery('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 shadow-md rounded-full -ml-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div
                  ref={scrollRef}
                  className={`flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory ${allImages.length <= 4 ? 'justify-start sm:justify-center' : ''}`}
                >
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 snap-center rounded-xl overflow-hidden border transition-all ${activeImage === img ? 'border-charcoal ring-1 ring-charcoal' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {allImages.length > 4 && (
                  <button
                    onClick={() => scrollGallery('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/80 shadow-md rounded-full -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="order-2 pt-1 sm:pt-2">
            <div className="hidden md:block">
              <h1 className="font-serif text-4xl lg:text-5xl mb-4 lg:mb-6">{name}</h1>
              <p className="text-lg text-black/60 mb-6 leading-relaxed">
                {shortDescription}
              </p>
              <div className="text-base lg:text-lg leading-relaxed text-black/80 mb-8 whitespace-pre-wrap">
                {longDescription}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(p[`tags${lang}`] || p.tags || []).map(tag => <span key={tag} className="text-[11px] bg-ivory rounded-full px-3 py-1 border border-black/5">{tag}</span>)}
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              {p.beeorderUrl && <a href={p.beeorderUrl} target="_blank" rel="noreferrer" className="btn btn-primary w-full sm:w-auto">{t('product.order_on_beeorder')}</a>}
              <ShareButton />
            </div>

            {(category || (typeof p.weightGrams === 'number' && !Number.isNaN(p.weightGrams)) || skinTypeLabel || scentProfile || Object.keys(specs).length > 0) && (
              <div className="mt-6 rounded-2xl sm:rounded-3xl border border-black/5 bg-white/60 backdrop-blur-sm p-4 sm:p-5 space-y-4">
                <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-black/50">
                  {t('product.details')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  {category && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-black/50">
                        {t('product.category')}
                      </div>
                      <div className="text-black/80">{category}</div>
                    </div>
                  )}
                  {typeof p.weightGrams === 'number' && !Number.isNaN(p.weightGrams) && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-black/50">
                        {t('product.weight')}
                      </div>
                      <div className="text-black/80">
                        {t('product.weight_unit_grams', { value: p.weightGrams })}
                      </div>
                    </div>
                  )}
                  {skinTypeLabel && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-black/50">
                        {t('product.skin_type')}
                      </div>
                      <div className="text-black/80">{skinTypeLabel}</div>
                    </div>
                  )}
                  {scentProfile && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-black/50">
                        {t('product.scent_profile')}
                      </div>
                      <div className="text-black/80">{scentProfile}</div>
                    </div>
                  )}
                  {Object.entries(specs).map(([key, value]) => {
                    if (value === undefined || value === null || value === '') return null;
                    return (
                      <div key={key}>
                        <div className="text-[11px] uppercase tracking-wide text-black/50">
                          {humanizeSpecKey(key)}
                        </div>
                        <div className="text-black/80">{String(value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 space-y-6">
              {benefits?.length ? (
                <div>
                  <div className="font-semibold mb-2">{t('product.benefits')}</div>
                  <ul className="list-disc pl-6">{benefits.map(b => <li key={b}>{b}</li>)}</ul>
                </div>
              ) : null}
              {p.ingredients?.length ? (
                <div className="rounded-3xl border border-black/5 bg-white/60 backdrop-blur-sm p-5">
                  <div className="text-[11px] font-medium tracking-[0.18em] uppercase text-black/50 mb-3">{t('product.key_ingredients')}</div>
                  <ul className="space-y-2">
                    {p.ingredients.map((i) => {
                      const iName = i[`name${lang}`] || i.name;
                      const iDesc = i[`description${lang}`] || i.description;
                      return (
                        <li key={i.id} className="text-sm">
                          <Link to={`/ingredients/${i.slug}`} className="underline font-medium">
                            {iName}
                          </Link>{' '}
                          <span className="text-black/70">— {iDesc}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
