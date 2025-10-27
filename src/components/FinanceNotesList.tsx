import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Lock, Users } from 'lucide-react';
import { FinanceNote } from '@/pages/Dashboard';
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

interface FinanceNotesListProps {
  notes: FinanceNote[];
  onEdit: (note: FinanceNote) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
}

export function FinanceNotesList({ notes, onEdit, onDelete, currentUserId }: FinanceNotesListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (notes.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            Belum ada catatan keuangan.<br />
            Klik tombol "Tambah Catatan" untuk memulai.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Daftar Catatan</h2>
      <div className="grid gap-4">
        {notes.map((note) => (
          <Card
            key={note.id}
            className={`shadow-lg hover:shadow-xl transition-all border-l-4 ${
              note.type === 'income'
                ? 'border-l-success bg-gradient-to-r from-success/5 to-transparent'
                : 'border-l-danger bg-gradient-to-r from-danger/5 to-transparent'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{note.title}</CardTitle>
                    {note.is_private ? (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Pribadi
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        Bersama
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(note.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(note)}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Catatan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Catatan akan dihapus secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(note.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-3xl font-bold ${
                      note.type === 'income' ? 'text-success' : 'text-danger'
                    }`}
                  >
                    {note.type === 'income' ? '+' : '-'} Rp {Number(note.amount).toLocaleString('id-ID')}
                  </p>
                  {note.description && (
                    <p className="text-sm text-muted-foreground mt-2">{note.description}</p>
                  )}
                </div>
                <Badge
                  variant={note.type === 'income' ? 'default' : 'destructive'}
                  className={note.type === 'income' ? 'bg-success hover:bg-success/90' : ''}
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
}
