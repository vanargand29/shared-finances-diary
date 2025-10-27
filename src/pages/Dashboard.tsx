import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { FinanceNoteDialog } from '@/components/FinanceNoteDialog';
import { FinanceNotesList } from '@/components/FinanceNotesList';

export interface FinanceNote {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  description: string | null;
  is_private: boolean;
  group_id: string | null;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<FinanceNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FinanceNote | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, navigate, authLoading]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data: notesData, error: fetchError } = await supabase
        .from('financial_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotes((notesData || []) as FinanceNote[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Gagal memuat catatan');
    } finally {
      setIsLoading(false);
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

  // Calculate totals
  const totalIncome = notes
    .filter(note => note.type === 'income')
    .reduce((sum, note) => sum + Number(note.amount), 0);

  const totalExpense = notes
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
              Selamat datang, <span className="font-semibold text-foreground">{user?.username}</span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-all"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-success">
                Total Pemasukan
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-danger">
                Total Pengeluaran
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                Saldo
              </CardTitle>
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

        {/* Add Note Button */}
        <div className="mb-6">
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Tambah Catatan
          </Button>
        </div>

        {/* Notes List */}
        <FinanceNotesList
          notes={notes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentUserId={user?.id || ''}
        />

        {/* Add/Edit Dialog */}
        <FinanceNoteDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          onSave={handleNoteSaved}
          editingNote={editingNote}
          userId={user?.id || ''}
        />
      </div>
    </div>
  );
};

export default Dashboard;
