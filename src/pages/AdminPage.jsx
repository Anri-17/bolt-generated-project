import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import AdminProductForm from '../components/AdminProductForm'

export default function AdminPage() {
  const { t } = useLanguage()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('products')
  const [error, setError] = useState(null)

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
    }
  }, [isAdmin, navigate])

  const fetchData = async () => {
    setError(null)
    
    try {
      if (activeTab === 'products') {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setProducts(data || [])
      }
      
      if (activeTab === 'orders') {
        const { data, error } = await supabase
          .from('orders')
          .select('*, profiles(*)')
          .order('created_at', { ascending: false })
        if (error) throw error
        setOrders(data || [])
      }
      
      if (activeTab === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        setUsers(data || [])
      }
    } catch (error) {
      setError(error.message)
    }
  }

  useEffect(() => {
    if (isAdmin()) {
      fetchData()
    }
  }, [activeTab, isAdmin])

  const handleDeleteProduct = async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error) {
      setError(error.message)
    }
  }

  const renderProductsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">{t('manage_products')}</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <AdminProductForm onSave={fetchData} />
      
      <div className="mt-6 space-y-4">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600">${product.price}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="btn-outline-black text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderOrdersTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">{t('orders')}</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-medium">#{order.payment_id}</span>
                <span className="ml-2 text-sm text-gray-600">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">{t('customer_details')}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.profiles?.full_name || order.customer_details.name}</p>
                  <p>{order.profiles?.email || order.customer_details.email}</p>
                  <p>{order.customer_details.phone}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('order_items')}</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderUsersTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">{t('users')}</h2>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{user.full_name || user.email}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{t('admin_panel')}</h1>
      
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-4 ${
            activeTab === 'products' ? 'border-b-2 border-black font-medium' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('products')}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 ${
            activeTab === 'orders' ? 'border-b-2 border-black font-medium' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('orders')}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 px-4 ${
            activeTab === 'users' ? 'border-b-2 border-black font-medium' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('users')}
        </button>
      </div>

      {activeTab === 'products' && renderProductsTab()}
      {activeTab === 'orders' && renderOrdersTab()}
      {activeTab === 'users' && renderUsersTab()}
    </div>
  )
}
