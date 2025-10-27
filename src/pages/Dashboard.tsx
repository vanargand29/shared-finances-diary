import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Plus, TrendingDown, TrendingUp, Wallet, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { FinanceNoteDialog } from '@/components/FinanceNoteDialog';
import { FinanceNotesList } from '@/components/FinanceNotesList';
import { PrivateCategoryManager, PrivateCategory } from '@/components/PrivateCategoryManager';

export interface FinanceNote {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  is_private: boolean;
  group_id: string | null;
  private_category_id: string | null;
  transaction_date: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<FinanceNote[]>([]);
  const [privateCategories, setPrivateCategories] = useState<PrivateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FinanceNote | null>(null);
  const [activeTab, setActiveTab] = useState<'private' | 'shared'>('private');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchPrivateCategories();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data: notesData, error: fetchError } = await supabase
        .from('financial_notes')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (fetchError) throw fetchError;
      setNotes((notesData || []) as FinanceNote[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Gagal memuat catatan');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrivateCategories = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('private_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPrivateCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Berhasil logout');
  };

  const handleEdit = (note: FinanceNote) => {
    setEditingNote(note);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('financial_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Catatan berhasil dihapus');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Gagal menghapus catatan');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingNote(null);
  };

  const handleNoteSaved = () => {
    fetchNotes();
    handleDialogClose();
  };

  // Filter notes based on active tab and selected category
  const filteredNotes = notes.filter(note => {
    if (activeTab === 'private') {
      // Catatan pribadi: is_private = true DAN user_id = current user
      const isPrivateNote = note.is_private === true && note.user_id === user?.id;
      
      // Filter by category if selected
      if (selectedCategoryId === 'all') {
        return isPrivateNote;
      } else {
        return isPrivateNote && note.private_category_id === selectedCategoryId;
      }
    } else {
      // Catatan bersama: is_private = false
      return note.is_private === false;
    }
  });

  // Calculate totals based on filtered notes
  const totalIncome = filteredNotes
    .filter(note => note.type === 'income')
    .reduce((sum, note) => sum + Number(note.amount), 0);

  const totalExpense = filteredNotes
    .filter(note => note.type === 'expense')
    .reduce((sum, note) => sum + Number(note.amount), 0);

  const balance = totalIncome - totalExpense;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Catatan Keuangan
            </h1>
            <p className="text-muted-foreground mt-1">
              Selamat datang, <span className="font-semibold text-foreground">{user?.name || user?.username}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="gap-2 hover:bg-primary/10 hover:text-primary transition-all"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-success">
                  Total Pemasukan
                </CardTitle>
                {activeTab === 'private' && selectedCategoryId !== 'all' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {privateCategories.find(c => c.id === selectedCategoryId)?.name}
                  </p>
                )}
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                Rp {totalIncome.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-danger/10 to-danger/5 border-danger/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-danger">
                  Total Pengeluaran
                </CardTitle>
                {activeTab === 'private' && selectedCategoryId !== 'all' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {privateCategories.find(c => c.id === selectedCategoryId)?.name}
                  </p>
                )}
              </div>
              <TrendingDown className="h-5 w-5 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-danger">
                Rp {totalExpense.toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br shadow-lg hover:shadow-xl transition-shadow ${
            balance >= 0 
              ? 'from-primary/10 to-primary/5 border-primary/20' 
              : 'from-destructive/10 to-destructive/5 border-destructive/20'
          }`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Saldo
                </CardTitle>
                {activeTab === 'private' && selectedCategoryId !== 'all' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {privateCategories.find(c => c.id === selectedCategoryId)?.name}
                  </p>
                )}
              </div>
              <Wallet className={`h-5 w-5 ${balance >= 0 ? 'text-primary' : 'text-destructive'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                Rp {balance.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 ? 'Surplus' : 'Defisit'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Private/Shared */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'private' | 'shared')} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="private" className="gap-2">
              <User className="h-4 w-4" />
              Tabungan Pribadi
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <Users className="h-4 w-4" />
              Tabungan Bersama
            </TabsTrigger>
          </TabsList>

          <TabsContent value="private" className="space-y-6">
            {/* Private Category Manager */}
            <PrivateCategoryManager 
              userId={user?.id || ''} 
              onCategoriesChange={fetchPrivateCategories}
            />

            {/* Category Filter */}
            {privateCategories.length > 0 && (
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Filter Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategoryId === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategoryId('all')}
                      className="gap-2"
                    >
                      Semua Kategori
                    </Button>
                    {privateCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategoryId === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategoryId(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Note Button */}
            <div>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Tambah Catatan Pribadi
              </Button>
            </div>

            {/* Notes List */}
            <FinanceNotesList
              notes={filteredNotes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={user?.id || ''}
              privateCategories={privateCategories}
              showCategoryGrouping={selectedCategoryId === 'all'}
            />
          </TabsContent>

          <TabsContent value="shared" className="space-y-6">
            {/* Add Note Button */}
            <div>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Tambah Catatan Bersama
              </Button>
            </div>

            {/* Notes List */}
            <FinanceNotesList
              notes={filteredNotes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentUserId={user?.id || ''}
              privateCategories={[]}
              showCategoryGrouping={false}
            />
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <FinanceNoteDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          onSave={handleNoteSaved}
          editingNote={editingNote}
          userId={user?.id || ''}
          isPrivateMode={activeTab === 'private'}
          privateCategories={privateCategories}
        />
      </div>
    </div>
  );
};

export default Dashboard;
