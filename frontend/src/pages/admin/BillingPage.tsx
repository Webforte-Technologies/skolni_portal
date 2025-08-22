import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Plus, Eye, Download, Mail,  Building2, Calendar,  AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge, Input } from '../../components/ui';


interface Invoice {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  contactPerson: string;
  contactEmail: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod: string;
  items: InvoiceItem[];
  notes?: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    // Simulate API call for invoices data
    const fetchInvoices = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            invoiceNumber: 'INV-2024-001',
            schoolId: 'school1',
            schoolName: 'Gymnázium Jana Nerudy',
            contactPerson: 'Mgr. Jan Novák',
            contactEmail: 'novak@gymnazium-neruda.cz',
            amount: 2990,
            currency: 'CZK',
            status: 'paid',
            issueDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-31'),
            paidDate: new Date('2024-01-15'),
            paymentMethod: 'Bankovní převod',
            items: [
              { description: 'Premium plán - Leden 2024', quantity: 1, unitPrice: 2990, total: 2990 }
            ],
            notes: 'Platba přijata včas',
            taxRate: 21,
            subtotal: 2471.07,
            taxAmount: 518.93,
            totalAmount: 2990
          },
          {
            id: '2',
            invoiceNumber: 'INV-2024-002',
            schoolId: 'school2',
            schoolName: 'ZŠ TGM',
            contactPerson: 'Mgr. Marie Svobodová',
            contactEmail: 'svobodova@zs-tgm.cz',
            amount: 1490,
            currency: 'CZK',
            status: 'sent',
            issueDate: new Date('2024-01-15'),
            dueDate: new Date('2024-02-14'),
            paymentMethod: 'Kreditní karta',
            items: [
              { description: 'Základní plán - Únor 2024', quantity: 1, unitPrice: 1490, total: 1490 }
            ],
            notes: 'Čeká na platbu',
            taxRate: 21,
            subtotal: 1231.40,
            taxAmount: 258.60,
            totalAmount: 1490
          },
          {
            id: '3',
            invoiceNumber: 'INV-2024-003',
            schoolId: 'school3',
            schoolName: 'SŠ technická',
            contactPerson: 'Ing. Petr Černý',
            contactEmail: 'cerny@sst-technicka.cz',
            amount: 5990,
            currency: 'CZK',
            status: 'draft',
            issueDate: new Date('2024-01-20'),
            dueDate: new Date('2024-02-19'),
            paymentMethod: 'Faktura',
            items: [
              { description: 'Enterprise plán - Únor 2024', quantity: 1, unitPrice: 5990, total: 5990 }
            ],
            notes: 'Koncept faktury',
            taxRate: 21,
            subtotal: 4948.76,
            taxAmount: 1041.24,
            totalAmount: 5990
          },
          {
            id: '4',
            invoiceNumber: 'INV-2023-012',
            schoolId: 'school4',
            schoolName: 'ZŠ Komenského',
            contactPerson: 'Mgr. Anna Veselá',
            contactEmail: 'vesela@zs-komenskeho.cz',
            amount: 1490,
            currency: 'CZK',
            status: 'overdue',
            issueDate: new Date('2023-12-01'),
            dueDate: new Date('2023-12-31'),
            paymentMethod: 'Bankovní převod',
            items: [
              { description: 'Základní plán - Prosinec 2023', quantity: 1, unitPrice: 1490, total: 1490 }
            ],
            notes: 'Platba po splatnosti - nutné řešení',
            taxRate: 21,
            subtotal: 1231.40,
            taxAmount: 258.60,
            totalAmount: 1490
          },
          {
            id: '5',
            invoiceNumber: 'INV-2024-004',
            schoolId: 'school5',
            schoolName: 'Gymnázium Botičská',
            contactPerson: 'PhDr. Tomáš Malý',
            contactEmail: 'maly@gymnazium-boticka.cz',
            amount: 2990,
            currency: 'CZK',
            status: 'overdue',
            issueDate: new Date('2024-01-01'),
            dueDate: new Date('2024-01-31'),
            paymentMethod: 'Kreditní karta',
            items: [
              { description: 'Premium plán - Leden 2024', quantity: 1, unitPrice: 2990, total: 2990 }
            ],
            notes: 'Karta byla zamítnuta',
            taxRate: 21,
            subtotal: 2471.07,
            taxAmount: 518.93,
            totalAmount: 2990
          }
        ];
        setInvoices(mockInvoices);
        setLoading(false);
      }, 1000);
    };

    fetchInvoices();
  }, []);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusName = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'Zaplaceno';
      case 'sent':
        return 'Odesláno';
      case 'draft':
        return 'Koncept';
      case 'overdue':
        return 'Po splatnosti';
      case 'cancelled':
        return 'Zrušeno';
      default:
        return 'Neznámý';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  const getDaysOverdue = (dueDate: Date) => {
    const now = new Date();
    const diff = now.getTime() - dueDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const markAsPaid = (id: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, status: 'paid' as const, paidDate: new Date() }
          : invoice
      )
    );
  };

  const sendInvoice = (id: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, status: 'sent' as const }
          : invoice
      )
    );
  };

  const cancelInvoice = (id: string) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, status: 'cancelled' as const }
          : invoice
      )
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  };

  const deleteSelected = () => {
    setInvoices(prev => prev.filter(invoice => !selectedInvoices.includes(invoice.id)));
    setSelectedInvoices([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchQuery === '' || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'this-month' && invoice.issueDate.getMonth() === new Date().getMonth()) ||
      (dateFilter === 'last-month' && invoice.issueDate.getMonth() === new Date().getMonth() - 1) ||
      (dateFilter === 'overdue' && invoice.status === 'overdue');

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalAmount = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;

  // Add new invoice handler
  const handleAddInvoice = (invoiceData: Partial<Invoice>) => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      schoolId: invoiceData.schoolId || '',
      schoolName: invoiceData.schoolName || '',
      contactPerson: invoiceData.contactPerson || '',
      contactEmail: invoiceData.contactEmail || '',
      amount: invoiceData.amount || 0,
      currency: 'CZK',
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: 'Faktura',
      items: invoiceData.items || [],
      taxRate: 21,
      subtotal: 0,
      taxAmount: 0,
      totalAmount: invoiceData.amount || 0
    };
    
    setInvoices(prev => [newInvoice, ...prev]);
    setShowAddModal(false);
  };

  // Edit invoice handler
  

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání faktur...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Správa fakturace</h1>
            <p className="text-gray-600">Přehled a správa všech faktur a plateb</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nová faktura</span>
            </Button>
            {selectedInvoices.length > 0 && (
              <Button
              variant="danger"
              onClick={deleteSelected}
              className="flex items-center space-x-2"
            >
                <FileText className="w-4 h-4" />
                <span>Smazat vybrané ({selectedInvoices.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem faktur</p>
                <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zaplacené</p>
                <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
                <p className="text-sm text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající</p>
                <p className="text-2xl font-bold text-blue-600">
                  {invoices.filter(inv => inv.status === 'sent').length}
                </p>
                <p className="text-sm text-blue-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Po splatnosti</p>
                <p className="text-2xl font-bold text-red-600">{overdueInvoices}</p>
                <p className="text-sm text-red-600">{formatCurrency(overdueAmount)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtry:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny stavy</option>
                <option value="draft">Koncept</option>
                <option value="sent">Odesláno</option>
                <option value="paid">Zaplaceno</option>
                <option value="overdue">Po splatnosti</option>
                <option value="cancelled">Zrušeno</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechna data</option>
                <option value="this-month">Tento měsíc</option>
                <option value="last-month">Minulý měsíc</option>
                <option value="overdue">Po splatnosti</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat faktury..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(filteredInvoices.map(inv => inv.id));
                        } else {
                          setSelectedInvoices([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faktura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Škola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Částka
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platba
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => toggleSelection(invoice.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.items.length} položek
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.schoolName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {invoice.contactPerson}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        vč. DPH {invoice.taxRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getStatusColor(invoice.status)}>
                        {getStatusName(invoice.status)}
                      </Badge>
                      {invoice.status === 'overdue' && (
                        <div className="text-xs text-red-600 mt-1">
                          {getDaysOverdue(invoice.dueDate)} dní po splatnosti
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Vystaveno: {formatDate(invoice.issueDate)}</div>
                        <div className="text-blue-600">Splatnost: {formatDate(invoice.dueDate)}</div>
                        {invoice.paidDate && (
                          <div className="text-green-600">Zaplaceno: {formatDate(invoice.paidDate)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{invoice.paymentMethod}</div>
                        {invoice.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendInvoice(invoice.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        )}
                        {invoice.status === 'sent' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelInvoice(invoice.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => console.log(`Downloading invoice ${invoice.invoiceNumber}`)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Invoice Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Nová faktura</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Název školy"
                  onChange={() => {/* Handle input change */}}
                />
                <Input
                  placeholder="Kontaktní osoba"
                  onChange={() => {/* Handle input change */}}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  onChange={() => {/* Handle input change */}}
                />
                <Input
                  placeholder="Částka (CZK)"
                  type="number"
                  onChange={() => {/* Handle input change */}}
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <Button onClick={() => setShowAddModal(false)} variant="outline">
                  Zrušit
                </Button>
                <Button onClick={() => handleAddInvoice({})}>
                  Vytvořit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Invoice Modal */}
        {editingInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Upravit fakturu</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Číslo faktury
                  </label>
                  <div className="text-sm text-gray-900">{editingInvoice.invoiceNumber}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Škola
                  </label>
                  <div className="text-sm text-gray-900">{editingInvoice.schoolName}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Částka
                  </label>
                  <div className="text-sm text-gray-900">{editingInvoice.totalAmount} CZK</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="text-sm text-gray-900">{getStatusName(editingInvoice.status)}</div>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <Button onClick={() => setEditingInvoice(null)} variant="outline">
                  Zavřít
                </Button>
                <Button 
                  onClick={() => deleteInvoice(editingInvoice.id)}
                  variant="danger"
                >
                  Smazat
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BillingPage;
