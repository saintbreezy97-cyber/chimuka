import { useState, useEffect } from 'react'

const defaultProducts = [
  { id:1, name:"Sample Product", price:2.5, cat:"General", img:"📦" },
]

export default function App() {
  const [shopName, setShopName] = useState(localStorage.getItem('shopName') || 'My Shop')
  const [products, setProducts] = useState(()=> JSON.parse(localStorage.getItem('products') || 'null') || defaultProducts)
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const [form, setForm] = useState({name:'', price:'', cat:'', img:'🛒'})

  useEffect(()=>{
    localStorage.setItem('products', JSON.stringify(products))
  },[products])
  useEffect(()=>{
    localStorage.setItem('shopName', shopName)
  },[shopName])

  const addProduct = () => {
    if(!form.name ||!form.price) return alert('Enter name & price')
    setProducts([...products, {id:Date.now(), name:form.name, price:parseFloat(form.price), cat:form.cat || 'General', img:form.img}])
    setForm({name:'', price:'', cat:'', img:'🛒'})
  }
  const delProduct = (id) => setProducts(products.filter(p=>p.id!==id))

  const filtered = products.filter(p=> p.name.toLowerCase().includes(search.toLowerCase()))

  const total = cart.reduce((s,i)=>s+i.price,0)

  return (
    <div style={{fontFamily:'Arial', maxWidth:1000, margin:'auto', padding:20}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{color:'#16a34a'}}>🛒 {shopName}</h1>
        <button onClick={()=>setIsAdmin(!isAdmin)} style={{padding:'8px 12px', borderRadius:6, border:'1px solid #ccc'}}>
          {isAdmin? 'Exit Seller Mode' : 'Seller Mode'}
        </button>
      </div>

      {isAdmin && (
        <div style={{background:'#f0fdf4', border:'1px solid #16a34a', padding:15, borderRadius:10, margin:'15px 0'}}>
          <h3>Seller Dashboard - Update Your Shop</h3>
          <input value={shopName} onChange={e=>setShopName(e.target.value)} placeholder="Shop Name" style={{padding:8, margin:5, width:'90%'}} />
          <div style={{display:'flex', gap:5, flexWrap:'wrap', marginTop:10}}>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Product Name (e.g. Kapenta 1kg)" style={{padding:8}} />
            <input value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Price $" type="number" style={{padding:8, width:80}} />
            <input value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})} placeholder="Category" style={{padding:8, width:100}} />
            <input value={form.img} onChange={e=>setForm({...form,img:e.target.value})} placeholder="Emoji" style={{padding:8, width:50}} />
            <button onClick={addProduct} style={{background:'#16a34a', color:'white', border:'none', padding:'8px 15px', borderRadius:5}}>Add Product</button>
          </div>
          <p style={{fontSize:12, color:'#666'}}>Tip: Use emojis like 🍅 🍞 🥛 for images. Easy for any seller!</p>
        </div>
      )}

      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." style={{padding:10, width:'100%', borderRadius:8, border:'1px solid #ccc', marginBottom:15}} />

      <p>Cart: {cart.length} items - Total: ${total.toFixed(2)}</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:15}}>
        {filtered.map(p=>(
          <div key={p.id} style={{border:'1px solid #ddd', padding:15, borderRadius:10, textAlign:'center', position:'relative'}}>
            <div style={{fontSize:40}}>{p.img}</div>
            <h4>{p.name}</h4>
            <p>{p.cat} - ${p.price}</p>
            <button onClick={()=>setCart([...cart,p])} style={{background:'#16a34a', color:'white', border:'none', padding:'8px 15px', borderRadius:5, cursor:'pointer'}}>Add to Cart</button>
            {isAdmin && <button onClick={()=>delProduct(p.id)} style={{background:'#ef4444', color:'white', border:'none', padding:'4px 8px', borderRadius:5, marginLeft:5}}>X</button>}
          </div>
        ))}
      </div>

      {cart.length>0 && <button onClick={()=>{alert(`Order placed! Total $${total}`); setCart([])}} style={{marginTop:20, background:'black', color:'white', padding:12, width:'100%', borderRadius:8}}>Checkout ${total.toFixed(2)}</button>}
    </div>
  )
}