import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Lock, Users } from 'lucide-react';
import { FinanceNote } from '@/pages/Dashboard';
import { PrivateCategory } from './PrivateCategoryManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface FinanceNotesListProps {
  notes: FinanceNote[];
  onEdit: (note: FinanceNote) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
  privateCategories: PrivateCategory[];
  showCategoryGrouping: boolean;
}

export function FinanceNotesList({ notes, onEdit, onDelete, currentUserId, privateCategories, showCategoryGrouping }: FinanceNotesListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Group notes by category (for private) or month (for shared)
  const groupedNotes = notes.reduce((groups, note) => {
    let groupKey: string;
    
    if (showCategoryGrouping && note.private_category_id) {
      // Group by category for private notes
      const category = privateCategories.find(c => c.id === note.private_category_id);
      groupKey = category ? category.name : 'Tanpa Kategori';
    } else {
      // Group by month for shared notes or uncategorized
      const transactionDate = note.transaction_date || note.created_at;
      groupKey = format(parseISO(transactionDate), 'MMMM yyyy', { locale: localeId });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(note);
    return groups;
  }, {} as Record<string, FinanceNote[]>);

  // Sort groups
  const sortedGroups = Object.keys(groupedNotes).sort((a, b) => {
    if (showCategoryGrouping) {
      // Sort alphabetically for categories
      return a.localeCompare(b, 'id-ID');
    } else {
      // Sort by date for months (newest first)
      const dateA = parseISO(groupedNotes[a][0].transaction_date || groupedNotes[a][0].created_at);
      const dateB = parseISO(groupedNotes[b][0].transaction_date || groupedNotes[b][0].created_at);
      return dateB.getTime() - dateA.getTime();
    }
  });

  if (notes.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm sm:text-base text-muted-foreground text-center">
            Belum ada catatan keuangan.<br />
            Klik tombol "Tambah Catatan" untuk memulai.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold">Daftar Catatan</h2>
      {sortedGroups.map((groupKey) => {
        const monthNotes = groupedNotes[groupKey];
        const totalIncome = monthNotes
          .filter(note => note.type === 'income')
          .reduce((sum, note) => sum + Number(note.amount), 0);
        const totalExpense = monthNotes
          .filter(note => note.type === 'expense')
          .reduce((sum, note) => sum + Number(note.amount), 0);

        return (
          <div key={groupKey} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-muted/50 p-3 sm:p-4 rounded-lg gap-2">
              <h3 className="text-lg sm:text-xl font-semibold capitalize">{groupKey}</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
                <span className="text-success font-medium">
                  Pemasukan: Rp {totalIncome.toLocaleString('id-ID')}
                </span>
                <span className="text-danger font-medium">
                  Pengeluaran: Rp {totalExpense.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:gap-4">
              {monthNotes.map((note) => (
                <Card
                  key={note.id}
                  className={`shadow-lg hover:shadow-xl transition-all border-l-4 ${
                    note.type === 'income'
                      ? 'border-l-success bg-gradient-to-r from-success/5 to-transparent'
                      : 'border-l-danger bg-gradient-to-r from-danger/5 to-transparent'
                  }`}
                >
                  <CardHeader className="pb-3 px-3 sm:px-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base sm:text-lg md:text-xl truncate">{note.title}</CardTitle>
                          {note.is_private ? (
                            <Badge variant="secondary" className="gap-1 text-xs flex-shrink-0">
                              <Lock className="h-3 w-3" />
                              <span className="hidden sm:inline">Pribadi</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-xs flex-shrink-0">
                              <Users className="h-3 w-3" />
                              <span className="hidden sm:inline">Bersama</span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDate(note.transaction_date || note.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(note)}
                          className="hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-destructive/10 hover:text-destructive h-8 w-8 sm:h-10 sm:w-10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Catatan?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Catatan akan dihapus secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(note.id)}
                                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                            note.type === 'income' ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {note.type === 'income' ? '+' : '-'} Rp {Number(note.amount).toLocaleString('id-ID')}
                        </p>
                        {note.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mt-2 break-words">{note.description}</p>
                        )}
                      </div>
                      <Badge
                        variant={note.type === 'income' ? 'default' : 'destructive'}
                        className={`flex-shrink-0 text-xs ${note.type === 'income' ? 'bg-success hover:bg-success/90' : ''}`}
                      >
                        {note.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
