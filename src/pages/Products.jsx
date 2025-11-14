import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, fetchCategories, setFilters, clearFilters } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import { ProductSkeletonGrid } from '../components/ProductSkeleton';
import { AlertCircle, PackageX, SlidersHorizontal, X, Sparkles, Star, TrendingUp, Zap, Filter, Grid, CheckCircle } from 'lucide-react';

const Products = () => {
  const dispatch = useDispatch();
  const { products, categories, loading, error, filters } = useSelector((state) => state.products);
  const [addedToCart, setAddedToCart] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products and categories on component mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Re-fetch products when filters change
  useEffect(() => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    
    dispatch(fetchProducts(params));
  }, [filters, dispatch]);

  const handleSearch = (searchQuery) => {
    dispatch(setFilters({ search: searchQuery }));
  };

  const handleCategoryChange = (category) => {
    dispatch(setFilters({ category }));
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    setAddedToCart(product.id);
    
    setTimeout(() => {
      setAddedToCart(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>

      <Navbar onSearch={handleSearch} />

      {/* Success Toast */}
      {addedToCart && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 animate-slide-in flex items-center gap-3 border-2 border-white">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-lg">Added to cart!</p>
            <p className="text-sm text-green-100">Product successfully added</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Page Header - STUNNING */}
        <div className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full filter blur-3xl opacity-10"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                        {filters.category ? `${filters.category}` : 'All Products'}
                      </h1>
                      <p className="text-white/90 text-lg font-medium flex items-center gap-2 mt-1">
                        <Sparkles className="w-5 h-5" />
                        {filters.search
                          ? `Results for "${filters.search}"`
                          : 'Discover amazing products at unbeatable prices'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-4">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                      <p className="text-white text-sm font-semibold">🔥 Hot Deals</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                      <p className="text-white text-sm font-semibold">⚡ Fast Shipping</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                      <p className="text-white text-sm font-semibold">✨ Premium Quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 transform hover:scale-105"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Category Filter */}
          <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <CategoryFilter
                categories={categories}
                selectedCategory={filters.category}
                onCategoryChange={handleCategoryChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Main Content - Products Grid */}
          <main className="lg:col-span-3">
            {/* Error State */}
            {error && (
              <div className="bg-white border-l-4 border-red-500 rounded-2xl shadow-xl p-6 flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-xl text-gray-900 mb-1">Error loading products</p>
                  <p className="text-gray-600">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && <ProductSkeletonGrid count={9} />}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-3xl shadow-2xl p-20 text-center border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-100 rounded-full filter blur-3xl opacity-30"></div>
                
                <div className="relative">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-12 rounded-full shadow-xl">
                      <PackageX className="w-24 h-24 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-10 text-xl max-w-md mx-auto">
                    {filters.search || filters.category
                      ? 'Try adjusting your filters or search query to find what you\'re looking for'
                      : 'No products available at the moment. Check back soon!'}
                  </p>
                  {(filters.search || filters.category) && (
                    <button
                      onClick={handleClearFilters}
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-10 py-5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 inline-flex items-center gap-2"
                    >
                      <X className="w-6 h-6" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                {/* Products Count Bar */}
                <div className="mb-8 bg-gradient-to-r from-white to-purple-50 rounded-2xl px-6 py-5 shadow-xl border border-gray-100 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Grid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">Showing Results</p>
                      <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        {products.length} {products.length === 1 ? 'Product' : 'Products'}
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                      </p>
                    </div>
                  </div>
                  {(filters.search || filters.category) && (
                    <button
                      onClick={handleClearFilters}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-sm flex items-center gap-2 hover:scale-105 transform"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="transform transition-all duration-300 hover:scale-105"
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;