import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, Upload, Download, DollarSign, TrendingUp, TrendingDown, Calendar, 
  BarChart3, PieChart, Moon, Sun, Search, Filter, AlertTriangle, Eye, Target, 
  CreditCard, Wallet, Lock, User, ChevronDown, RefreshCw, Check, X, Loader, Bell,
  CheckCircle, Home, Settings, LogOut
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, 
  AreaChart, Area, ComposedChart, Scatter
} from 'recharts';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [unmatchedTransactions, setUnmatchedTransactions] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    reason: '',
    category: 'Food',
    type: 'expense'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [isSignup, setIsSignup] = useState(false);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [reports, setReports] = useState([]);
  
  const userDropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize unmatched transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const unmatched = transactions.filter(t => !t.matched);
      setUnmatchedTransactions(unmatched);
    }
  }, [transactions]);

  // Login function
const handleLogin = async () => {
  setIsLoading(true);
  try {
    // Check for sample credentials first
    if (loginForm.email === 'test@example.com' && loginForm.password === 'password123') {
      setIsLoggedIn(true);
      setUser({ 
        name: 'Test User', 
        email: 'test@example.com',
        isDemo: true // Add this flag
      });
      // Load sample transactions
      setTransactions([
        {
          id: 1,
          date: new Date().toISOString().split('T')[0],
          amount: '150.00',
          reason: 'Grocery shopping',
          category: 'Food',
          type: 'expense',
          matched: true
        },
        {
          id: 2,
          date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
          amount: '2000.00',
          reason: 'Monthly salary',
          category: 'Income',
          type: 'income',
          matched: false
        }
      ]);
      return;
    }
    // Otherwise proceed with normal login
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginForm.email,
        password: loginForm.password
      }),
    });
    
      
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setUser({ name: data.name, email: loginForm.email });
        fetchTransactions();
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setIsLoggedIn(true);
        setUser({ name: signupForm.name, email: signupForm.email });
        setIsSignup(false);
        fetchTransactions();
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setTransactions([]);
    setShowUserDropdown(false);
  };

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/api/summary');
      const data = await response.json();
      setTransactions(data);
      
      // After fetching transactions, check for matches
      checkBankMatches(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for matches between transactions and bank records
  const checkBankMatches = (transactions) => {
    const unmatched = [];
    const discrepancies = [];
    
    transactions.forEach(transaction => {
      const bankMatch = bankTransactions.find(
        bank => 
          bank.date === transaction.date &&
          parseFloat(bank.amount) === parseFloat(transaction.amount) &&
          bank.type === transaction.type
      );
      
      if (!bankMatch) {
        unmatched.push(transaction);
      }
      
      // Check for amount discrepancies
      const bankRecord = bankTransactions.find(
        bank => 
          bank.date === transaction.date &&
          bank.reason === transaction.reason &&
          bank.type === transaction.type
      );
      
      if (bankRecord && parseFloat(bankRecord.amount) !== parseFloat(transaction.amount)) {
        discrepancies.push({
          ...transaction,
          bankAmount: bankRecord.amount
        });
      }
    });
    
    setUnmatchedTransactions(unmatched);
    setDiscrepancies(discrepancies);
  };

  // Add new transaction
  const addTransaction = async () => {
  if (!newTransaction.amount || !newTransaction.reason) {
    alert('Please fill in all fields');
    return;
  }
  
  setIsLoading(true);
  
  try {
    // If using sample credentials (demo mode)
    if (user?.email === 'test@example.com') {
      // Create a new transaction object with a random ID
      const sampleTransaction = {
        id: Math.floor(Math.random() * 10000), // Generate random ID
        date: newTransaction.date,
        amount: newTransaction.amount,
        reason: newTransaction.reason,
        category: newTransaction.category,
        type: newTransaction.type,
        matched: false // Default to unmatched in sample mode
      };
      
      // Add to local state
      setTransactions([...transactions, sampleTransaction]);
      
      // Reset form
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        reason: '',
        category: 'Food',
        type: 'expense'
      });
      
      alert('Transaction added successfully (demo mode)!');
      return;
    }
    
    // Otherwise proceed with normal API call
    const response = await fetch('http://localhost:5000/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTransaction),
    });
    
    if (response.ok) {
      // Reset form
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        reason: '',
        category: 'Food',
        type: 'expense'
      });
      
      // Refresh transactions
      await fetchTransactions();
      alert('Transaction added successfully!');
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Failed to add transaction');
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    alert('Error adding transaction: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};
  // Upload CSV file
  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setBankTransactions(result.bankTransactions || []);
        
        // Refresh transactions to check for matches
        await fetchTransactions();
        alert('Bank statement processed successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  // Calculate summary statistics
  const getSummary = () => {
    const periodTransactions = filterTransactionsByPeriod(transactions, period);
    const income = periodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    const expenses = periodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    return { income, expenses, balance: income - expenses };
  };

  // Filter transactions by selected period
  const filterTransactionsByPeriod = (transactions, period) => {
    const now = new Date();
    
    switch(period) {
      case 'day':
        return transactions.filter(t => new Date(t.date).toDateString() === now.toDateString());
      case 'week': {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return transactions.filter(t => new Date(t.date) >= oneWeekAgo);
      }
      case 'month':
        return transactions.filter(t => {
          const transDate = new Date(t.date);
          return transDate.getMonth() === now.getMonth() && transDate.getFullYear() === now.getFullYear();
        });
      case 'year':
        return transactions.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
      default:
        return transactions;
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = filterTransactionsByPeriod(transactions, period).filter(transaction => {
    const matchesSearch = transaction.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         transaction.amount?.toString().includes(searchTerm) ||
                         transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Prepare chart data
  const getChartData = () => {
    const monthlyData = {};
    transactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += parseFloat(t.amount || 0);
      } else {
        monthlyData[month].expenses += parseFloat(t.amount || 0);
      }
    });
    return Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const getPieChartData = () => {
    const expenseCategories = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const category = t.category || 'Other';
      expenseCategories[category] = (expenseCategories[category] || 0) + parseFloat(t.amount || 0);
    });
    return Object.entries(expenseCategories).map(([name, value]) => ({ name, value }));
  };

  // Generate report
  const generateReport = () => {
    const summary = getSummary();
    const report = {
      id: reports.length + 1,
      date: new Date().toLocaleDateString(),
      period,
      income: summary.income,
      expenses: summary.expenses,
      balance: summary.balance,
      topCategories: getPieChartData().slice(0, 3).map(c => c.name)
    };
    setReports([...reports, report]);
    return report;
  };

  // Download report
  const downloadReport = (report) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(report, null, 2))}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `finance_report_${report.date.replace(/\//g, '-')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Mark transaction as matched
  const markAsMatched = async (id) => {
    try {
      setIsLoading(true);
      
      // Update transaction on the backend
      const response = await fetch(`http://localhost:5000/api/transactions/${id}/match`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matched: true }),
      });
      
      if (response.ok) {
        // Update local state
        setTransactions(transactions.map(t => 
          t.id === id ? { ...t, matched: true } : t
        ));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to mark as matched');
      }
    } catch (error) {
      console.error('Error marking as matched:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = getSummary();
  const chartData = getChartData();
  const pieData = getPieChartData();
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'}`}>
        <div className={`w-full max-w-md p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">FinanceFlow</h2>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Secure Household Finance Management</p>
        </div>
        
        {isSignup ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                    darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                  }`}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                    darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                    darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader className="animate-spin" /> : <Lock className="w-5 h-5" />}
              <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
            </button>
            
            <div className="text-center mt-4">
              <button 
                onClick={() => setIsSignup(false)}
                className={`text-sm font-medium ${darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-800'}`}
              >
                Already have an account? Sign in
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                    darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                    darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader className="animate-spin" /> : <Lock className="w-5 h-5" />}
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>
            
            <div className="text-center mt-4">
              <button 
                 onClick={() => setIsSignup(true)}
    className={`text-sm font-medium ${darkMode ? 'text-violet-400 hover:text-violet-300' : 'text-violet-600 hover:text-violet-800'}`}
  >
    Don't have an account? Sign up
              </button>
              {!isSignup && (
                <div className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Sample credentials for testing:<br/>
                  Email: test@example.com<br/>
                  Password: password123
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'}`}>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader className="animate-spin w-12 h-12 text-violet-500 mb-4" />
            <p className="text-lg font-medium">Processing your request...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`relative z-50 backdrop-blur-xl border-b ${darkMode ? 'bg-black/20 border-white/10' : 'bg-white/70 border-gray-200/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  FinanceFlow
                </h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Smart Money Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                {transactions.length} transactions
              </div>
              
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-white/80'} shadow-lg relative`}
                >
                  <Bell className="w-5 h-5" />
                  {discrepancies.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">{discrepancies.length}</span>
                    </div>
                  )}
                </button>
                
                {showNotifications && (
                  <div className={`absolute right-0 top-12 w-80 rounded-xl shadow-2xl z-50 overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <h3 className="font-bold flex items-center">
                        <Bell className="w-4 h-4 mr-2" /> Notifications
                      </h3>
                    </div>
                    
                    {discrepancies.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto">
                        {discrepancies.map((d, i) => (
                          <div key={i} className={`p-4 border-b ${darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div className="flex items-start">
                              <div className="mr-3 mt-1">
                                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                              </div>
                              <div>
                                <h4 className="font-medium">Discrepancy Found</h4>
                                <p className="text-sm mt-1">
                                  {d.reason}: ${d.amount} vs Bank: ${d.bankAmount}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{d.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="text-gray-500 mb-4">No new notifications</div>
                        <div className="text-xs text-gray-500">You're all caught up!</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 ${darkMode ? 'hover:bg-white/10 bg-white/5' : 'hover:bg-gray-100 bg-white/80'} shadow-lg`}
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-600" />}
              </button>
              
              <div className="relative" ref={userDropdownRef}>
                <button 
                  className="flex items-center space-x-2"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <span className="font-medium">{user?.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showUserDropdown && (
                  <div className={`absolute right-0 top-10 w-48 rounded-xl shadow-2xl z-50 overflow-hidden ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}`}>
                    <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <div className="font-medium">{user?.name || 'User'}</div>
                      <div className="text-sm text-gray-500">{user?.email || 'user@example.com'}</div>
                    </div>
                    <button 
                      className="block w-full text-left p-4 hover:bg-gray-500/10 flex items-center"
                      onClick={() => setActiveTab('dashboard')}
                    >
                      <Home className="w-4 h-4 mr-2" /> Dashboard
                    </button>
                    <button 
                      className="block w-full text-left p-4 hover:bg-gray-500/10 flex items-center"
                      onClick={() => setActiveTab('reports')}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> Reports
                    </button>
                    <button 
                      className="block w-full text-left p-4 hover:bg-gray-500/10 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left p-4 hover:bg-red-500/10 text-red-500 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`relative z-40 border-b ${darkMode ? 'border-white/10 bg-black/10' : 'border-gray-200/50 bg-white/30'} backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap space-x-1">
            {[
              { id: 'dashboard', label: 'Overview', icon: Eye, gradient: 'from-blue-500 to-cyan-500' },
              { id: 'add', label: 'Add Transaction', icon: PlusCircle, gradient: 'from-green-500 to-emerald-500' },
              { id: 'transactions', label: 'History', icon: Search, gradient: 'from-purple-500 to-pink-500' },
              { id: 'reconcile', label: 'Reconcile', icon: RefreshCw, gradient: 'from-yellow-500 to-orange-500' },
              { id: 'upload', label: 'Import CSV', icon: Upload, gradient: 'from-orange-500 to-red-500' },
              { id: 'reports', label: 'Reports', icon: BarChart3, gradient: 'from-indigo-500 to-blue-500' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-all duration-300 hover:scale-105 ${
                  activeTab === tab.id
                    ? `text-white`
                    : `${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                {activeTab === tab.id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-lg shadow-lg`}></div>
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Period Selector */}
            <div className={`p-4 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'} flex justify-between items-center`}>
              <h2 className="text-xl font-bold">Financial Overview</h2>
              <div className="flex items-center space-x-2">
                <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time Period:</span>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className={`px-4 py-2 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                    darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-gray-200'
                  }`}
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`group p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/70 border-white/50 hover:bg-white/90'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Total Income</p>
                    <p className="text-2xl font-bold text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                      ${summary.income.toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-400 mt-1">+12% this month</p>
                  </div>
                  <div className="relative">
                    <TrendingUp className="w-8 h-8 text-emerald-500 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-emerald-500 opacity-20 rounded-full blur group-hover:blur-lg transition-all duration-300"></div>
                  </div>
                </div>
              </div>

              <div className={`group p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/70 border-white/50 hover:bg-white/90'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Total Expenses</p>
                    <p className="text-2xl font-bold text-red-500 group-hover:scale-110 transition-transform duration-300">
                      ${summary.expenses.toFixed(2)}
                    </p>
                    <p className="text-xs text-red-400 mt-1">-8% this month</p>
                  </div>
                  <div className="relative">
                    <TrendingDown className="w-8 h-8 text-red-500 group-hover:-rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full blur group-hover:blur-lg transition-all duration-300"></div>
                  </div>
                </div>
              </div>

              <div className={`group p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/70 border-white/50 hover:bg-white/90'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${summary.balance >= 0 ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-orange-400' : 'text-orange-600')}`}>
                      Net Balance
                    </p>
                    <p className={`text-2xl font-bold group-hover:scale-110 transition-transform duration-300 ${summary.balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                      ${Math.abs(summary.balance).toFixed(2)}
                    </p>
                    <p className={`text-xs mt-1 ${summary.balance >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                      {summary.balance >= 0 ? 'Surplus' : 'Deficit'}
                    </p>
                  </div>
                  <div className="relative">
                    <Target className={`w-8 h-8 group-hover:rotate-45 transition-transform duration-300 ${summary.balance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                    <div className={`absolute inset-0 opacity-20 rounded-full blur group-hover:blur-lg transition-all duration-300 ${summary.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Area Chart */}
              <div className={`xl:col-span-2 p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Financial Flow</h3>
                  <div className="flex space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-sm">Income</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm">Expenses</span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGradient)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#expenseGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
                <h3 className="text-xl font-bold mb-6">Expense Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }} />
                    <RechartsPieChart data={pieData}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {pieData.slice(0, 5).map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="truncate">{entry.name}</span>
                      </div>
                      <span className="font-medium">${entry.value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Transaction Tab */}
        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto">
            <div className={`p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-lg shadow-green-500/25">
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Add New Transaction</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track your income and expenses</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                        darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                      }`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Type
                    </label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                        darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-gray-200'
                      }`}
                    >
                      <option value="expense">💸 Expense</option>
                      <option value="income">💰 Income</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <select
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                        darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-gray-200'
                      }`}
                    >
                      <option value="Food">🍔 Food</option>
                      <option value="Housing">🏠 Housing</option>
                      <option value="Transportation">🚗 Transportation</option>
                      <option value="Utilities">💡 Utilities</option>
                      <option value="Healthcare">🏥 Healthcare</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Education">🎓 Education</option>
                      <option value="Other">📦 Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amount ($)
                    </label>
                    <div className="relative">
                      <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input
                        type="number"
                        step="0.01"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                          darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                        }`}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTransaction.reason}
                    onChange={(e) => setNewTransaction({...newTransaction, reason: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                      darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                    }`}
                    placeholder="What was this transaction for?"
                    required
                  />
                </div>

                <button
                  onClick={addTransaction}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Transaction</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Enhanced Search and Filter */}
            <div className={`p-6 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                        darkMode ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
                
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                      darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-gray-200'
                    }`}
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income Only</option>
                    <option value="expense">Expenses Only</option>
                  </select>
                </div>
                
                <div>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 ${
                      darkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/80 border-gray-200'
                    }`}
                  >
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enhanced Transactions List */}
            <div className={`rounded-2xl backdrop-blur-xl border overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? 'bg-white/10' : 'bg-gray-50/80'}`}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Matched</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-white/10' : 'divide-gray-200/50'}`}>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className={`text-gray-400 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No transactions found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <tr key={transaction.id} className={`group hover:${darkMode ? 'bg-white/5' : 'bg-gray-50/50'} transition-all duration-200`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                              <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 group-hover:scale-105 ${
                              transaction.type === 'income' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {transaction.type === 'income' ? '💰' : '💸'} {transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="inline-flex items-center">
                              {transaction.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="max-w-xs">
                              <p className="font-medium truncate">{transaction.reason}</p>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right transition-all duration-200 group-hover:scale-110 ${
                            transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                            <span className="inline-flex items-center">
                              {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {transaction.matched ? (
                              <div className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500/20 rounded-full">
                                <Check className="w-4 h-4 text-emerald-500" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-6 h-6 bg-red-500/20 rounded-full">
                                <X className="w-4 h-4 text-red-500" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reconciliation Tab */}
        {activeTab === 'reconcile' && (
          <div className="space-y-8">
            <div className={`p-6 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Bank Reconciliation</h2>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Match your transactions with bank statements to ensure accuracy
                  </p>
                </div>
                <div className="flex space-x-3">
                  <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{unmatchedTransactions.length} unmatched transactions</span>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4" />
                      <span>{transactions.length - unmatchedTransactions.length} matched transactions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {discrepancies.length > 0 && (
              <div className={`p-6 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-100 border-red-200'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" /> Discrepancies Found
                </h3>
                <p className="mb-4">
                  We found {discrepancies.length} transactions where the recorded amount doesn't match your bank statement.
                </p>
                <div className="space-y-4">
                  {discrepancies.map((d, i) => (
                    <div key={i} className={`p-4 rounded-xl ${darkMode ? 'bg-red-500/20' : 'bg-red-50'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div>{d.date}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Description</div>
                          <div>{d.reason}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Your Record</div>
                          <div className="font-bold">${d.amount}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Bank Statement</div>
                          <div className="font-bold text-red-500">${d.bankAmount}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Unmatched Transactions */}
              <div className={`p-6 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-yellow-500" /> Unmatched Transactions
                  <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">{unmatchedTransactions.length}</span>
                </h3>
                
                {unmatchedTransactions.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-emerald-500 mb-4">
                      <CheckCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-lg font-medium">All transactions matched!</p>
                    <p className="text-sm text-gray-500">Your records are perfectly synced with your bank statement.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {unmatchedTransactions.map((t) => (
                      <div key={t.id} className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'} border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{t.reason}</div>
                            <div className="text-sm text-gray-500">{t.date}</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {t.type === 'income' ? '+' : '-'}${t.amount}
                            </div>
                            <div className="text-xs text-gray-500">{t.category}</div>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button 
                            onClick={() => markAsMatched(t.id)}
                            className="px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full text-sm flex items-center"
                          >
                            <Check className="w-4 h-4 mr-1" /> Mark as Matched
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Matching Visualization */}
              <div className={`p-6 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
                <h3 className="text-xl font-bold mb-4">Reconciliation Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                      <XAxis dataKey="month" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                      <Tooltip contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }} />
                      <Bar dataKey="income" fill="#10b981" barSize={20} />
                      <Bar dataKey="expenses" fill="#ef4444" barSize={20} />
                      <Scatter dataKey={(data) => data.income - data.expenses} fill="#6366f1" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <div className="text-2xl font-bold text-emerald-500">{transactions.filter(t => t.matched).length}</div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Matched</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50'}`}>
                    <div className="text-2xl font-bold text-yellow-500">{unmatchedTransactions.length}</div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Unmatched</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-red-500/10' : 'bg-red-50'}`}>
                    <div className="text-2xl font-bold text-red-500">{discrepancies.length}</div>
                    <p className="text-sm text-red-600 dark:text-red-400">Discrepancies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload CSV Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className={`p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'}`}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/25">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Import Bank Statement</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upload your CSV file to sync transactions</p>
              </div>
              
              <div className="space-y-6">
                <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 hover:border-violet-500 group ${darkMode ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-violet-50'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <Upload className={`w-16 h-16 mx-auto mb-4 transition-all duration-300 group-hover:scale-110 ${darkMode ? 'text-gray-400 group-hover:text-violet-400' : 'text-gray-400 group-hover:text-violet-500'}`} />
                    <p className={`text-xl font-bold mb-2 ${darkMode ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>
                      Drop your CSV file here
                    </p>
                    <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      or click to browse files
                    </p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={uploadFile}
                        className="hidden"
                        id="csv-upload"
                      />
                      <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-8 rounded-xl cursor-pointer hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 inline-flex items-center space-x-2">
                        <CreditCard className="w-5 h-5" />
                        <span>Choose File</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border-l-4 border-blue-500 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">CSV Format Requirements</h4>
                      <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                        <p>• <strong>date:</strong> YYYY-MM-DD format (e.g., 2024-01-15)</p>
                        <p>• <strong>amount:</strong> Numeric value (e.g., 150.00)</p>
                        <p>• <strong>reason:</strong> Description text (e.g., "Grocery shopping")</p>
                        <p>• <strong>type:</strong> Either "income" or "expense"</p>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-xs font-mono text-blue-700 dark:text-blue-300">
                          Example: date,amount,reason,type<br/>
                          2024-01-15,150.00,Grocery shopping,expense
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <div className="text-2xl font-bold text-emerald-500">✓</div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Auto-categorization</p>
                  </div>
                  <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                    <div className="text-2xl font-bold text-purple-500">⚡</div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Instant processing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className={`p-6 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div>
                <h2 className="text-2xl font-bold mb-2">Financial Reports</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Generate and download detailed financial reports
                </p>
              </div>
              <button
                onClick={() => downloadReport(generateReport())}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Generate & Download Report</span>
              </button>
            </div>
            
            {reports.length === 0 ? (
              <div className={`p-12 rounded-2xl backdrop-blur-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/50'} text-center`}>
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">No Reports Generated Yet</h3>
                <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Generate your first financial report to see detailed insights
                </p>
                <button
                  onClick={() => downloadReport(generateReport())}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 mx-auto"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Generate First Report</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report, index) => (
                  <div key={index} className={`p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/70 border-white/50 hover:bg-white/90'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">Financial Report #{report.id}</h3>
                        <p className="text-sm text-gray-500">{report.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-700'}`}>
                        {report.period.charAt(0).toUpperCase() + report.period.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Income:</span>
                        <span className="font-bold text-emerald-500">${report.income.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expenses:</span>
                        <span className="font-bold text-red-500">${report.expenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Balance:</span>
                        <span className={`font-bold ${report.balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          ${Math.abs(report.balance).toFixed(2)} {report.balance >= 0 ? 'Surplus' : 'Deficit'}
                        </span>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Top Categories:</div>
                        <div className="flex flex-wrap gap-2">
                          {report.topCategories.map((cat, i) => (
                            <span key={i} className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => downloadReport(report)}
                      className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2 px-4 rounded-xl font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Report</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setActiveTab('add')}
          className="group bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-110"
        >
          <PlusCircle className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

export default App;