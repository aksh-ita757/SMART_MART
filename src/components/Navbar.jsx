import { ShoppingBag, ShoppingCart, User, LogOut, Package, Search, Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { selectCartCount } from '../store/cartSlice';
import { selectWishlistCount } from '../store/wishlistSlice';
import { useState } from 'react';

const Navbar = ({ onSearch, transparent = false }) => {
  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value === '' && onSearch) {
      onSearch('');
    }
  };

  // Dynamic classes based on transparent prop
  const navClasses = transparent 
    ? "bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg" 
    : "bg-white shadow-md";
  
  const textClasses = transparent ? "text-white" : "text-gray-900";
  const iconClasses = transparent ? "text-white/90 hover:text-white" : "text-gray-700 hover:text-primary-600";
  const logoClasses = transparent ? "bg-white/20" : "bg-primary-600";
  const userBgClasses = transparent ? "bg-white/20" : "bg-primary-100";
  const userIconClasses = transparent ? "text-white" : "text-primary-600";
  const hoverClasses = transparent ? "hover:bg-white/10" : "hover:bg-gray-100";
  const inputClasses = transparent 
    ? "bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder-white/70 focus:bg-white/30 focus:border-white/50" 
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

  return (
    <nav className={`${navClasses} sticky top-0 z-50 transition-all`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className={`${logoClasses} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className={`text-2xl font-bold ${textClasses}`}>
              Smart<span className={transparent ? "text-yellow-300" : "text-primary-600"}>Mart</span>
            </span>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
              />
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${transparent ? "text-white/70" : "text-gray-400"}`} />
            </div>
          </form>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist Icon */}
            <button
              onClick={() => navigate('/wishlist')}
              className={`relative p-2 transition-all transform hover:scale-110 ${transparent ? "text-white/90 hover:text-pink-300" : "text-gray-700 hover:text-pink-600"}`}
            >
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => navigate('/cart')}
              className={`relative p-2 transition-all transform hover:scale-110 ${iconClasses}`}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${hoverClasses}`}
              >
                <div className={`${userBgClasses} p-2 rounded-full`}>
                  <User className={`w-5 h-5 ${userIconClasses}`} />
                </div>
                <span className={`hidden md:inline font-medium ${textClasses}`}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/orders');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${inputClasses}`}
            />
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${transparent ? "text-white/70" : "text-gray-400"}`} />
          </div>
        </form>
      </div>
    </nav>
  );
};

export default Navbar;