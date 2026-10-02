import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, Check, ChevronLeft, ChevronRight, Mail, MapPin, Menu, PackageCheck, Phone, ShieldCheck, Sparkles, Store, Truck, X } from 'lucide-react'
import './App.css'
import { getCategories, getCompanyInfo, getProduct, getProducts, login, submitContact, submitQuote } from './api'

const companyName = 'Vvivers India Pvt Ltd'
const companyAddress = 'C-6 Patparganj Industrial Area, Delhi-110092'
const companyPhone = '+91 98100 00000'
const companyEmail = 'vviversindia@gmail.com'

function useCatalog({ category, featured, sort } = {}) {
    const requestKey = `${category || ''}|${featured ? 'featured' : 'all'}|${sort || ''}`
    const [result, setResult] = useState({ requestKey: '', products: [], error: '' })

    useEffect(() => {
        const controller = new AbortController()
        getProducts({ category, featured, sort, signal: controller.signal })
            .then((products) => setResult({ requestKey, products, error: '' }))
            .catch((catalogError) => {
                if (catalogError.name !== 'AbortError') setResult({ requestKey, products: [], error: catalogError.message })
            })
        return () => controller.abort()
    }, [category, featured, requestKey, sort])

    const currentResult = result.requestKey === requestKey
    return {
        products: currentResult ? result.products : [],
        loading: !currentResult,
        error: currentResult ? result.error : '',
    }
}

function useCategories() {
    const [categories, setCategories] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        const controller = new AbortController()
        getCategories({ signal: controller.signal })
            .then(setCategories)
            .catch((categoryError) => {
                if (categoryError.name !== 'AbortError') setError(categoryError.message)
            })
        return () => controller.abort()
    }, [])

    return { categories, error }
}

function useCompanyInfo() {
    const [company, setCompany] = useState({ name: companyName, address: companyAddress, phone: companyPhone, email: companyEmail })
    useEffect(() => {
        const controller = new AbortController()
        getCompanyInfo({ signal: controller.signal })
            .then((companyInfo) => setCompany({
                name: companyInfo.name || companyName,
                address: companyInfo.address || companyAddress,
                phone: companyInfo.phone || companyPhone,
                email: companyInfo.email || companyEmail,
            }))
            .catch(() => { })
        return () => controller.abort()
    }, [])
    return company
}

function Header() {
    const [open, setOpen] = useState(false)
    return <header className="site-header">
        <Link to="/" className="brand" aria-label={companyName}>
            <img src="/image.png" alt={companyName} className="brand-logo" />
            <span className="brand-copy"><strong>{companyName}</strong></span>
        </Link>
        <nav className={open ? 'nav open' : 'nav'}>
            <Link to="/products" onClick={() => setOpen(false)}>Products</Link>
            <a href="/#categories" onClick={() => setOpen(false)}>Explore categories</a>
            <a href="/#story" onClick={() => setOpen(false)}>About</a>
            <a href="/#contact" onClick={() => setOpen(false)}>Contact</a>
        </nav>
        <div className="header-actions">
            <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </div>
    </header>
}

function ProductCard({ product }) {
    return <Link to={`/products/${product.id}`} className="product-card">
        <div className={`product-image ${product.accent}`}>
            <img src={product.image} alt={product.name} loading="lazy" />
            <span className="quick-add">View details <ArrowRight size={15} /></span>
        </div>
        <div className="product-meta">
            <div><span>{product.category} · {product.size}</span><h3>{product.name}</h3></div>
            <span className="product-quote">Ask for wholesale rate <ArrowRight size={14} /></span>
        </div>
    </Link>
}

function CategoryCard({ category, product }) {
    return <Link className="category-card" to={`/products?category=${encodeURIComponent(category.id)}`}>
        {product && <img src={product.image} alt="" loading="lazy" />}
        <span className="category-card-shade" />
        <span className="category-card-content">
            <small>{category.product_count} products</small>
            <strong>{category.name}</strong>
            <span>Browse category <ArrowRight size={15} /></span>
        </span>
    </Link>
}

