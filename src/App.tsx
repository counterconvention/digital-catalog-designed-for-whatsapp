import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { InstagramSection } from './components/InstagramSection';
import { TrustAndFooter } from './components/TrustAndFooter';
import { RealTimeOrderToast } from './components/RealTimeOrderToast';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminLayout } from './components/admin/AdminLayout';
import { CatalogFilterHub } from './components/CatalogFilterHub';
import { ProductCategory, ProductSize } from './types';
import { Search, Sparkles } from 'lucide-react';

const CatalogView: React.FC = () => {
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    settings
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [onlyPromos, setOnlyPromos] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

  const categories: { id: ProductCategory | 'Todos'; label: string }[] = [
    { id: 'Todos', label: 'Todos os Looks' },
    { id: 'Conjuntos', label: 'Conjuntos' },
    { id: 'Vestidos', label: 'Vestidos' },
    { id: 'Saias & Shorts', label: 'Saias & Shorts' },
    { id: 'Camisas & Blusas', label: 'Camisas & Blusas' }
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: products.length
    };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const handleResetFilters = () => {
    setSelectedCategory('Todos');
    setSearchQuery('');
    setMaxPrice(null);
    setSelectedSize(null);
    setOnlyPromos(false);
    setSortBy('featured');
  };

  // Filtering and sorting logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'Todos' || product.category === selectedCategory;

        const matchesSearch =
          !searchQuery.trim() ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.fabric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.colors.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesPromo = !onlyPromos || product.isPromo;

        const effectivePrice =
          product.isPromo && product.promoPrice ? product.promoPrice : product.salePrice;
        const matchesMaxPrice = maxPrice === null || effectivePrice <= maxPrice;

        const matchesSize =
          selectedSize === null ||
          product.sizes.some((s) => s.size === selectedSize && s.quantity > 0);

        return (
          matchesCategory &&
          matchesSearch &&
          matchesPromo &&
          matchesMaxPrice &&
          matchesSize
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') {
          const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.salePrice;
          const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.salePrice;
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          const priceA = a.isPromo && a.promoPrice ? a.promoPrice : a.salePrice;
          const priceB = b.isPromo && b.promoPrice ? b.promoPrice : b.salePrice;
          return priceB - priceA;
        }
        // featured default
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, onlyPromos, maxPrice, selectedSize, sortBy]);

  return (
    <div className="min-h-screen bg-stone-50/50 flex flex-col selection:bg-rose-100 selection:text-rose-900">
      {/* Header */}
      <Header />

      {/* Hero Welcome Banner (Compacto, elegante e chamativo) */}
      <section className="bg-gradient-to-r from-stone-100 via-rose-50/35 to-stone-100 border-b border-neutral-200/70 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-neutral-800 border border-neutral-200/80 text-[11px] font-bold uppercase tracking-widest shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Coleção Exclusiva e Alfaiataria</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            Elegância e Caimento Atemporal
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto font-sans leading-relaxed">
            Selecione suas peças favoritas, confira disponibilidade de cores e tamanhos em tempo real e feche seu pedido com atendimento VIP via WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Catalog Explorer Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Nova Aba de Categorias e Pesquisa Unificada e Coesa */}
        <CatalogFilterHub
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onlyPromos={onlyPromos}
          onTogglePromos={setOnlyPromos}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
          onResetFilters={handleResetFilters}
        />

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg">
              Nenhuma peça encontrada
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
              Não encontramos nenhum look correspondente aos filtros atuais (categoria, tamanho ou faixa de preço).
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Limpar Todos os Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Instagram Integration & Lookbook Section */}
      <InstagramSection />

      {/* Mini Landing Page Footer with trust badges and physical store address */}
      <TrustAndFooter />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { currentView } = useStore();

  return (
    <>
      {currentView === 'admin' ? <AdminLayout /> : <CatalogView />}

      {/* Global Drawers, Modals and Floating Alerts */}
      <ProductModal />
      <CartDrawer />
      <RealTimeOrderToast />
      <AdminPinModal />
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
