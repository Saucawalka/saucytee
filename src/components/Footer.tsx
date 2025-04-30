

const Footer = () => {
  return (
    <div>
        <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
  <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
    {/* Column 1 */}
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Saucytee</h3>
      <p>Innovative cars and tech accessories tailored to your lifestyle.</p>
    </div>

    {/* Column 2 */}
    <div>
      <h4 className="font-semibold text-white mb-4">Quick Links</h4>
      <ul className="space-y-2">
        <li><a href="/" className="hover:text-indigo-400">Home</a></li>
        <li><a href="/products" className="hover:text-indigo-400">Products</a></li>
        <li><a href="/about" className="hover:text-indigo-400">About Us</a></li>
        <li><a href="/contact" className="hover:text-indigo-400">Contact</a></li>
      </ul>
    </div>

    {/* Column 3 */}
    <div>
      <h4 className="font-semibold text-white mb-4">Support</h4>
      <ul className="space-y-2">
        <li><a href="/help" className="hover:text-indigo-400">Help Center</a></li>
        <li><a href="/privacy" className="hover:text-indigo-400">Privacy Policy</a></li>
        <li><a href="/terms" className="hover:text-indigo-400">Terms & Conditions</a></li>
      </ul>
    </div>
  </div>

  <div className="text-center mt-10 text-sm border-t border-gray-700 pt-6">
    &copy; {new Date().getFullYear()} Saucytee Co. All rights reserved.
  </div>
</footer>

    </div>
  )
}

export default Footer