function ContactForm() {
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    if (sent) return <p className="contact-success">Thanks. Your message has been received.</p>

    return <form className="contact-form" onSubmit={async (event) => {
        event.preventDefault()
        setError('')
        const form = new FormData(event.currentTarget)
        try {
            await submitContact({
                name: form.get('name'),
                email: form.get('email'),
                phone: form.get('phone'),
                message: form.get('message'),
            })
            setSent(true)
        } catch (contactError) {
            setError(contactError.message)
        }
    }}>
        <h3>Send an enquiry</h3>
        <input name="name" required placeholder="Your name" aria-label="Your name" />
        <input name="email" required type="email" placeholder="Email address" aria-label="Email address" />
        <input name="phone" type="tel" placeholder="Phone number (optional)" aria-label="Phone number (optional)" />
        <textarea name="message" required placeholder="How can we help?" aria-label="How can we help?" rows="3" />
        {error && <small className="form-error">{error}</small>}
        <button className="button primary" type="submit">Send enquiry <ArrowRight size={16} /></button>
    </form>
}

const marketsServed = [
    { name: '', code: 'ca', src: 'https://flagcdn.com/w80/ca.png' },
    { name: '', code: 'au', src: 'https://flagcdn.com/w80/au.png' },
    { name: '', code: 'us', src: 'https://flagcdn.com/w80/us.png' },
    { name: '', code: 'ae', src: 'https://flagcdn.com/w80/ae.png' },
    { name: '', code: 'in', src: 'https://flagcdn.com/w80/in.png' },
]

