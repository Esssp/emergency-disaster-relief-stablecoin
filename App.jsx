import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Wallet, 
  Activity, 
  Users, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Menu, 
  X, 
  Send, 
  QrCode, 
  MapPin, 
  BarChart3, 
  Lock, 
  RefreshCw,
  Search,
  DollarSign
} from 'lucide-react';

/**
 * MOCK DATA & CONFIGURATION
 * Simulating a blockchain network and database
 */

const CATEGORIES = {
  FOOD: { id: 'cat_food', label: 'Food & Water', color: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
  MEDICAL: { id: 'cat_med', label: 'Medical Aid', color: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-200' },
  SHELTER: { id: 'cat_shelter', label: 'Shelter & Housing', color: 'bg-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-50', border: 'border-orange-200' },
  GENERAL: { id: 'cat_gen', label: 'Unrestricted', color: 'bg-gray-500', text: 'text-gray-700', bgLight: 'bg-gray-50', border: 'border-gray-200' }
};

const INITIAL_USERS = [
  { id: 'admin_1', name: 'Relief Admin (NGO)', role: 'ADMIN', verified: true },
  { id: 'donor_1', name: 'Global Aid Foundation', role: 'DONOR', verified: true },
  { id: 'ben_1', name: 'Maria Garcia', role: 'BENEFICIARY', verified: true, location: 'Zone A', kycStatus: 'Whitelisted' },
  { id: 'ben_2', name: 'Ahmed Khan', role: 'BENEFICIARY', verified: true, location: 'Zone B', kycStatus: 'Whitelisted' },
  { id: 'merch_1', name: 'Central Pharmacy', role: 'MERCHANT', category: 'MEDICAL', verified: true, location: 'Zone A' },
  { id: 'merch_2', name: 'Fresh Mart Grocery', role: 'MERCHANT', category: 'FOOD', verified: true, location: 'Zone A' },
  { id: 'merch_3', name: 'SafeStay Supplies', role: 'MERCHANT', category: 'SHELTER', verified: true, location: 'Zone B' },
  { id: 'merch_4', name: 'Unauthorized Vendor', role: 'MERCHANT', category: 'GENERAL', verified: false, location: 'Zone A' }, // For testing blocks
];

const INITIAL_WALLETS = {
  'ben_1': { [CATEGORIES.FOOD.id]: 150, [CATEGORIES.MEDICAL.id]: 50, [CATEGORIES.SHELTER.id]: 0, [CATEGORIES.GENERAL.id]: 10 },
  'ben_2': { [CATEGORIES.FOOD.id]: 75, [CATEGORIES.MEDICAL.id]: 200, [CATEGORIES.SHELTER.id]: 500, [CATEGORIES.GENERAL.id]: 0 },
  'donor_1': { [CATEGORIES.GENERAL.id]: 5000000 },
  'merch_1': { [CATEGORIES.GENERAL.id]: 0 },
  'merch_2': { [CATEGORIES.GENERAL.id]: 0 },
  'merch_3': { [CATEGORIES.GENERAL.id]: 0 },
  'merch_4': { [CATEGORIES.GENERAL.id]: 0 },
};

const INITIAL_CAMPAIGNS = [
  { id: 'camp_1', name: 'Hurricane Relief 2024', location: 'Coastal Region', target: 1000000, raised: 750000, active: true },
  { id: 'camp_2', name: 'Earthquake Recovery', location: 'Highland Zone', target: 5000000, raised: 1200000, active: true },
];

/**
 * UTILITY FUNCTIONS
 */
const generateHash = () => '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

/**
 * MAIN COMPONENT
 */
export default function ReliefChainApp() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [wallets, setWallets] = useState(INITIAL_WALLETS);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Simulation State
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCategory, setPaymentCategory] = useState(CATEGORIES.FOOD.id);
  const [processing, setProcessing] = useState(false);

  // --- ACTIONS ---

  const addNotification = (msg, type = 'info') => {
    const newNotif = { id: Date.now(), msg, type };
    setNotifications(prev => [newNotif, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 4000);
  };

  const recordTransaction = (from, to, amount, category, status, details = '') => {
    const newTx = {
      hash: generateHash(),
      timestamp: new Date().toISOString(),
      fromName: users.find(u => u.id === from)?.name || 'System',
      toName: users.find(u => u.id === to)?.name || 'System',
      amount,
      category,
      status,
      details
    };
    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  // SMART CONTRACT LOGIC SIMULATION
  const executeTransaction = (senderId, receiverId, amount, categoryId) => {
    setProcessing(true);
    
    setTimeout(() => {
      const senderWallet = wallets[senderId];
      const receiver = users.find(u => u.id === receiverId);
      const amountNum = parseFloat(amount);

      // Rule 1: Check Funds
      if (senderWallet[categoryId] < amountNum) {
        recordTransaction(senderId, receiverId, amountNum, categoryId, 'FAILED', 'Insufficient Funds in Category');
        addNotification('Transaction Failed: Insufficient funds in this category.', 'error');
        setProcessing(false);
        return;
      }

      // Rule 2: Check Merchant Authorization (Only for beneficiaries spending)
      if (currentUser.role === 'BENEFICIARY') {
        if (!receiver || receiver.role !== 'MERCHANT') {
          recordTransaction(senderId, receiverId, amountNum, categoryId, 'FAILED', 'Invalid Receiver');
          addNotification('Transaction Failed: Receiver is not a merchant.', 'error');
          setProcessing(false);
          return;
        }

        // Rule 3: Category Enforcement
        // If merchant has a specific category, user MUST use funds from that category or General.
        // User cannot use FOOD funds at a MEDICAL merchant.
        if (receiver.category !== categoryId && categoryId !== CATEGORIES.GENERAL.id) {
           recordTransaction(senderId, receiverId, amountNum, categoryId, 'FAILED', `Category Mismatch: Merchant is ${receiver.category}`);
           addNotification(`Transaction Blocked: Cannot spend ${CATEGORIES[Object.keys(CATEGORIES).find(k => CATEGORIES[k].id === categoryId)].label} funds at a ${receiver.category} merchant.`, 'error');
           setProcessing(false);
           return;
        }

        // Rule 4: Whitelist Check
        if (!receiver.verified) {
           recordTransaction(senderId, receiverId, amountNum, categoryId, 'FAILED', 'Merchant Not Verified');
           addNotification('Transaction Blocked: Merchant is not on the whitelist.', 'error');
           setProcessing(false);
           return;
        }
      }

      // EXECUTE TRANSFER
      setWallets(prev => ({
        ...prev,
        [senderId]: { ...prev[senderId], [categoryId]: prev[senderId][categoryId] - amountNum },
        [receiverId]: { ...prev[receiverId], [CATEGORIES.GENERAL.id]: (prev[receiverId][CATEGORIES.GENERAL.id] || 0) + amountNum } // Merchants always receive liquid GENERAL funds
      }));

      recordTransaction(senderId, receiverId, amountNum, categoryId, 'SUCCESS', 'Smart Contract Verified');
      addNotification(`Successfully sent ${formatCurrency(amountNum)} to ${receiver.name}`, 'success');
      setProcessing(false);
      setPaymentAmount('');
    }, 1500); // Simulate network delay
  };

  const handleAdminAllocation = (beneficiaryId, amount, categoryId) => {
    setProcessing(true);
    setTimeout(() => {
        setWallets(prev => ({
            ...prev,
            [beneficiaryId]: { ...prev[beneficiaryId], [categoryId]: (prev[beneficiaryId][categoryId] || 0) + parseFloat(amount) }
        }));
        recordTransaction('admin_1', beneficiaryId, parseFloat(amount), categoryId, 'SUCCESS', 'Relief Allocation');
        addNotification(`Allocated ${formatCurrency(amount)} to beneficiary.`, 'success');
        setProcessing(false);
    }, 1000);
  };

  // --- VIEWS ---

  const AdminView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Relief Issued</p>
              <h3 className="text-2xl font-bold text-gray-900">$2,450,000</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg"><Activity className="w-5 h-5 text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Active Beneficiaries</p>
              <h3 className="text-2xl font-bold text-gray-900">12,543</h3>
            </div>
            <div className="p-2 bg-green-100 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Smart Contracts Active</p>
              <h3 className="text-2xl font-bold text-gray-900">4</h3>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg"><Lock className="w-5 h-5 text-purple-600" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Send className="w-4 h-4" /> Fund Allocation
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Beneficiary</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg bg-white" id="allocBen">
                {users.filter(u => u.role === 'BENEFICIARY').map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.location})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg bg-white" id="allocCat">
                        {Object.values(CATEGORIES).map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="number" className="w-full p-2 border border-gray-300 rounded-lg" id="allocAmount" placeholder="0.00" />
                </div>
            </div>
            <button 
                onClick={() => {
                    const ben = document.getElementById('allocBen').value;
                    const cat = document.getElementById('allocCat').value;
                    const amt = document.getElementById('allocAmount').value;
                    if(amt > 0) handleAdminAllocation(ben, amt, cat);
                }}
                disabled={processing}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
                {processing ? 'Processing on Chain...' : 'Deploy Funds via Smart Contract'}
            </button>
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Beneficiary Whitelist
            </h3>
          </div>
          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Region</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.filter(u => u.role === 'BENEFICIARY').map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">{user.name}</td>
                        <td className="px-5 py-3 text-gray-500">{user.location}</td>
                        <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3" /> Whitelisted
                            </span>
                        </td>
                        <td className="px-5 py-3 text-blue-600 hover:underline cursor-pointer">Details</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const BeneficiaryView = () => {
    const myWallet = wallets[currentUser.id];
    const totalBalance = Object.values(myWallet).reduce((a, b) => a + b, 0);

    return (
      <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-200 text-sm font-medium">Total Relief Balance</p>
              <h2 className="text-4xl font-bold mt-1">{formatCurrency(totalBalance)}</h2>
            </div>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} alt="avatar" className="w-10 h-10 rounded-full bg-white/20 p-1" />
          </div>
          <div className="flex gap-2 text-xs bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Shield className="w-4 h-4 text-green-300" />
            <span>Identity Verified • Whitelisted • Zone A</span>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3">
            {Object.values(CATEGORIES).filter(c => c.id !== 'cat_gen').map(cat => (
                <div key={cat.id} className={`p-4 rounded-xl border ${cat.border} ${cat.bgLight} relative overflow-hidden group transition-all`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white ${cat.text}`}>{cat.label}</span>
                        <Lock className={`w-4 h-4 ${cat.text} opacity-50`} />
                    </div>
                    <p className={`text-2xl font-bold ${cat.text}`}>{formatCurrency(myWallet[cat.id] || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Restricted use only</p>
                </div>
            ))}
        </div>

        {/* Action Button */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" /> Make a Payment
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Select Merchant</label>
                    <select 
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50"
                        value={selectedMerchant}
                        onChange={(e) => setSelectedMerchant(e.target.value)}
                    >
                        <option value="">-- Scan QR Code / Select --</option>
                        {users.filter(u => u.role === 'MERCHANT').map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.category} - {m.verified ? 'Verified' : 'Unverified'})</option>
                        ))}
                    </select>
                </div>

                {selectedMerchant && (
                    <div className="p-3 bg-gray-50 rounded-lg text-sm flex gap-2 items-center">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span>Merchant Category: <strong>{users.find(u => u.id === selectedMerchant)?.category}</strong></span>
                    </div>
                )}

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input 
                            type="number" 
                            className="w-full p-3 pl-7 border border-gray-200 rounded-xl"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Pay From Pocket</label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {Object.values(CATEGORIES).filter(c => c.id !== 'cat_gen').map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setPaymentCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    paymentCategory === cat.id 
                                    ? `${cat.color} text-white shadow-md` 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all flex justify-center items-center gap-2"
                    disabled={!selectedMerchant || !paymentAmount || processing}
                    onClick={() => executeTransaction(currentUser.id, selectedMerchant, paymentAmount, paymentCategory)}
                >
                    {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                </button>
            </div>
        </div>

        {/* Transaction History Miniature */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-3">
                {transactions.filter(t => t.fromName === currentUser.name || t.toName === currentUser.name).slice(0, 3).map((tx) => (
                    <div key={tx.hash} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${tx.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {tx.status === 'SUCCESS' ? <CheckCircle className="w-3 h-3 text-green-600" /> : <X className="w-3 h-3 text-red-600" />}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{tx.toName === currentUser.name ? `Received from ${tx.fromName}` : `Paid to ${tx.toName}`}</p>
                                <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <span className={`font-bold ${tx.toName === currentUser.name ? 'text-green-600' : 'text-gray-900'}`}>
                            {tx.toName === currentUser.name ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                    </div>
                ))}
                {transactions.filter(t => t.fromName === currentUser.name || t.toName === currentUser.name).length === 0 && (
                    <p className="text-gray-400 text-center text-sm italic">No recent transactions</p>
                )}
            </div>
        </div>
      </div>
    );
  };

  const DonorView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Transparency Dashboard</h2>
                <p className="text-indigo-200 max-w-2xl">Track every cent of your donation in real-time on the blockchain. See exactly which beneficiaries received aid and where it was spent.</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-indigo-300 text-sm mb-1">Total Donated</p>
                        <p className="text-3xl font-bold">$5,000,000</p>
                    </div>
                    <div>
                        <p className="text-indigo-300 text-sm mb-1">Impact Verified</p>
                        <p className="text-3xl font-bold">98.2%</p>
                    </div>
                    <div>
                        <p className="text-indigo-300 text-sm mb-1">Beneficiaries</p>
                        <p className="text-3xl font-bold">12k+</p>
                    </div>
                </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" /> Active Campaigns
                </h3>
                <div className="space-y-4">
                    {INITIAL_CAMPAIGNS.map(camp => (
                        <div key={camp.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900">{camp.name}</h4>
                                    <p className="text-sm text-gray-500">{camp.location}</p>
                                </div>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Active</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(camp.raised/camp.target)*100}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Raised: {formatCurrency(camp.raised)}</span>
                                <span>Goal: {formatCurrency(camp.target)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" /> Fund Utilization
                </h3>
                <div className="space-y-4">
                    {Object.values(CATEGORIES).filter(c => c.id !== 'cat_gen').map(cat => (
                        <div key={cat.id}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{cat.label}</span>
                                <span className="font-medium text-gray-900">32%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className={`h-2 rounded-full ${cat.color}`} style={{ width: '32%' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
                    <p className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Audited by Smart Contract v2.1
                    </p>
                </div>
            </div>
        </div>
    </div>
  );

  const MerchantView = () => (
    <div className="max-w-md mx-auto space-y-6 animate-in slide-in-from-right-8 duration-500">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{currentUser.name}</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                currentUser.category === 'MEDICAL' ? 'bg-blue-100 text-blue-700' :
                currentUser.category === 'FOOD' ? 'bg-green-100 text-green-700' :
                currentUser.category === 'SHELTER' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
            }`}>
                Authorized: {currentUser.category}
            </span>
            
            <div className="bg-gray-900 p-6 rounded-xl text-white mb-4 flex flex-col items-center justify-center aspect-square">
                <QrCode className="w-32 h-32 mb-4" />
                <p className="text-sm text-gray-400">Scan to Pay</p>
            </div>
            
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                <span className="text-gray-500">Wallet Balance</span>
                <span className="font-bold text-gray-900">{formatCurrency(wallets[currentUser.id]?.[CATEGORIES.GENERAL.id] || 0)}</span>
            </div>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-semibold text-gray-900 text-sm">Recent Incoming Payments</h3>
             </div>
             <div className="divide-y divide-gray-100">
                {transactions.filter(t => t.toName === currentUser.name).length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No transactions yet</div>
                ) : (
                    transactions.filter(t => t.toName === currentUser.name).map(tx => (
                        <div key={tx.hash} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{tx.fromName}</p>
                                <p className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <span className="font-bold text-green-600">+{formatCurrency(tx.amount)}</span>
                        </div>
                    ))
                )}
             </div>
         </div>
    </div>
  );

  const BlockchainExplorer = () => (
    <div className="bg-slate-900 text-slate-300 rounded-xl overflow-hidden shadow-2xl border border-slate-700 font-mono text-sm animate-in fade-in duration-500">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" /> Live Ledger
            </h3>
            <span className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Network Live
            </span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-700">
                    <tr>
                        <th className="p-4">Tx Hash</th>
                        <th className="p-4">From</th>
                        <th className="p-4">To</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {transactions.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-slate-600">Waiting for blocks...</td></tr>
                    ) : (
                        transactions.map((tx) => (
                            <tr key={tx.hash} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 text-blue-400 truncate max-w-[100px]" title={tx.hash}>{tx.hash.substring(0, 10)}...</td>
                                <td className="p-4">{tx.fromName}</td>
                                <td className="p-4">{tx.toName}</td>
                                <td className="p-4 text-white font-medium">{formatCurrency(tx.amount)}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                                        tx.category === CATEGORIES.MEDICAL.id ? 'border-blue-900 bg-blue-900/20 text-blue-400' :
                                        tx.category === CATEGORIES.FOOD.id ? 'border-emerald-900 bg-emerald-900/20 text-emerald-400' :
                                        'border-gray-700 bg-gray-800 text-gray-400'
                                    }`}>
                                        {Object.values(CATEGORIES).find(c => c.id === tx.category)?.label.split(' ')[0]}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-1 ${tx.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.status === 'SUCCESS' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      {/* --- DEV TOOL: ROLE SWITCHER --- */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-slate-900 text-white z-50 flex items-center justify-between px-4 shadow-md">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Shield className="w-4 h-4 text-white" /></div>
            <span className="font-bold tracking-tight">ReliefChain</span>
        </div>
        
        <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 uppercase tracking-widest hidden sm:inline-block">Simulate Role:</span>
            <select 
                className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentUser.id}
                onChange={(e) => {
                    const user = users.find(u => u.id === e.target.value);
                    setCurrentUser(user);
                    setActiveTab('dashboard'); // Reset view on switch
                    addNotification(`Switched to ${user.name} (${user.role})`);
                }}
            >
                {users.map(u => (
                    <option key={u.id} value={u.id}>
                        {u.role === 'BENEFICIARY' ? `👤 ${u.name} (Beneficiary)` : 
                         u.role === 'MERCHANT' ? `🏪 ${u.name} (Merchant)` : 
                         u.role === 'ADMIN' ? `🛡️ ${u.name} (Admin)` : `🤝 ${u.name} (Donor)`}
                    </option>
                ))}
            </select>
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
                <div className="flex items-center gap-3 mb-6 p-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                        {currentUser.role === 'ADMIN' ? '🛡️' : currentUser.role === 'MERCHANT' ? '🏪' : currentUser.role === 'DONOR' ? '🤝' : '👤'}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 leading-tight">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{currentUser.role} Account</p>
                    </div>
                </div>
                
                <nav className="space-y-1">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Wallet className="w-4 h-4" /> Dashboard
                    </button>
                    {currentUser.role === 'ADMIN' && (
                        <button 
                            onClick={() => setActiveTab('ledger')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ledger' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <Activity className="w-4 h-4" /> Blockchain Explorer
                        </button>
                    )}
                    {currentUser.role === 'DONOR' && (
                         <button 
                         onClick={() => setActiveTab('ledger')}
                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ledger' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                     >
                         <Search className="w-4 h-4" /> Audit Ledger
                     </button>
                    )}
                </nav>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">System Status</h4>
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Mainnet Online
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" /> Latency: 12ms
                    </div>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="lg:col-span-9">
            {/* Notifications Overlay */}
            <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className={`pointer-events-auto p-4 rounded-lg shadow-lg max-w-sm animate-in slide-in-from-right duration-300 border-l-4 ${
                        n.type === 'error' ? 'bg-white border-red-500 text-gray-800' : 
                        n.type === 'success' ? 'bg-white border-green-500 text-gray-800' : 'bg-white border-blue-500 text-gray-800'
                    }`}>
                        <div className="flex gap-3">
                            {n.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0" /> : 
                             n.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> : <Activity className="w-5 h-5 text-blue-500 shrink-0" />}
                            <p className="text-sm font-medium">{n.msg}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Router */}
            {activeTab === 'ledger' ? (
                <BlockchainExplorer />
            ) : (
                <>
                    {currentUser.role === 'ADMIN' && <AdminView />}
                    {currentUser.role === 'BENEFICIARY' && <BeneficiaryView />}
                    {currentUser.role === 'MERCHANT' && <MerchantView />}
                    {currentUser.role === 'DONOR' && <DonorView />}
                </>
            )}

            {/* If not in ledger view, show a teaser of the ledger at bottom for everyone */}
            {activeTab !== 'ledger' && (
                <div className="mt-8 opacity-70 hover:opacity-100 transition-opacity">
                    <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Public Ledger Preview</h4>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-400 overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-2 bg-slate-900/90">
                            <button onClick={() => setActiveTab('ledger')} className="text-blue-400 hover:text-blue-300 underline">View Full Explorer</button>
                         </div>
                         {transactions.slice(0, 2).map(tx => (
                             <div key={tx.hash} className="mb-2 border-b border-slate-800 pb-2 last:border-0">
                                 <span className="text-purple-400">{tx.hash.substring(0, 12)}...</span> <span className="text-slate-500">➡</span> {tx.fromName} sent {formatCurrency(tx.amount)} to {tx.toName} <span className={`ml-2 ${tx.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>[{tx.status}]</span>
                             </div>
                         ))}
                         {transactions.length === 0 && <div>No blocks mined yet.</div>}
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