function Home() {
    const [active, setActive] = useState(0)
    const { products: featured, loading, error } = useCatalog({ featured: true })
    const { products: catalog } = useCatalog()
    const { categories } = useCategories()
    const company = useCompanyInfo()
    const product = featured[active]

    useEffect(() => {
        if (featured.length < 2) return undefined
        const timer = setInterval(() => setActive((current) => (current + 1) % featured.length), 5500)
        return () => clearInterval(timer)
    }, [featured.length])

    return <>
        <main>
            <section className="hero">
                {product && <img key={product.id} className="hero-background" src={product.image} alt={product.name} />}
                <div className="hero-shade" />
                <div className="hero-copy">
                    
                    <h1>Export-ready FMCG solutions.<br /><em>Built for global demand.</em></h1>
                    <p className="hero-text">We supply quality essentials to importers, distributors, retailers, and institutional buyers across Canada, Australia, the USA, UAE and India with dependable bulk sourcing and export support.</p>
                    <div className="hero-ctas">
                        <Link to="/products" className="button primary">Explore the catalog <ArrowRight size={17} /></Link>
                        <a href="#contact" className="hero-contact-link">Request export enquiry</a>
                    </div>
                    <div className="hero-trust"><span>Global export</span><span>Bulk shipments</span><span>Canada • Australia • USA • UAE • India</span></div>
                    {loading && <p className="catalog-message">Loading featured products...</p>}
                    {error && <p className="catalog-message">{error}</p>}
                    {!loading && !error && !product && <p className="catalog-message">No featured products are available yet.</p>}
                </div>
                {product && <div className="hero-product">
                    <div className="hero-caption">
                        <div>
                            <span>Export spotlight · {product.category}</span>
                            <h2>{product.name}</h2>
                            <p>{product.size} · Ready for international procurement</p>
                        </div>
                    </div>
                    {featured.length > 1 && <div className="carousel-controls">
                        <button onClick={() => setActive((active + featured.length - 1) % featured.length)} aria-label="Previous featured product"><ChevronLeft /></button>
                        <span>{String(active + 1).padStart(2, '0')} <i>/</i> {String(featured.length).padStart(2, '0')}</span>
                        <button onClick={() => setActive((active + 1) % featured.length)} aria-label="Next featured product"><ChevronRight /></button>
                    </div>}
                </div>}
            </section>
            <section className="stats">
                <div><strong>1500+</strong><span>FMCG SKUs</span></div>
                <div><strong>5</strong><span>key export markets</span></div>
                <div><strong>Global</strong><span>bulk sourcing</span></div>
                <div className="stats-note"><MapPin size={18} /><span>Canada • Australia • USA • UAE • India</span></div>
            </section>
            <section className="export-section">
                <div className="section-heading">
                    <div><p className="eyebrow">Markets served</p><h2>Exporting with <em>confidence.</em></h2></div>
                    <p>We support international buyers and growing trade networks with dependable product quality, consistent supply, and export-ready coordination.</p>
                </div>
                <div className="market-summary" aria-label="Global footprint summary">
                    <span className="market-summary-label">Global footprint</span>
                    <div className="market-summary-metrics">
                        <strong>5 core markets</strong>
                        <span>1500+ FMCG product lines</span>
                        <span>Export-ready supply</span>
                    </div>
                </div>
                
                <div className="market-flag-visual" aria-label="Countries served by Vvivers">
                    <div className="flag-visual-grid">
                        {marketsServed.map((market) => (
                            <div key={market.name} className="flag-tile">
                                <img src={market.src} alt={`${market.name} flag`} />
                                <span>{market.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="market-grid">
                    <div className="market-card"><span>Canada</span><strong>Retail and wholesale demand</strong><p>Fast-moving essentials for importers and local distribution channels.</p></div>
                    <div className="market-card"><span>Australia</span><strong>Quality-driven sourcing</strong><p>Reliable FMCG supply for retail, horeca, and cross-border trade partners.</p></div>
                    <div className="market-card"><span>USA</span><strong>Market-ready inventory</strong><p>Bulk support for expanding product ranges and multi-channel retail growth.</p></div>
                    <div className="market-card"><span>UAE</span><strong>Regional supply network</strong><p>Responsive product sourcing for trade hubs and strategic market expansion.</p></div>
                    <div className="market-card"><span>India</span><strong>Domestic and export operations</strong><p>Strong procurement support from a base in Delhi for local and international demand.</p></div>
                </div>
            </section>
            <section className="buyer-section">
                <div className="buyer-heading">
                    <div><p className="eyebrow">Who we supply</p><h2>Built for <em>global trade.</em></h2></div>
                    <p>We support importers, wholesalers, distributors, and retailers with reliable sourcing and scalable export-ready product supply.</p>
                </div>
                <div className="buyer-grid">
                    <Link to="/products" className="buyer-item">
                        <Store size={24} />
                        <strong>Retailers</strong>
                        <span>Everyday FMCG essentials for shelves, stores, and customer demand.</span>
                        <small>Browse the range <ArrowRight size={14} /></small>
                    </Link>
                    <Link to="/products" className="buyer-item">
                        <Truck size={24} />
                        <strong>Distributors</strong>
                        <span>High-volume product lines for wholesale networks and regional distribution.</span>
                        <small>Explore product lines <ArrowRight size={14} /></small>
                    </Link>
                    <a href="#contact" className="buyer-item">
                        <Building2 size={24} />
                        <strong>International buyers</strong>
                        <span>Focused export service for importers and partners in major global markets.</span>
                        <small>Talk to our team <ArrowRight size={14} /></small>
                    </a>
                </div>
            </section>
            <section className="section categories-section" id="categories">
                <div className="section-heading">
                    <div><p className="eyebrow">Browse the catalog</p><h2>Explore<br /><em>categories.</em></h2></div>
                    <p>Find the products you need by category.</p>
                </div>
                <div className="category-cards">
                    {categories.map((category) => <CategoryCard
                        key={category.id}
                        category={category}
                        product={catalog.find((item) => item.category_id === category.id)}
                    />)}
                </div>
                {!categories.length && <Link to="/products" className="text-link">View all products <ArrowRight size={17} /></Link>}
            </section>
            <section className="section products-section">
                <div className="section-heading">
                    <div><p className="eyebrow">From our catalog</p><h2>Popular <em>product lines.</em></h2></div>
                    <p>Browse the range and request pricing for the products and quantities you need.</p>
                </div>
                <div className="product-grid">{featured.map((item) => <ProductCard key={item.id} product={item} />)}</div>
                {!loading && !error && !featured.length && <p className="catalog-message">No featured products are available yet.</p>}
                <Link to="/products" className="text-link">Explore all products <ArrowRight size={17} /></Link>
            </section>
            <section className="story-section" id="story">
                <div className="story-image">
                    <img src="https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85" alt="Products prepared for distribution" />
                    <div className="story-badge">
                        <span>Trusted by</span>
                        <strong>Retailers • Distributors • Importers</strong>
                    </div>
                </div>
                <div className="story-copy">
                    <p className="eyebrow">Why Vvivers</p>
                    <h2>Built for <em>serious sourcing.</em></h2>
                    <p>We deliver dependable FMCG supply for businesses that need consistent quality, efficient procurement, and real export support across growing global markets.</p>
                    <div className="story-grid">
                        <div className="story-point">
                            <ShieldCheck size={18} />
                            <div>
                                <strong>Trusted supply</strong>
                                <span>Curated product lines selected for quality and consistency.</span>
                            </div>
                        </div>
                        <div className="story-point">
                            <PackageCheck size={18} />
                            <div>
                                <strong>1500+ SKUs</strong>
                                <span>Broad FMCG coverage for retail, wholesale, and export demand.</span>
                            </div>
                        </div>
                        <div className="story-point">
                            <Truck size={18} />
                            <div>
                                <strong>Export-ready support</strong>
                                <span>Built for shipping, international procurement, and fast response.</span>
                            </div>
                        </div>
                    </div>
                    <Link to="/products" className="text-link">Browse products <ArrowRight size={17} /></Link>
                </div>
            </section>
        </main>
        <footer id="contact">
            <div className="footer-cta">
                <div>
                    <p className="eyebrow">Let’s grow your market reach</p>
                    <h3>Need a dependable FMCG supply partner?</h3>
                </div>
                <div className="footer-cta-actions">
                    <a href="#contact" className="button primary">Request a quote <ArrowRight size={15} /></a>
                    <Link to="/products" className="button dark">Explore catalog</Link>
                </div>
            </div>
            <div className="footer-main">
                <div className="footer-intro">
                    <div className="brand footer-brand"><img src="/image.png" alt={companyName} className="brand-logo" /><span className="brand-copy"><strong>{companyName}</strong><small>Global FMCG export supply</small></span></div>
                    <p>More than 1500+ FMCG items exported and supplied for retailers, importers, and growing demand across global markets.</p>
                </div>
                <div className="footer-column">
                    <h3>Explore</h3><Link to="/products">All products</Link><a href="/#categories">All categories</a><a href="/#story">About Vvivers</a>
                    {categories.slice(0, 6).map((category) => <Link key={category.id} to={`/products?category=${encodeURIComponent(category.id)}`}>{category.name}</Link>)}
                </div>
                <div className="footer-column contact-details">
                    <h3>Contact</h3>
                    <p><MapPin size={15} /> <span>{company.address}</span></p>
                    {company.phone && <a href={`tel:${company.phone.replace(/[^\d+]/g, '')}`}><Phone size={15} /><span><small>Call our team</small>{company.phone}</span></a>}
                    {company.email && <a href={`mailto:${company.email}`}><Mail size={15} /><span><small>Email sales</small>{company.email}</span></a>}
                </div>
                <div className="footer-column"><ContactForm /></div>
            </div>
            <div className="footer-bottom"><span>Copyright {new Date().getFullYear()} {companyName}</span><span>Patparganj Industrial Area, Delhi</span></div>
        </footer>
    </>
}

function Products() {
    const [searchParams, setSearchParams] = useSearchParams()
    const category = searchParams.get('category') || ''
    const [sort, setSort] = useState('default')
    const { products, loading, error } = useCatalog({ category, sort })
    const { categories, error: categoryError } = useCategories()

    return <main className="listing">
        <div className="listing-intro">
            <p className="eyebrow">The collection</p>
            <h1>FMCG products<br /><em>for every shelf.</em></h1>
            <p>Browse the database catalog by product category or sort order.</p>
        </div>
        <div className="catalog-controls">
            <label>Category
                <select value={category} onChange={(event) => {
                    const nextParams = new URLSearchParams(searchParams)
                    if (event.target.value) nextParams.set('category', event.target.value)
                    else nextParams.delete('category')
                    setSearchParams(nextParams)
                }}>
                    <option value="">All categories</option>
                    {categories.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.product_count})</option>)}
                </select>
            </label>
            <label>Sort by
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="default">Featured order</option>
                    <option value="category">Category</option>
                    <option value="name">Name</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                </select>
            </label>
        </div>
        {categoryError && <p className="catalog-message">{categoryError}</p>}
        {error && <p className="catalog-message">{error}</p>}
        {loading && <p className="catalog-message">Loading products...</p>}
        {!loading && !error && !products.length && <p className="catalog-message">No products found for this category.</p>}
        <div className="full-product-grid">{products.map((item) => <ProductCard key={item.id} product={item} />)}</div>
    </main>
}

function ProductDetail() {
    const { id } = useParams()
    const [result, setResult] = useState({ id: '', product: null, error: '' })
    const [sent, setSent] = useState(false)
    const [formError, setFormError] = useState('')

    useEffect(() => {
        const controller = new AbortController()
        getProduct(id, { signal: controller.signal })
            .then((product) => setResult({ id, product, error: '' }))
            .catch((productError) => {
                if (productError.name !== 'AbortError') setResult({ id, product: null, error: productError.message })
            })
        return () => controller.abort()
    }, [id])

    const isCurrent = result.id === id
    const product = isCurrent ? result.product : null
    if (!isCurrent) return <main className="detail"><p className="catalog-message">Loading product...</p></main>
    if (result.error || !product) return <main className="detail"><p className="catalog-message">{result.error || 'Product not found.'}</p><Link to="/products" className="text-link">Back to products</Link></main>

    return <main className="detail">
        <Link to="/products" className="back-link"><ChevronLeft size={17} /> Back to products</Link>
        <div className="detail-layout">
            <div className={`detail-image ${product.accent}`}><img src={product.image} alt={product.name} /></div>
            <div className="detail-copy">
                <p className="eyebrow">{product.category} · {product.size}</p>
                <h1>{product.name}</h1>
                <div className="detail-price">Wholesale pricing available on enquiry</div>
                <p className="detail-description">{product.description}</p>
                <div className="tag-list">{product.tags.map((tag) => <span key={tag}><Check size={14} /> {tag}</span>)}</div>
                <div className="quote-box">
                    <div><p className="eyebrow">For retailers and businesses</p><h2>Need more than one?</h2><p>Tell us what you need and we&apos;ll put together a quote.</p></div>
                    {sent ? <div className="sent-message"><Check /> Thank you. We&apos;ll be in touch shortly.</div> : <form onSubmit={async (event) => {
                        event.preventDefault()
                        setFormError('')
                        const form = new FormData(event.currentTarget)
                        try {
                            await submitQuote({ productId: product.id, name: form.get('name'), email: form.get('email'), notes: form.get('notes') })
                            setSent(true)
                        } catch (submissionError) {
                            setFormError(submissionError.message)
                        }
                    }}>
                        <input name="name" required placeholder="Name" />
                        <input name="email" required type="email" placeholder="Email address" />
                        <input name="notes" placeholder="Quantity / notes" />
                        {formError && <small className="form-error">{formError}</small>}
                        <button className="button primary">Get a quotation <ArrowRight size={16} /></button>
                    </form>}
                </div>
            </div>
        </div>
    </main>
}

function Login() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    return <main className="login-page"><div className="login-panel">
        <p className="eyebrow">Welcome back</p><h1>Your account.</h1>
        <form onSubmit={async (event) => {
            event.preventDefault()
            setError('')
            const form = new FormData(event.currentTarget)
            try {
                const result = await login({ email: form.get('email'), password: form.get('password') })
                localStorage.setItem('vvivers_token', result.token)
                navigate('/')
            } catch (loginError) {
                setError(loginError.message)
            }
        }}>
            <label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label>
            <label>Password<input name="password" type="password" required placeholder="********" /></label>
            {error && <small className="form-error">{error}</small>}
            <button className="button primary">Log in <ArrowRight size={16} /></button>
        </form>
    </div></main>
}

function App() {
    return <BrowserRouter><Header /><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
    </Routes></BrowserRouter>
}

export default App